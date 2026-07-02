const pool = require('../db/pool');

const WA_SELECT = `
  SELECT wa.wa_b_id, wa.wa_u_id, wa.wa_startTime,
         b.b_dateFrom, b.b_status,
         v.v_name, v.v_brand, v.v_imageURL,
         vt.vt_name,
         u.u_f_name, u.u_l_name
  FROM   Work_Assignments wa
  LEFT JOIN Bookings      b  ON wa.wa_b_id = b.b_id
  LEFT JOIN Vehicles      v  ON b.b_v_id   = v.v_id
  LEFT JOIN Vehicle_Types vt ON v.v_vt_id  = vt.vt_id
  LEFT JOIN Users         u  ON wa.wa_u_id = u.u_id
`;

// A booking only gets a Work_Assignments row once an employee is assigned
// (wa_u_id is NOT NULL there), so "available/unstaffed" means a booking with
// no matching row at all — found by joining the other way, from Bookings.
// This stays in sync with b_status because createWorkAssignment/
// deleteWorkAssignment below are the only two places that ever change either.
const AVAILABLE_SELECT = `
  SELECT b.b_id AS wa_b_id, NULL AS wa_u_id, NULL AS wa_startTime,
         b.b_dateFrom, b.b_timeStart, b.b_pickUpLocation, b.b_destination, b.b_status,
         v.v_name, v.v_brand, v.v_imageURL,
         vt.vt_name
  FROM   Bookings b
  LEFT JOIN Work_Assignments wa ON wa.wa_b_id = b.b_id
  LEFT JOIN Vehicles         v  ON b.b_v_id   = v.v_id
  LEFT JOIN Vehicle_Types    vt ON v.v_vt_id  = vt.vt_id
  WHERE  wa.wa_b_id IS NULL
`;

// GET /api/vcharter/workassignments  (?u_id=N for employee-scoped, ?available=true for unstaffed bookings)
const getWorkAssignments = async (req, res) => {
  try {
    const uId       = req.query.u_id       ? parseInt(req.query.u_id) : null;
    const available = req.query.available  === 'true';

    if (available) {
      const [rows] = await pool.query(AVAILABLE_SELECT + ' ORDER BY b.b_dateFrom');
      return res.json(rows);
    }

    let sql = WA_SELECT;
    const params = [];

    if (uId) {
      sql += ' WHERE wa.wa_u_id = ?';
      params.push(uId);
    }

    sql += ' ORDER BY b.b_dateFrom';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/vcharter/workassignments
// Assigning an employee to a booking is what moves it from pending to
// confirmed (see bookings.b_status). Employees can only ever assign
// themselves; only Admins may name a different employee. The customer gets
// an unread notification on their booking once it's confirmed.
const createWorkAssignment = async (req, res) => {
  try {
    const { wa_b_id, wa_startTime } = req.body;
    if (!wa_b_id || !wa_startTime) {
      return res.status(400).json({ error: 'wa_b_id and wa_startTime are required' });
    }

    const wa_u_id = req.user.ut_name === 'Admin'
      ? (req.body.wa_u_id || req.user.u_id)
      : req.user.u_id;

    await pool.query(
      'INSERT INTO Work_Assignments (wa_b_id, wa_u_id, wa_startTime) VALUES (?, ?, ?)',
      [wa_b_id, wa_u_id, wa_startTime]
    );
    await pool.query("UPDATE Bookings SET b_status = 'confirmed' WHERE b_id = ?", [wa_b_id]);
    await pool.query(
      'INSERT INTO Notifications (n_timestamp, n_status, n_b_id) VALUES (NOW(), 0, ?)',
      [wa_b_id]
    );

    const [rows] = await pool.query(WA_SELECT + ' WHERE wa.wa_b_id = ?', [wa_b_id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/vcharter/workassignments/:b_id  (reassign employee or update start time)
// Booking stays confirmed either way — it remains staffed.
const updateWorkAssignment = async (req, res) => {
  try {
    const { wa_u_id, wa_startTime } = req.body;
    const updates = [];
    const params  = [];

    if (wa_u_id      !== undefined) { updates.push('wa_u_id = ?');      params.push(wa_u_id); }
    if (wa_startTime !== undefined) { updates.push('wa_startTime = ?'); params.push(wa_startTime); }

    if (!updates.length) return res.status(400).json({ error: 'No fields to update' });

    params.push(req.params.b_id);
    await pool.query(`UPDATE Work_Assignments SET ${updates.join(', ')} WHERE wa_b_id = ?`, params);

    const [rows] = await pool.query(WA_SELECT + ' WHERE wa.wa_b_id = ?', [req.params.b_id]);
    if (!rows.length) return res.status(404).json({ error: 'Work assignment not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/vcharter/workassignments/:b_id
// Removing the only assignment un-staffs the booking again.
const deleteWorkAssignment = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Work_Assignments WHERE wa_b_id = ?', [req.params.b_id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Work assignment not found' });
    await pool.query("UPDATE Bookings SET b_status = 'pending' WHERE b_id = ?", [req.params.b_id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getWorkAssignments, createWorkAssignment, updateWorkAssignment, deleteWorkAssignment };

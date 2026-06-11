const pool = require('../db/pool');

const BOOKING_SELECT = `
  SELECT b.b_id, b.b_pickUpLocation, b.b_destination, b.b_dateFrom,
         b.b_timeStart, b.b_bookingTimestamp,
         b.b_u_id, b.b_v_id,
         u.u_f_name, u.u_l_name,
         v.v_name, v.v_brand,
         vt.vt_name
  FROM   Bookings b
  LEFT JOIN Users u        ON b.b_u_id = u.u_id
  LEFT JOIN Vehicles v     ON b.b_v_id = v.v_id
  LEFT JOIN Vehicle_Types vt ON v.v_vt_id = vt.vt_id
`;

// GET /api/vcharter/bookings  (optionally ?u_id=N for customer-scoped bookings)
const getBookings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || null;
    const page  = parseInt(req.query.page)  || 1;
    const uId   = req.query.u_id ? parseInt(req.query.u_id) : null;

    let sql = BOOKING_SELECT;
    const params = [];

    if (uId) {
      sql += ' WHERE b.b_u_id = ?';
      params.push(uId);
    }

    sql += ' ORDER BY b.b_id';

    if (limit) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(limit, (page - 1) * limit);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/vcharter/bookings/:id
const getBookingById = async (req, res) => {
  try {
    const [rows] = await pool.query(BOOKING_SELECT + ' WHERE b.b_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Booking not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/vcharter/bookings
const createBooking = async (req, res) => {
  try {
    const { b_pickUpLocation, b_destination, b_dateFrom, b_timeStart, b_u_id, b_v_id } = req.body;
    if (!b_dateFrom || !b_timeStart || !b_u_id || !b_v_id) {
      return res.status(400).json({ error: 'b_dateFrom, b_timeStart, b_u_id and b_v_id are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO Bookings (b_pickUpLocation, b_destination, b_dateFrom, b_timeStart, b_bookingTimestamp, b_u_id, b_v_id)
       VALUES (?, ?, ?, ?, NOW(), ?, ?)`,
      [b_pickUpLocation || null, b_destination || null, b_dateFrom, b_timeStart, b_u_id, b_v_id]
    );

    const [rows] = await pool.query(BOOKING_SELECT + ' WHERE b.b_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/vcharter/bookings/:id
const updateBooking = async (req, res) => {
  try {
    const fields = ['b_pickUpLocation', 'b_destination', 'b_dateFrom', 'b_timeStart', 'b_u_id', 'b_v_id'];
    const updates = [];
    const params  = [];

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        params.push(req.body[f]);
      }
    });

    // Always refresh bookingTimestamp on update
    updates.push('b_bookingTimestamp = NOW()');

    if (updates.length === 1) return res.status(400).json({ error: 'No fields to update' });

    params.push(req.params.id);
    await pool.query(`UPDATE Bookings SET ${updates.join(', ')} WHERE b_id = ?`, params);

    const [rows] = await pool.query(BOOKING_SELECT + ' WHERE b.b_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Booking not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/vcharter/bookings/:id
const deleteBooking = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Bookings WHERE b_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getBookings, getBookingById, createBooking, updateBooking, deleteBooking };

const pool = require('../db/pool');

const NOTIF_SELECT = `
  SELECT n.n_id, n.n_timestamp, n.n_status, n.n_b_id,
         b.b_pickUpLocation, b.b_destination, b.b_dateFrom, b.b_timeStart,
         v.v_name,
         vt.vt_name
  FROM   Notifications n
  LEFT JOIN Bookings      b  ON n.n_b_id  = b.b_id
  LEFT JOIN Vehicles      v  ON b.b_v_id  = v.v_id
  LEFT JOIN Vehicle_Types vt ON v.v_vt_id = vt.vt_id
`;

// GET /api/vcharter/notifications  (?unread=true, ?u_id=N for "my notifications")
const getNotifications = async (req, res) => {
  try {
    const unread = req.query.unread === 'true';
    const uId    = req.query.u_id ? parseInt(req.query.u_id) : null;

    let sql = NOTIF_SELECT;
    const params = [];
    const where  = [];

    // Customers/Employees can only ever see their own notifications,
    // regardless of query params — a notification is "theirs" if it's for a
    // booking they made (Customer) or a booking they're assigned to (Employee).
    if (req.user.ut_name === 'Customer') {
      where.push('b.b_u_id = ?');
      params.push(req.user.u_id);
    } else if (req.user.ut_name === 'Employee') {
      where.push('EXISTS (SELECT 1 FROM Work_Assignments wa2 WHERE wa2.wa_b_id = b.b_id AND wa2.wa_u_id = ?)');
      params.push(req.user.u_id);
    } else if (uId) {
      where.push('b.b_u_id = ?');
      params.push(uId);
    }
    if (unread) { where.push('n.n_status = 0'); }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');

    sql += ' ORDER BY n.n_timestamp DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/vcharter/notifications/:id
const getNotificationById = async (req, res) => {
  try {
    const [rows] = await pool.query(NOTIF_SELECT + ' WHERE n.n_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Notification not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/vcharter/notifications
const createNotification = async (req, res) => {
  try {
    const { n_status, n_b_id } = req.body;
    if (n_status === undefined || !n_b_id) {
      return res.status(400).json({ error: 'n_status and n_b_id are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO Notifications (n_timestamp, n_status, n_b_id) VALUES (NOW(), ?, ?)',
      [n_status, n_b_id]
    );

    const [rows] = await pool.query(NOTIF_SELECT + ' WHERE n.n_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/vcharter/notifications/:id  (mark as read etc.)
const updateNotification = async (req, res) => {
  try {
    const { n_status } = req.body;
    if (n_status === undefined) return res.status(400).json({ error: 'n_status is required' });

    await pool.query('UPDATE Notifications SET n_status = ? WHERE n_id = ?', [n_status, req.params.id]);

    const [rows] = await pool.query(NOTIF_SELECT + ' WHERE n.n_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Notification not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/vcharter/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Notifications WHERE n_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getNotifications, getNotificationById, createNotification, updateNotification, deleteNotification };

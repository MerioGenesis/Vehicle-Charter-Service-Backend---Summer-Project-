const bcrypt = require('bcrypt');
const pool   = require('../db/pool');

const SALT_ROUNDS = 10;

const USER_SELECT = `
  SELECT u.u_id, u.u_f_name, u.u_l_name, u.u_gender, u.u_dob,
         u.u_address, u.u_city, u.u_postcode, u.u_email, u.u_phone,
         u.u_ut_id, ut.ut_name AS userType
  FROM   Users u
  LEFT JOIN UserTypes ut ON u.u_ut_id = ut.ut_id
`;

// GET /api/vcharter/users  (optional ?ut_id=N filter, ?limit=N&page=N pagination)
//
// Route uses optionalAuth, not requireAuth: the login screen's "pick who you
// are" dropdown (see authController.contextLogin) calls this BEFORE the caller
// has a token, so it can't require one. Anonymous/non-staff callers get a
// minimal name-only projection (enough for that picker); Employee/Admin
// callers get the full record set.
const PUBLIC_USER_SELECT = `
  SELECT u.u_id, u.u_f_name, u.u_l_name, ut.ut_name AS userType
  FROM   Users u
  LEFT JOIN UserTypes ut ON u.u_ut_id = ut.ut_id
`;

const getUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || null;
    const page  = parseInt(req.query.page)  || 1;
    const utId  = req.query.ut_id ? parseInt(req.query.ut_id) : null;

    const isStaff = req.user && (req.user.ut_name === 'Employee' || req.user.ut_name === 'Admin');
    let sql = isStaff ? USER_SELECT : PUBLIC_USER_SELECT;
    const params = [];

    if (utId) {
      sql += ' WHERE u.u_ut_id = ?';
      params.push(utId);
    }

    sql += ' ORDER BY u.u_id';

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

// GET /api/vcharter/users/:id
const getUserById = async (req, res) => {
  try {
    const [rows] = await pool.query(USER_SELECT + ' WHERE u.u_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/vcharter/users  (also used as the customer registration endpoint)
const createUser = async (req, res) => {
  try {
    const { u_f_name, u_l_name, u_gender, u_dob, u_address, u_city, u_postcode, u_email, u_phone, u_password, u_ut_id } = req.body;
    if (!u_f_name || !u_l_name || !u_gender || !u_dob || !u_address || !u_city || !u_postcode || !u_email || !u_phone || !u_password) {
      return res.status(400).json({ error: 'All fields, including u_password, are required' });
    }
    if (u_password.length < 8) {
      return res.status(400).json({ error: 'u_password must be at least 8 characters' });
    }

    // Anonymous/self-registration is always a Customer account. Only an
    // authenticated Admin may create an Employee/Admin account directly.
    const isAdmin = req.user && req.user.ut_name === 'Admin';
    const roleId  = (isAdmin && u_ut_id) ? u_ut_id : 1;

    const hashedPassword = await bcrypt.hash(u_password, SALT_ROUNDS);

    const [result] = await pool.query(
      `INSERT INTO Users (u_f_name, u_l_name, u_gender, u_dob, u_address, u_city, u_postcode, u_email, u_phone, u_password, u_ut_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [u_f_name, u_l_name, u_gender, u_dob, u_address, u_city, u_postcode, u_email, u_phone, hashedPassword, roleId]
    );

    const [rows] = await pool.query(USER_SELECT + ' WHERE u.u_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/vcharter/users/:id
const updateUser = async (req, res) => {
  try {
    const fields = ['u_f_name', 'u_l_name', 'u_gender', 'u_dob', 'u_address', 'u_city', 'u_postcode', 'u_email', 'u_phone'];
    if (req.user.ut_name === 'Admin') fields.push('u_ut_id'); // only Admin may change roles
    const updates = [];
    const params  = [];

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        params.push(req.body[f]);
      }
    });

    if (req.body.u_password !== undefined) {
      if (req.body.u_password.length < 8) {
        return res.status(400).json({ error: 'u_password must be at least 8 characters' });
      }
      updates.push('u_password = ?');
      params.push(await bcrypt.hash(req.body.u_password, SALT_ROUNDS));
    }

    if (!updates.length) return res.status(400).json({ error: 'No fields to update' });

    params.push(req.params.id);
    await pool.query(`UPDATE Users SET ${updates.join(', ')} WHERE u_id = ?`, params);

    const [rows] = await pool.query(USER_SELECT + ' WHERE u.u_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/vcharter/users/:id
const deleteUser = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Users WHERE u_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };

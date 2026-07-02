const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const pool   = require('../db/pool');

const signToken = (user) =>
  jwt.sign(
    { u_id: user.u_id, u_ut_id: user.u_ut_id, ut_name: user.userType },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

// POST /api/vcharter/auth/login
const login = async (req, res) => {
  try {
    const { u_email, u_password } = req.body;
    if (!u_email || !u_password) {
      return res.status(400).json({ error: 'u_email and u_password are required' });
    }

    const [rows] = await pool.query(
      `SELECT u.u_id, u.u_f_name, u.u_l_name, u.u_email, u.u_phone, u.u_password,
              u.u_ut_id, ut.ut_name AS userType
       FROM   users u
       LEFT JOIN usertypes ut ON u.u_ut_id = ut.ut_id
       WHERE  u.u_email = ?`,
      [u_email]
    );

    const user = rows[0];
    if (!user || !user.u_password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(u_password, user.u_password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user);

    delete user.u_password;
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/vcharter/auth/context-login
// Issues a real session for an existing user with NO password check — picked
// by user type + name in the UI instead of typing credentials. Development/demo
// convenience only; the password-based /auth/login above is the real thing.
const contextLogin = async (req, res) => {
  try {
    const { u_id } = req.body;
    if (!u_id) return res.status(400).json({ error: 'u_id is required' });

    const [rows] = await pool.query(
      `SELECT u.u_id, u.u_f_name, u.u_l_name, u.u_email, u.u_phone,
              u.u_ut_id, ut.ut_name AS userType
       FROM   users u
       LEFT JOIN usertypes ut ON u.u_ut_id = ut.ut_id
       WHERE  u.u_id = ?`,
      [u_id]
    );

    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { login, contextLogin };

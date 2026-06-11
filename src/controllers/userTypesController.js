const pool = require('../db/pool');

const getUserTypes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM UserTypes ORDER BY ut_id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getUserTypeById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM UserTypes WHERE ut_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'User type not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getUserTypes, getUserTypeById };

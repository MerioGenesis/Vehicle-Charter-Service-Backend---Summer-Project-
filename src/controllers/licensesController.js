const pool = require('../db/pool');

// GET /api/vcharter/licenses
const getLicenses = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Licenses ORDER BY l_id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/vcharter/licenses/:id
const getLicenseById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Licenses WHERE l_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'License not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/vcharter/licenses
const createLicense = async (req, res) => {
  try {
    const { l_name } = req.body;
    if (!l_name) return res.status(400).json({ error: 'l_name is required' });

    const [result] = await pool.query('INSERT INTO Licenses (l_name) VALUES (?)', [l_name]);
    const [rows] = await pool.query('SELECT * FROM Licenses WHERE l_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getLicenses, getLicenseById, createLicense };

const pool = require('../db/pool');

// GET /api/vcharter/tests
const getTests = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Tests ORDER BY t_id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/vcharter/tests/:id
const getTestById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Tests WHERE t_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Test not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/vcharter/tests
const createTest = async (req, res) => {
  try {
    const { t_name } = req.body;
    if (!t_name) return res.status(400).json({ error: 't_name is required' });

    const [result] = await pool.query('INSERT INTO Tests (t_name) VALUES (?)', [t_name]);
    const [rows] = await pool.query('SELECT * FROM Tests WHERE t_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getTests, getTestById, createTest };

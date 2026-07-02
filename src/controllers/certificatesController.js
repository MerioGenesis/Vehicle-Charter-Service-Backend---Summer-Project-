const pool = require('../db/pool');

// GET /api/vcharter/certificates
const getCertificates = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Certificates ORDER BY c_id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/vcharter/certificates/:id
const getCertificateById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Certificates WHERE c_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Certificate not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/vcharter/certificates
const createCertificate = async (req, res) => {
  try {
    const { c_name } = req.body;
    if (!c_name) return res.status(400).json({ error: 'c_name is required' });

    const [result] = await pool.query('INSERT INTO Certificates (c_name) VALUES (?)', [c_name]);
    const [rows] = await pool.query('SELECT * FROM Certificates WHERE c_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getCertificates, getCertificateById, createCertificate };

const pool = require('../db/pool');

const getVehicleTypes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Vehicle_Types ORDER BY vt_id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getVehicleTypeById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Vehicle_Types WHERE vt_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Vehicle type not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getVehicleTypes, getVehicleTypeById };

const pool = require('../db/pool');

// GET /api/vcharter/vehicles  (with optional ?limit=N&page=N and ?vt_id=N filter)
const getVehicles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || null;
    const page  = parseInt(req.query.page)  || 1;
    const vtId  = req.query.vt_id ? parseInt(req.query.vt_id) : null;

    let sql = `
      SELECT v.v_id, v.v_name, v.v_brand, v.v_seatsNo, v.v_year,
             v.v_plate, v.v_imageURL, v.v_vt_id, vt.vt_name AS vehicleType
      FROM   Vehicles v
      LEFT JOIN Vehicle_Types vt ON v.v_vt_id = vt.vt_id
    `;
    const params = [];

    if (vtId) {
      sql += ' WHERE v.v_vt_id = ?';
      params.push(vtId);
    }

    sql += ' ORDER BY v.v_id';

    if (limit) {
      const offset = (page - 1) * limit;
      sql += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/vcharter/vehicles/:id
const getVehicleById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT v.v_id, v.v_name, v.v_brand, v.v_seatsNo, v.v_year,
              v.v_plate, v.v_imageURL, v.v_vt_id, vt.vt_name AS vehicleType
       FROM   Vehicles v
       LEFT JOIN Vehicle_Types vt ON v.v_vt_id = vt.vt_id
       WHERE  v.v_id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/vcharter/vehicles
const createVehicle = async (req, res) => {
  try {
    const { v_name, v_brand, v_seatsNo, v_year, v_plate, v_imageURL, v_vt_id } = req.body;
    if (!v_name || !v_brand || !v_seatsNo || !v_year || !v_plate || !v_imageURL || !v_vt_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO Vehicles (v_name, v_brand, v_seatsNo, v_year, v_plate, v_imageURL, v_vt_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [v_name, v_brand, v_seatsNo, v_year, v_plate, v_imageURL, v_vt_id]
    );

    const [rows] = await pool.query(
      `SELECT v.v_id, v.v_name, v.v_brand, v.v_seatsNo, v.v_year,
              v.v_plate, v.v_imageURL, v.v_vt_id, vt.vt_name AS vehicleType
       FROM   Vehicles v
       LEFT JOIN Vehicle_Types vt ON v.v_vt_id = vt.vt_id
       WHERE  v.v_id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/vcharter/vehicles/:id
const updateVehicle = async (req, res) => {
  try {
    const fields = ['v_name', 'v_brand', 'v_seatsNo', 'v_year', 'v_plate', 'v_imageURL', 'v_vt_id'];
    const updates = [];
    const params  = [];

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        params.push(req.body[f]);
      }
    });

    if (!updates.length) return res.status(400).json({ error: 'No fields to update' });

    params.push(req.params.id);
    await pool.query(`UPDATE Vehicles SET ${updates.join(', ')} WHERE v_id = ?`, params);

    const [rows] = await pool.query(
      `SELECT v.v_id, v.v_name, v.v_brand, v.v_seatsNo, v.v_year,
              v.v_plate, v.v_imageURL, v.v_vt_id, vt.vt_name AS vehicleType
       FROM   Vehicles v
       LEFT JOIN Vehicle_Types vt ON v.v_vt_id = vt.vt_id
       WHERE  v.v_id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/vcharter/vehicles/:id
const deleteVehicle = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Vehicles WHERE v_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Vehicle not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle };

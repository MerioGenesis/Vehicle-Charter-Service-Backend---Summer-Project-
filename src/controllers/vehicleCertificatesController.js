const pool = require('../db/pool');

// GET /api/vcharter/vehiclecertificates  (?v_id=N for vehicle-scoped)
const getVehicleCertificates = async (req, res) => {
  try {
    const vId = req.query.v_id ? parseInt(req.query.v_id) : null;

    let sql = `
      SELECT vc.vc_c_id, vc.vc_v_id, vc.vc_dateObtained,
             c.c_name,
             v.v_name, v.v_brand
      FROM   Vehicle_Certificates vc
      LEFT JOIN Certificates c ON vc.vc_c_id = c.c_id
      LEFT JOIN Vehicles     v ON vc.vc_v_id = v.v_id
    `;
    const params = [];

    if (vId) {
      sql += ' WHERE vc.vc_v_id = ?';
      params.push(vId);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/vcharter/vehiclecertificates
const createVehicleCertificate = async (req, res) => {
  try {
    const { vc_c_id, vc_v_id, vc_dateObtained } = req.body;
    if (!vc_c_id || !vc_v_id || !vc_dateObtained) {
      return res.status(400).json({ error: 'vc_c_id, vc_v_id and vc_dateObtained are required' });
    }

    await pool.query(
      'INSERT INTO Vehicle_Certificates (vc_c_id, vc_v_id, vc_dateObtained) VALUES (?, ?, ?)',
      [vc_c_id, vc_v_id, vc_dateObtained]
    );

    const [rows] = await pool.query(
      `SELECT vc.vc_c_id, vc.vc_v_id, vc.vc_dateObtained, c.c_name
       FROM Vehicle_Certificates vc LEFT JOIN Certificates c ON vc.vc_c_id = c.c_id
       WHERE vc.vc_c_id = ? AND vc.vc_v_id = ? AND vc.vc_dateObtained = ?`,
      [vc_c_id, vc_v_id, vc_dateObtained]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/vcharter/vehiclecertificates/:c_id/:v_id/:dateObtained
const deleteVehicleCertificate = async (req, res) => {
  try {
    const { c_id, v_id, dateObtained } = req.params;
    const [result] = await pool.query(
      'DELETE FROM Vehicle_Certificates WHERE vc_c_id = ? AND vc_v_id = ? AND vc_dateObtained = ?',
      [c_id, v_id, dateObtained]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getVehicleCertificates, createVehicleCertificate, deleteVehicleCertificate };

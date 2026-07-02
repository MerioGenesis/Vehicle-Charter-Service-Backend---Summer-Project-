const pool = require('../db/pool');

// GET /api/vcharter/licensesobtained  (?u_id=N for employee-scoped; Admin only, Employees always see their own)
const getLicensesObtained = async (req, res) => {
  try {
    let uId = req.query.u_id ? parseInt(req.query.u_id) : null;

    if (req.user.ut_name === 'Employee') uId = req.user.u_id;

    let sql = `
      SELECT lo.lo_u_id, lo.lo_l_id, lo.lo_expiryDate,
             l.l_name,
             u.u_f_name, u.u_l_name
      FROM   Licenses_Obtained lo
      LEFT JOIN Licenses l ON lo.lo_l_id = l.l_id
      LEFT JOIN Users    u ON lo.lo_u_id = u.u_id
    `;
    const params = [];

    if (uId) {
      sql += ' WHERE lo.lo_u_id = ?';
      params.push(uId);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/vcharter/licensesobtained
const createLicenseObtained = async (req, res) => {
  try {
    const { lo_l_id, lo_expiryDate } = req.body;
    if (!lo_l_id || !lo_expiryDate) {
      return res.status(400).json({ error: 'lo_l_id and lo_expiryDate are required' });
    }

    const lo_u_id = (req.user.ut_name === 'Admin' && req.body.lo_u_id) ? req.body.lo_u_id : req.user.u_id;

    await pool.query(
      'INSERT INTO Licenses_Obtained (lo_u_id, lo_l_id, lo_expiryDate) VALUES (?, ?, ?)',
      [lo_u_id, lo_l_id, lo_expiryDate]
    );

    const [rows] = await pool.query(
      `SELECT lo.lo_u_id, lo.lo_l_id, lo.lo_expiryDate, l.l_name
       FROM Licenses_Obtained lo LEFT JOIN Licenses l ON lo.lo_l_id = l.l_id
       WHERE lo.lo_u_id = ? AND lo.lo_l_id = ? AND lo.lo_expiryDate = ?`,
      [lo_u_id, lo_l_id, lo_expiryDate]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/vcharter/licensesobtained/:u_id/:l_id/:expiryDate  (update the expiry date)
const updateLicenseObtained = async (req, res) => {
  try {
    const { u_id, l_id, expiryDate } = req.params;
    const { lo_expiryDate } = req.body;
    if (!lo_expiryDate) return res.status(400).json({ error: 'lo_expiryDate is required' });

    const [result] = await pool.query(
      'UPDATE Licenses_Obtained SET lo_expiryDate = ? WHERE lo_u_id = ? AND lo_l_id = ? AND lo_expiryDate = ?',
      [lo_expiryDate, u_id, l_id, expiryDate]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Record not found' });

    const [rows] = await pool.query(
      `SELECT lo.lo_u_id, lo.lo_l_id, lo.lo_expiryDate, l.l_name
       FROM Licenses_Obtained lo LEFT JOIN Licenses l ON lo.lo_l_id = l.l_id
       WHERE lo.lo_u_id = ? AND lo.lo_l_id = ? AND lo.lo_expiryDate = ?`,
      [u_id, l_id, lo_expiryDate]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/vcharter/licensesobtained/:u_id/:l_id/:expiryDate
const deleteLicenseObtained = async (req, res) => {
  try {
    const { u_id, l_id, expiryDate } = req.params;
    const [result] = await pool.query(
      'DELETE FROM Licenses_Obtained WHERE lo_u_id = ? AND lo_l_id = ? AND lo_expiryDate = ?',
      [u_id, l_id, expiryDate]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getLicensesObtained, createLicenseObtained, updateLicenseObtained, deleteLicenseObtained };

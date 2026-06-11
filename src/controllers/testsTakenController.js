const pool = require('../db/pool');

// GET /api/vcharter/teststaken  (?u_id=N for employee-scoped)
const getTestsTaken = async (req, res) => {
  try {
    const uId = req.query.u_id ? parseInt(req.query.u_id) : null;

    let sql = `
      SELECT tt.tt_t_id, tt.tt_u_id, tt.tt_testDate, tt.tt_result,
             t.t_name,
             u.u_f_name, u.u_l_name
      FROM   Tests_Taken tt
      LEFT JOIN Tests t ON tt.tt_t_id = t.t_id
      LEFT JOIN Users u ON tt.tt_u_id = u.u_id
    `;
    const params = [];

    if (uId) {
      sql += ' WHERE tt.tt_u_id = ?';
      params.push(uId);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/vcharter/teststaken
const createTestTaken = async (req, res) => {
  try {
    const { tt_t_id, tt_u_id, tt_testDate, tt_result } = req.body;
    if (!tt_t_id || !tt_u_id || !tt_testDate || !tt_result) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    await pool.query(
      'INSERT INTO Tests_Taken (tt_t_id, tt_u_id, tt_testDate, tt_result) VALUES (?, ?, ?, ?)',
      [tt_t_id, tt_u_id, tt_testDate, tt_result]
    );

    const [rows] = await pool.query(
      `SELECT tt.tt_t_id, tt.tt_u_id, tt.tt_testDate, tt.tt_result, t.t_name
       FROM Tests_Taken tt LEFT JOIN Tests t ON tt.tt_t_id = t.t_id
       WHERE tt.tt_t_id = ? AND tt.tt_u_id = ? AND tt.tt_testDate = ?`,
      [tt_t_id, tt_u_id, tt_testDate]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/vcharter/teststaken/:t_id/:u_id/:testDate
const deleteTestTaken = async (req, res) => {
  try {
    const { t_id, u_id, testDate } = req.params;
    const [result] = await pool.query(
      'DELETE FROM Tests_Taken WHERE tt_t_id = ? AND tt_u_id = ? AND tt_testDate = ?',
      [t_id, u_id, testDate]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getTestsTaken, createTestTaken, deleteTestTaken };

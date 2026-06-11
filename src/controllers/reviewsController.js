const pool = require('../db/pool');

const REVIEW_SELECT = `
  SELECT r.r_id, r.r_content, r.r_rating, r.r_timestamp, r.r_u_id,
         u.u_f_name, u.u_l_name
  FROM   Reviews r
  LEFT JOIN Users u ON r.r_u_id = u.u_id
`;

// GET /api/vcharter/reviews
const getReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || null;
    const page  = parseInt(req.query.page)  || 1;

    let sql = REVIEW_SELECT + ' ORDER BY r.r_timestamp DESC';
    const params = [];

    if (limit) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(limit, (page - 1) * limit);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/vcharter/reviews/:id
const getReviewById = async (req, res) => {
  try {
    const [rows] = await pool.query(REVIEW_SELECT + ' WHERE r.r_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Review not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/vcharter/reviews
const createReview = async (req, res) => {
  try {
    const { r_content, r_rating, r_u_id } = req.body;
    if (!r_content || r_rating === undefined || !r_u_id) {
      return res.status(400).json({ error: 'r_content, r_rating and r_u_id are required' });
    }
    if (r_rating < 1 || r_rating > 5) {
      return res.status(400).json({ error: 'r_rating must be between 1 and 5' });
    }

    const [result] = await pool.query(
      'INSERT INTO Reviews (r_content, r_rating, r_timestamp, r_u_id) VALUES (?, ?, NOW(), ?)',
      [r_content, r_rating, r_u_id]
    );

    const [rows] = await pool.query(REVIEW_SELECT + ' WHERE r.r_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/vcharter/reviews/:id
const updateReview = async (req, res) => {
  try {
    const { r_content, r_rating } = req.body;
    const updates = [];
    const params  = [];

    if (r_content !== undefined) { updates.push('r_content = ?'); params.push(r_content); }
    if (r_rating  !== undefined) {
      if (r_rating < 1 || r_rating > 5) return res.status(400).json({ error: 'r_rating must be between 1 and 5' });
      updates.push('r_rating = ?');
      params.push(r_rating);
    }

    if (!updates.length) return res.status(400).json({ error: 'No fields to update' });

    params.push(req.params.id);
    await pool.query(`UPDATE Reviews SET ${updates.join(', ')} WHERE r_id = ?`, params);

    const [rows] = await pool.query(REVIEW_SELECT + ' WHERE r.r_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Review not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/vcharter/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Reviews WHERE r_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getReviews, getReviewById, createReview, updateReview, deleteReview };

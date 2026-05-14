const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countQ = await pool.query('SELECT COUNT(*) FROM lessons');
    const total = parseInt(countQ.rows[0].count);
    const result = await pool.query('SELECT * FROM lessons ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lessons WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { lesson_type, skill_level, instructor_name, guest_name, guest_count, scheduled_date, start_time, duration, price, status, meeting_point } = req.body;
    const result = await pool.query(
      'INSERT INTO lessons (lesson_type, skill_level, instructor_name, guest_name, guest_count, scheduled_date, start_time, duration, price, status, meeting_point) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
      [lesson_type, skill_level, instructor_name, guest_name, guest_count, scheduled_date, start_time, duration, price, status, meeting_point]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { lesson_type, skill_level, instructor_name, guest_name, guest_count, scheduled_date, start_time, duration, price, status, meeting_point } = req.body;
    const result = await pool.query(
      'UPDATE lessons SET lesson_type=$1, skill_level=$2, instructor_name=$3, guest_name=$4, guest_count=$5, scheduled_date=$6, start_time=$7, duration=$8, price=$9, status=$10, meeting_point=$11 WHERE id=$12 RETURNING *',
      [lesson_type, skill_level, instructor_name, guest_name, guest_count, scheduled_date, start_time, duration, price, status, meeting_point, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM lessons WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

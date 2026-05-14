const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countQ = await pool.query('SELECT COUNT(*) FROM instructors');
    const total = parseInt(countQ.rows[0].count);
    const result = await pool.query('SELECT * FROM instructors ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM instructors WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, specialization, certification_level, languages, availability, hourly_rate, rating, years_experience, phone } = req.body;
    const result = await pool.query(
      'INSERT INTO instructors (name, specialization, certification_level, languages, availability, hourly_rate, rating, years_experience, phone) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [name, specialization, certification_level, languages, availability, hourly_rate, rating, years_experience, phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, specialization, certification_level, languages, availability, hourly_rate, rating, years_experience, phone } = req.body;
    const result = await pool.query(
      'UPDATE instructors SET name=$1, specialization=$2, certification_level=$3, languages=$4, availability=$5, hourly_rate=$6, rating=$7, years_experience=$8, phone=$9 WHERE id=$10 RETURNING *',
      [name, specialization, certification_level, languages, availability, hourly_rate, rating, years_experience, phone, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM instructors WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

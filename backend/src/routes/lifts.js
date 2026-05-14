const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countQ = await pool.query('SELECT COUNT(*) FROM lifts');
    const total = parseInt(countQ.rows[0].count);
    const result = await pool.query('SELECT * FROM lifts ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lifts WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, type, capacity, status, wait_time, vertical_rise, length, speed, last_maintenance } = req.body;
    const result = await pool.query(
      'INSERT INTO lifts (name, type, capacity, status, wait_time, vertical_rise, length, speed, last_maintenance) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [name, type, capacity, status, wait_time, vertical_rise, length, speed, last_maintenance]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, type, capacity, status, wait_time, vertical_rise, length, speed, last_maintenance } = req.body;
    const result = await pool.query(
      'UPDATE lifts SET name=$1, type=$2, capacity=$3, status=$4, wait_time=$5, vertical_rise=$6, length=$7, speed=$8, last_maintenance=$9 WHERE id=$10 RETURNING *',
      [name, type, capacity, status, wait_time, vertical_rise, length, speed, last_maintenance, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM lifts WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

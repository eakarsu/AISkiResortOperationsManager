const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countQ = await pool.query('SELECT COUNT(*) FROM rental_inventory');
    const total = parseInt(countQ.rows[0].count);
    const result = await pool.query('SELECT * FROM rental_inventory ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rental_inventory WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { item_type, brand, model, size, condition, status, daily_rate, last_serviced } = req.body;
    const result = await pool.query(
      'INSERT INTO rental_inventory (item_type, brand, model, size, condition, status, daily_rate, last_serviced) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [item_type, brand, model, size, condition, status, daily_rate, last_serviced]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { item_type, brand, model, size, condition, status, daily_rate, last_serviced } = req.body;
    const result = await pool.query(
      'UPDATE rental_inventory SET item_type=$1, brand=$2, model=$3, size=$4, condition=$5, status=$6, daily_rate=$7, last_serviced=$8 WHERE id=$9 RETURNING *',
      [item_type, brand, model, size, condition, status, daily_rate, last_serviced, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM rental_inventory WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

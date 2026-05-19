const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countQ = await pool.query('SELECT COUNT(*) FROM food_beverage');
    const total = parseInt(countQ.rows[0].count);
    const result = await pool.query('SELECT * FROM food_beverage ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM food_beverage WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { outlet_name, location, cuisine_type, capacity, current_occupancy, status, opening_time, closing_time, avg_price, menu_highlights } = req.body;
    const result = await pool.query(
      'INSERT INTO food_beverage (outlet_name, location, cuisine_type, capacity, current_occupancy, status, opening_time, closing_time, avg_price, menu_highlights) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [outlet_name, location, cuisine_type, capacity, current_occupancy, status, opening_time, closing_time, avg_price, menu_highlights]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { outlet_name, location, cuisine_type, capacity, current_occupancy, status, opening_time, closing_time, avg_price, menu_highlights } = req.body;
    const result = await pool.query(
      'UPDATE food_beverage SET outlet_name=$1, location=$2, cuisine_type=$3, capacity=$4, current_occupancy=$5, status=$6, opening_time=$7, closing_time=$8, avg_price=$9, menu_highlights=$10 WHERE id=$11 RETURNING *',
      [outlet_name, location, cuisine_type, capacity, current_occupancy, status, opening_time, closing_time, avg_price, menu_highlights, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM food_beverage WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

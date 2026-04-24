const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM food_beverage ORDER BY created_at DESC';
    let params = [];
    if (search) {
      query = 'SELECT * FROM food_beverage WHERE outlet_name ILIKE $1 OR cuisine_type ILIKE $1 ORDER BY created_at DESC';
      params = [`%${search}%`];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM food_beverage WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { outlet_name, location, cuisine_type, capacity, current_occupancy, status, opening_time, closing_time, avg_price, menu_highlights } = req.body;
    const result = await pool.query(
      'INSERT INTO food_beverage (outlet_name, location, cuisine_type, capacity, current_occupancy, status, opening_time, closing_time, avg_price, menu_highlights) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [outlet_name, location, cuisine_type, capacity, current_occupancy, status, opening_time, closing_time, avg_price, menu_highlights]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { outlet_name, location, cuisine_type, capacity, current_occupancy, status, opening_time, closing_time, avg_price, menu_highlights } = req.body;
    const result = await pool.query(
      'UPDATE food_beverage SET outlet_name = $1, location = $2, cuisine_type = $3, capacity = $4, current_occupancy = $5, status = $6, opening_time = $7, closing_time = $8, avg_price = $9, menu_highlights = $10 WHERE id = $11 RETURNING *',
      [outlet_name, location, cuisine_type, capacity, current_occupancy, status, opening_time, closing_time, avg_price, menu_highlights, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM food_beverage WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

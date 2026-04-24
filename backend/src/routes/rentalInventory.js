const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM rental_inventory ORDER BY created_at DESC';
    let params = [];
    if (search) {
      query = 'SELECT * FROM rental_inventory WHERE item_type ILIKE $1 OR brand ILIKE $1 ORDER BY created_at DESC';
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
    const result = await pool.query('SELECT * FROM rental_inventory WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { item_type, brand, model, size, condition, status, daily_rate, last_serviced } = req.body;
    const result = await pool.query(
      'INSERT INTO rental_inventory (item_type, brand, model, size, condition, status, daily_rate, last_serviced) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [item_type, brand, model, size, condition, status, daily_rate, last_serviced]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { item_type, brand, model, size, condition, status, daily_rate, last_serviced } = req.body;
    const result = await pool.query(
      'UPDATE rental_inventory SET item_type = $1, brand = $2, model = $3, size = $4, condition = $5, status = $6, daily_rate = $7, last_serviced = $8 WHERE id = $9 RETURNING *',
      [item_type, brand, model, size, condition, status, daily_rate, last_serviced, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM rental_inventory WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

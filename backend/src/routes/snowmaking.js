const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM snowmaking_ops ORDER BY created_at DESC';
    let params = [];
    if (search) {
      query = 'SELECT * FROM snowmaking_ops WHERE trail_name ILIKE $1 ORDER BY created_at DESC';
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
    const result = await pool.query('SELECT * FROM snowmaking_ops WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { trail_name, gun_type, status, water_usage, energy_usage, temperature, humidity, start_time, end_time } = req.body;
    const result = await pool.query(
      'INSERT INTO snowmaking_ops (trail_name, gun_type, status, water_usage, energy_usage, temperature, humidity, start_time, end_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [trail_name, gun_type, status, water_usage, energy_usage, temperature, humidity, start_time, end_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { trail_name, gun_type, status, water_usage, energy_usage, temperature, humidity, start_time, end_time } = req.body;
    const result = await pool.query(
      'UPDATE snowmaking_ops SET trail_name = $1, gun_type = $2, status = $3, water_usage = $4, energy_usage = $5, temperature = $6, humidity = $7, start_time = $8, end_time = $9 WHERE id = $10 RETURNING *',
      [trail_name, gun_type, status, water_usage, energy_usage, temperature, humidity, start_time, end_time, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM snowmaking_ops WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

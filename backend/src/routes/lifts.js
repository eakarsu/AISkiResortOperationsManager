const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM lifts ORDER BY created_at DESC';
    let params = [];
    if (search) {
      query = 'SELECT * FROM lifts WHERE name ILIKE $1 ORDER BY created_at DESC';
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
    const result = await pool.query('SELECT * FROM lifts WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, type, capacity, status, wait_time, vertical_rise, length, speed, last_maintenance } = req.body;
    const result = await pool.query(
      'INSERT INTO lifts (name, type, capacity, status, wait_time, vertical_rise, length, speed, last_maintenance) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [name, type, capacity, status, wait_time, vertical_rise, length, speed, last_maintenance]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, type, capacity, status, wait_time, vertical_rise, length, speed, last_maintenance } = req.body;
    const result = await pool.query(
      'UPDATE lifts SET name = $1, type = $2, capacity = $3, status = $4, wait_time = $5, vertical_rise = $6, length = $7, speed = $8, last_maintenance = $9 WHERE id = $10 RETURNING *',
      [name, type, capacity, status, wait_time, vertical_rise, length, speed, last_maintenance, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM lifts WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

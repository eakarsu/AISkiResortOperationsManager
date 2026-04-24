const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM trails ORDER BY created_at DESC';
    let params = [];
    if (search) {
      query = 'SELECT * FROM trails WHERE name ILIKE $1 ORDER BY created_at DESC';
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
    const result = await pool.query('SELECT * FROM trails WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, difficulty, status, grooming_status, length, vertical_drop, snowfall_last24h, conditions, last_groomed } = req.body;
    const result = await pool.query(
      'INSERT INTO trails (name, difficulty, status, grooming_status, length, vertical_drop, snowfall_last24h, conditions, last_groomed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [name, difficulty, status, grooming_status, length, vertical_drop, snowfall_last24h, conditions, last_groomed]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, difficulty, status, grooming_status, length, vertical_drop, snowfall_last24h, conditions, last_groomed } = req.body;
    const result = await pool.query(
      'UPDATE trails SET name = $1, difficulty = $2, status = $3, grooming_status = $4, length = $5, vertical_drop = $6, snowfall_last24h = $7, conditions = $8, last_groomed = $9 WHERE id = $10 RETURNING *',
      [name, difficulty, status, grooming_status, length, vertical_drop, snowfall_last24h, conditions, last_groomed, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM trails WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

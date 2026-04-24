const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM terrain_park_features ORDER BY created_at DESC';
    let params = [];
    if (search) {
      query = 'SELECT * FROM terrain_park_features WHERE feature_name ILIKE $1 OR feature_type ILIKE $1 ORDER BY created_at DESC';
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
    const result = await pool.query('SELECT * FROM terrain_park_features WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { feature_name, feature_type, size, difficulty, status, location, last_inspected, inspector, condition } = req.body;
    const result = await pool.query(
      'INSERT INTO terrain_park_features (feature_name, feature_type, size, difficulty, status, location, last_inspected, inspector, condition) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [feature_name, feature_type, size, difficulty, status, location, last_inspected, inspector, condition]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { feature_name, feature_type, size, difficulty, status, location, last_inspected, inspector, condition } = req.body;
    const result = await pool.query(
      'UPDATE terrain_park_features SET feature_name = $1, feature_type = $2, size = $3, difficulty = $4, status = $5, location = $6, last_inspected = $7, inspector = $8, condition = $9 WHERE id = $10 RETURNING *',
      [feature_name, feature_type, size, difficulty, status, location, last_inspected, inspector, condition, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM terrain_park_features WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

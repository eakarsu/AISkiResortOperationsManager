const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    let baseQuery = 'FROM snow_reports';
    let params = [];
    if (search) { baseQuery += ' WHERE conditions ILIKE $1'; params = [`%${search}%`]; }
    const countQ = await pool.query(`SELECT COUNT(*) ${baseQuery}`, params);
    const total = parseInt(countQ.rows[0].count);
    params.push(limit, offset);
    const dataQ = await pool.query(`SELECT * ${baseQuery} ORDER BY created_at DESC LIMIT $${params.length-1} OFFSET $${params.length}`, params);
    res.json({ data: dataQ.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM snow_reports WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { report_date, new_snow, base_depth, conditions, temperature_high, temperature_low, wind_speed, wind_direction, visibility, trails_open, lifts_open, published } = req.body;
    const result = await pool.query(
      'INSERT INTO snow_reports (report_date, new_snow, base_depth, conditions, temperature_high, temperature_low, wind_speed, wind_direction, visibility, trails_open, lifts_open, published) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [report_date, new_snow, base_depth, conditions, temperature_high, temperature_low, wind_speed, wind_direction, visibility, trails_open, lifts_open, published]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { report_date, new_snow, base_depth, conditions, temperature_high, temperature_low, wind_speed, wind_direction, visibility, trails_open, lifts_open, published } = req.body;
    const result = await pool.query(
      'UPDATE snow_reports SET report_date = $1, new_snow = $2, base_depth = $3, conditions = $4, temperature_high = $5, temperature_low = $6, wind_speed = $7, wind_direction = $8, visibility = $9, trails_open = $10, lifts_open = $11, published = $12 WHERE id = $13 RETURNING *',
      [report_date, new_snow, base_depth, conditions, temperature_high, temperature_low, wind_speed, wind_direction, visibility, trails_open, lifts_open, published, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM snow_reports WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

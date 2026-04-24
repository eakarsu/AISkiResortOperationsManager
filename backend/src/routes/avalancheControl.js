const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM avalanche_control ORDER BY created_at DESC';
    let params = [];
    if (search) {
      query = 'SELECT * FROM avalanche_control WHERE zone_name ILIKE $1 OR team_lead ILIKE $1 ORDER BY created_at DESC';
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
    const result = await pool.query('SELECT * FROM avalanche_control WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { zone_name, risk_level, control_method, team_lead, team_size, start_time, end_time, result: opResult, weather_conditions, status } = req.body;
    const dbResult = await pool.query(
      'INSERT INTO avalanche_control (zone_name, risk_level, control_method, team_lead, team_size, start_time, end_time, result, weather_conditions, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [zone_name, risk_level, control_method, team_lead, team_size, start_time, end_time, opResult, weather_conditions, status]
    );
    res.status(201).json(dbResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { zone_name, risk_level, control_method, team_lead, team_size, start_time, end_time, result: opResult, weather_conditions, status } = req.body;
    const dbResult = await pool.query(
      'UPDATE avalanche_control SET zone_name = $1, risk_level = $2, control_method = $3, team_lead = $4, team_size = $5, start_time = $6, end_time = $7, result = $8, weather_conditions = $9, status = $10 WHERE id = $11 RETURNING *',
      [zone_name, risk_level, control_method, team_lead, team_size, start_time, end_time, opResult, weather_conditions, status, req.params.id]
    );
    if (dbResult.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(dbResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM avalanche_control WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

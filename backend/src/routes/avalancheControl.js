const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countQ = await pool.query('SELECT COUNT(*) FROM avalanche_control');
    const total = parseInt(countQ.rows[0].count);
    const result = await pool.query('SELECT * FROM avalanche_control ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM avalanche_control WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { zone_name, risk_level, control_method, team_lead, team_size, start_time, end_time, result: opResult, weather_conditions, status } = req.body;
    const dbResult = await pool.query(
      'INSERT INTO avalanche_control (zone_name, risk_level, control_method, team_lead, team_size, start_time, end_time, result, weather_conditions, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [zone_name, risk_level, control_method, team_lead, team_size, start_time, end_time, opResult, weather_conditions, status]
    );
    res.status(201).json(dbResult.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { zone_name, risk_level, control_method, team_lead, team_size, start_time, end_time, result: opResult, weather_conditions, status } = req.body;
    const dbResult = await pool.query(
      'UPDATE avalanche_control SET zone_name=$1, risk_level=$2, control_method=$3, team_lead=$4, team_size=$5, start_time=$6, end_time=$7, result=$8, weather_conditions=$9, status=$10 WHERE id=$11 RETURNING *',
      [zone_name, risk_level, control_method, team_lead, team_size, start_time, end_time, opResult, weather_conditions, status, req.params.id]
    );
    if (dbResult.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(dbResult.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM avalanche_control WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

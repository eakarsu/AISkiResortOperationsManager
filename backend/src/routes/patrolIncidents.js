const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countQ = await pool.query('SELECT COUNT(*) FROM patrol_incidents');
    const total = parseInt(countQ.rows[0].count);
    const result = await pool.query('SELECT * FROM patrol_incidents ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patrol_incidents WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { incident_type, location, severity, description, patroller_name, guest_name, guest_age, status, reported_at, resolved_at } = req.body;
    const result = await pool.query(
      'INSERT INTO patrol_incidents (incident_type, location, severity, description, patroller_name, guest_name, guest_age, status, reported_at, resolved_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [incident_type, location, severity, description, patroller_name, guest_name, guest_age, status, reported_at, resolved_at]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { incident_type, location, severity, description, patroller_name, guest_name, guest_age, status, reported_at, resolved_at } = req.body;
    const result = await pool.query(
      'UPDATE patrol_incidents SET incident_type=$1, location=$2, severity=$3, description=$4, patroller_name=$5, guest_name=$6, guest_age=$7, status=$8, reported_at=$9, resolved_at=$10 WHERE id=$11 RETURNING *',
      [incident_type, location, severity, description, patroller_name, guest_name, guest_age, status, reported_at, resolved_at, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM patrol_incidents WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM patrol_incidents ORDER BY created_at DESC';
    let params = [];
    if (search) {
      query = 'SELECT * FROM patrol_incidents WHERE location ILIKE $1 OR guest_name ILIKE $1 ORDER BY created_at DESC';
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
    const result = await pool.query('SELECT * FROM patrol_incidents WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { incident_type, location, severity, description, patroller_name, guest_name, guest_age, status, reported_at, resolved_at } = req.body;
    const result = await pool.query(
      'INSERT INTO patrol_incidents (incident_type, location, severity, description, patroller_name, guest_name, guest_age, status, reported_at, resolved_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [incident_type, location, severity, description, patroller_name, guest_name, guest_age, status, reported_at, resolved_at]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { incident_type, location, severity, description, patroller_name, guest_name, guest_age, status, reported_at, resolved_at } = req.body;
    const result = await pool.query(
      'UPDATE patrol_incidents SET incident_type = $1, location = $2, severity = $3, description = $4, patroller_name = $5, guest_name = $6, guest_age = $7, status = $8, reported_at = $9, resolved_at = $10 WHERE id = $11 RETURNING *',
      [incident_type, location, severity, description, patroller_name, guest_name, guest_age, status, reported_at, resolved_at, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM patrol_incidents WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

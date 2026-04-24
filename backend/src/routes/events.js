const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM events ORDER BY created_at DESC';
    let params = [];
    if (search) {
      query = 'SELECT * FROM events WHERE event_name ILIKE $1 OR event_type ILIKE $1 ORDER BY created_at DESC';
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
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { event_name, event_type, description, location, start_date, end_date, capacity, registered, price, status, organizer } = req.body;
    const result = await pool.query(
      'INSERT INTO events (event_name, event_type, description, location, start_date, end_date, capacity, registered, price, status, organizer) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [event_name, event_type, description, location, start_date, end_date, capacity, registered, price, status, organizer]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { event_name, event_type, description, location, start_date, end_date, capacity, registered, price, status, organizer } = req.body;
    const result = await pool.query(
      'UPDATE events SET event_name = $1, event_type = $2, description = $3, location = $4, start_date = $5, end_date = $6, capacity = $7, registered = $8, price = $9, status = $10, organizer = $11 WHERE id = $12 RETURNING *',
      [event_name, event_type, description, location, start_date, end_date, capacity, registered, price, status, organizer, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM shuttles ORDER BY created_at DESC';
    let params = [];
    if (search) {
      query = 'SELECT * FROM shuttles WHERE route_name ILIKE $1 OR driver_name ILIKE $1 ORDER BY created_at DESC';
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
    const result = await pool.query('SELECT * FROM shuttles WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { route_name, vehicle_id, driver_name, capacity, current_passengers, departure_time, arrival_time, status, frequency_minutes, stops } = req.body;
    const result = await pool.query(
      'INSERT INTO shuttles (route_name, vehicle_id, driver_name, capacity, current_passengers, departure_time, arrival_time, status, frequency_minutes, stops) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [route_name, vehicle_id, driver_name, capacity, current_passengers, departure_time, arrival_time, status, frequency_minutes, stops]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { route_name, vehicle_id, driver_name, capacity, current_passengers, departure_time, arrival_time, status, frequency_minutes, stops } = req.body;
    const result = await pool.query(
      'UPDATE shuttles SET route_name = $1, vehicle_id = $2, driver_name = $3, capacity = $4, current_passengers = $5, departure_time = $6, arrival_time = $7, status = $8, frequency_minutes = $9, stops = $10 WHERE id = $11 RETURNING *',
      [route_name, vehicle_id, driver_name, capacity, current_passengers, departure_time, arrival_time, status, frequency_minutes, stops, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM shuttles WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

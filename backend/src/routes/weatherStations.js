const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM weather_stations ORDER BY created_at DESC';
    let params = [];
    if (search) {
      query = 'SELECT * FROM weather_stations WHERE station_name ILIKE $1 OR location ILIKE $1 ORDER BY created_at DESC';
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
    const result = await pool.query('SELECT * FROM weather_stations WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { station_name, location, elevation, temperature, humidity, wind_speed, wind_direction, barometric_pressure, snow_depth, visibility, last_updated, status } = req.body;
    const result = await pool.query(
      'INSERT INTO weather_stations (station_name, location, elevation, temperature, humidity, wind_speed, wind_direction, barometric_pressure, snow_depth, visibility, last_updated, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [station_name, location, elevation, temperature, humidity, wind_speed, wind_direction, barometric_pressure, snow_depth, visibility, last_updated, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { station_name, location, elevation, temperature, humidity, wind_speed, wind_direction, barometric_pressure, snow_depth, visibility, last_updated, status } = req.body;
    const result = await pool.query(
      'UPDATE weather_stations SET station_name = $1, location = $2, elevation = $3, temperature = $4, humidity = $5, wind_speed = $6, wind_direction = $7, barometric_pressure = $8, snow_depth = $9, visibility = $10, last_updated = $11, status = $12 WHERE id = $13 RETURNING *',
      [station_name, location, elevation, temperature, humidity, wind_speed, wind_direction, barometric_pressure, snow_depth, visibility, last_updated, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM weather_stations WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

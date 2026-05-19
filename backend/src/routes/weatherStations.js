const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const fetch = require('node-fetch');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    let baseQuery = 'FROM weather_stations';
    let params = [];
    if (search) { baseQuery += ' WHERE station_name ILIKE $1 OR location ILIKE $1'; params = [`%${search}%`]; }
    const countQ = await pool.query(`SELECT COUNT(*) ${baseQuery}`, params);
    const total = parseInt(countQ.rows[0].count);
    params.push(limit, offset);
    const dataQ = await pool.query(`SELECT * ${baseQuery} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
    res.json({ data: dataQ.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM weather_stations WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { station_name, location, elevation, temperature, humidity, wind_speed, wind_direction, barometric_pressure, snow_depth, visibility, last_updated, status } = req.body;
    const result = await pool.query(
      'INSERT INTO weather_stations (station_name, location, elevation, temperature, humidity, wind_speed, wind_direction, barometric_pressure, snow_depth, visibility, last_updated, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *',
      [station_name, location, elevation, temperature, humidity, wind_speed, wind_direction, barometric_pressure, snow_depth, visibility, last_updated, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { station_name, location, elevation, temperature, humidity, wind_speed, wind_direction, barometric_pressure, snow_depth, visibility, last_updated, status } = req.body;
    const result = await pool.query(
      'UPDATE weather_stations SET station_name=$1, location=$2, elevation=$3, temperature=$4, humidity=$5, wind_speed=$6, wind_direction=$7, barometric_pressure=$8, snow_depth=$9, visibility=$10, last_updated=$11, status=$12 WHERE id=$13 RETURNING *',
      [station_name, location, elevation, temperature, humidity, wind_speed, wind_direction, barometric_pressure, snow_depth, visibility, last_updated, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM weather_stations WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/weather-stations/sync - fetch live data from OpenWeatherMap
router.post('/sync', async (req, res) => {
  try {
    const { lat = 39.6403, lon = -106.3742, station_name = 'Resort Summit' } = req.body;
    // lat/lon defaults to Vail, CO
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: 'OPENWEATHER_API_KEY not configured. Set it in your .env file.' });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
    const weatherRes = await fetch(url);
    const data = await weatherRes.json();

    if (data.cod !== 200) {
      return res.status(400).json({ error: `OpenWeather error: ${data.message}` });
    }

    const snowDepth = data.snow ? data.snow['1h'] || data.snow['3h'] || 0 : 0;

    const result = await pool.query(
      `INSERT INTO weather_stations
       (station_name, location, temperature, humidity, wind_speed, wind_direction,
        barometric_pressure, snow_depth, visibility, last_updated, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), 'active')
       RETURNING *`,
      [
        station_name,
        data.name || 'Unknown',
        data.main.temp,
        data.main.humidity,
        data.wind.speed,
        data.wind.deg,
        data.main.pressure,
        snowDepth,
        data.visibility ? data.visibility / 1609 : null, // meters to miles
      ]
    );

    res.json({ success: true, station: result.rows[0], raw_weather: { weather: data.weather, clouds: data.clouds } });
  } catch (err) {
    console.error('Weather sync error:', err);
    res.status(500).json({ error: 'Weather sync failed', details: err.message });
  }
});

module.exports = router;

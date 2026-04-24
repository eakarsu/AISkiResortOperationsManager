const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM accommodations ORDER BY created_at DESC';
    let params = [];
    if (search) {
      query = 'SELECT * FROM accommodations WHERE property_name ILIKE $1 OR guest_name ILIKE $1 ORDER BY created_at DESC';
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
    const result = await pool.query('SELECT * FROM accommodations WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { property_name, room_type, capacity, price_per_night, amenities, status, guest_name, check_in, check_out, booking_status } = req.body;
    const result = await pool.query(
      'INSERT INTO accommodations (property_name, room_type, capacity, price_per_night, amenities, status, guest_name, check_in, check_out, booking_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [property_name, room_type, capacity, price_per_night, amenities, status, guest_name, check_in, check_out, booking_status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { property_name, room_type, capacity, price_per_night, amenities, status, guest_name, check_in, check_out, booking_status } = req.body;
    const result = await pool.query(
      'UPDATE accommodations SET property_name = $1, room_type = $2, capacity = $3, price_per_night = $4, amenities = $5, status = $6, guest_name = $7, check_in = $8, check_out = $9, booking_status = $10 WHERE id = $11 RETURNING *',
      [property_name, room_type, capacity, price_per_night, amenities, status, guest_name, check_in, check_out, booking_status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM accommodations WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

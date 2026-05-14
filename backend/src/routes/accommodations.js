const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countQ = await pool.query('SELECT COUNT(*) FROM accommodations');
    const total = parseInt(countQ.rows[0].count);
    const result = await pool.query('SELECT * FROM accommodations ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM accommodations WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { property_name, room_type, capacity, price_per_night, amenities, status, guest_name, check_in, check_out, booking_status } = req.body;
    const result = await pool.query(
      'INSERT INTO accommodations (property_name, room_type, capacity, price_per_night, amenities, status, guest_name, check_in, check_out, booking_status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [property_name, room_type, capacity, price_per_night, amenities, status, guest_name, check_in, check_out, booking_status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { property_name, room_type, capacity, price_per_night, amenities, status, guest_name, check_in, check_out, booking_status } = req.body;
    const result = await pool.query(
      'UPDATE accommodations SET property_name=$1, room_type=$2, capacity=$3, price_per_night=$4, amenities=$5, status=$6, guest_name=$7, check_in=$8, check_out=$9, booking_status=$10 WHERE id=$11 RETURNING *',
      [property_name, room_type, capacity, price_per_night, amenities, status, guest_name, check_in, check_out, booking_status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM accommodations WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

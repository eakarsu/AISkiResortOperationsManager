const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countQ = await pool.query('SELECT COUNT(*) FROM parking_lots');
    const total = parseInt(countQ.rows[0].count);
    const result = await pool.query('SELECT * FROM parking_lots ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM parking_lots WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { lot_name, total_spaces, occupied_spaces, status, lot_type, rate, distance_to_lodge, shuttle_available } = req.body;
    const result = await pool.query(
      'INSERT INTO parking_lots (lot_name, total_spaces, occupied_spaces, status, lot_type, rate, distance_to_lodge, shuttle_available) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [lot_name, total_spaces, occupied_spaces, status, lot_type, rate, distance_to_lodge, shuttle_available]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { lot_name, total_spaces, occupied_spaces, status, lot_type, rate, distance_to_lodge, shuttle_available } = req.body;
    const result = await pool.query(
      'UPDATE parking_lots SET lot_name=$1, total_spaces=$2, occupied_spaces=$3, status=$4, lot_type=$5, rate=$6, distance_to_lodge=$7, shuttle_available=$8 WHERE id=$9 RETURNING *',
      [lot_name, total_spaces, occupied_spaces, status, lot_type, rate, distance_to_lodge, shuttle_available, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM parking_lots WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

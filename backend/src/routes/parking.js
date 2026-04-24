const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM parking_lots ORDER BY created_at DESC';
    let params = [];
    if (search) {
      query = 'SELECT * FROM parking_lots WHERE lot_name ILIKE $1 ORDER BY created_at DESC';
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
    const result = await pool.query('SELECT * FROM parking_lots WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { lot_name, total_spaces, occupied_spaces, status, lot_type, rate, distance_to_lodge, shuttle_available } = req.body;
    const result = await pool.query(
      'INSERT INTO parking_lots (lot_name, total_spaces, occupied_spaces, status, lot_type, rate, distance_to_lodge, shuttle_available) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [lot_name, total_spaces, occupied_spaces, status, lot_type, rate, distance_to_lodge, shuttle_available]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { lot_name, total_spaces, occupied_spaces, status, lot_type, rate, distance_to_lodge, shuttle_available } = req.body;
    const result = await pool.query(
      'UPDATE parking_lots SET lot_name = $1, total_spaces = $2, occupied_spaces = $3, status = $4, lot_type = $5, rate = $6, distance_to_lodge = $7, shuttle_available = $8 WHERE id = $9 RETURNING *',
      [lot_name, total_spaces, occupied_spaces, status, lot_type, rate, distance_to_lodge, shuttle_available, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM parking_lots WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

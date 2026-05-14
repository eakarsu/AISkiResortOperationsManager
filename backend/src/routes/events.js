const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countQ = await pool.query('SELECT COUNT(*) FROM events');
    const total = parseInt(countQ.rows[0].count);
    const result = await pool.query('SELECT * FROM events ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { event_name, event_type, description, location, start_date, end_date, capacity, registered, price, status, organizer } = req.body;
    const result = await pool.query(
      'INSERT INTO events (event_name, event_type, description, location, start_date, end_date, capacity, registered, price, status, organizer) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
      [event_name, event_type, description, location, start_date, end_date, capacity, registered, price, status, organizer]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { event_name, event_type, description, location, start_date, end_date, capacity, registered, price, status, organizer } = req.body;
    const result = await pool.query(
      'UPDATE events SET event_name=$1, event_type=$2, description=$3, location=$4, start_date=$5, end_date=$6, capacity=$7, registered=$8, price=$9, status=$10, organizer=$11 WHERE id=$12 RETURNING *',
      [event_name, event_type, description, location, start_date, end_date, capacity, registered, price, status, organizer, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM events WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

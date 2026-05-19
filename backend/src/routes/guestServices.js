const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countQ = await pool.query('SELECT COUNT(*) FROM guest_services');
    const total = parseInt(countQ.rows[0].count);
    const result = await pool.query('SELECT * FROM guest_services ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM guest_services WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { guest_name, request_type, description, priority, status, assigned_to, location, resolved_at } = req.body;
    const result = await pool.query(
      'INSERT INTO guest_services (guest_name, request_type, description, priority, status, assigned_to, location, resolved_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [guest_name, request_type, description, priority, status, assigned_to, location, resolved_at]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { guest_name, request_type, description, priority, status, assigned_to, location, resolved_at } = req.body;
    const result = await pool.query(
      'UPDATE guest_services SET guest_name=$1, request_type=$2, description=$3, priority=$4, status=$5, assigned_to=$6, location=$7, resolved_at=$8 WHERE id=$9 RETURNING *',
      [guest_name, request_type, description, priority, status, assigned_to, location, resolved_at, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM guest_services WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

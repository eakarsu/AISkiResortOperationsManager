const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countQ = await pool.query('SELECT COUNT(*) FROM rfid_access');
    const total = parseInt(countQ.rows[0].count);
    const result = await pool.query('SELECT * FROM rfid_access ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rfid_access WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { card_id, holder_name, access_point, access_type, timestamp, pass_type, valid } = req.body;
    const result = await pool.query(
      'INSERT INTO rfid_access (card_id, holder_name, access_point, access_type, timestamp, pass_type, valid) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [card_id, holder_name, access_point, access_type, timestamp, pass_type, valid]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { card_id, holder_name, access_point, access_type, timestamp, pass_type, valid } = req.body;
    const result = await pool.query(
      'UPDATE rfid_access SET card_id=$1, holder_name=$2, access_point=$3, access_type=$4, timestamp=$5, pass_type=$6, valid=$7 WHERE id=$8 RETURNING *',
      [card_id, holder_name, access_point, access_type, timestamp, pass_type, valid, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM rfid_access WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

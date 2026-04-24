const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM rfid_access ORDER BY created_at DESC';
    let params = [];
    if (search) {
      query = 'SELECT * FROM rfid_access WHERE holder_name ILIKE $1 OR card_id ILIKE $1 ORDER BY created_at DESC';
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
    const result = await pool.query('SELECT * FROM rfid_access WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { card_id, holder_name, access_point, access_type, timestamp, pass_type, valid } = req.body;
    const result = await pool.query(
      'INSERT INTO rfid_access (card_id, holder_name, access_point, access_type, timestamp, pass_type, valid) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [card_id, holder_name, access_point, access_type, timestamp, pass_type, valid]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { card_id, holder_name, access_point, access_type, timestamp, pass_type, valid } = req.body;
    const result = await pool.query(
      'UPDATE rfid_access SET card_id = $1, holder_name = $2, access_point = $3, access_type = $4, timestamp = $5, pass_type = $6, valid = $7 WHERE id = $8 RETURNING *',
      [card_id, holder_name, access_point, access_type, timestamp, pass_type, valid, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM rfid_access WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

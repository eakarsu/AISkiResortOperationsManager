const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM season_passes ORDER BY created_at DESC';
    let params = [];
    if (search) {
      query = 'SELECT * FROM season_passes WHERE holder_name ILIKE $1 ORDER BY created_at DESC';
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
    const result = await pool.query('SELECT * FROM season_passes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { holder_name, email, pass_type, season, price, start_date, end_date, photo_url, status } = req.body;
    const result = await pool.query(
      'INSERT INTO season_passes (holder_name, email, pass_type, season, price, start_date, end_date, photo_url, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [holder_name, email, pass_type, season, price, start_date, end_date, photo_url, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { holder_name, email, pass_type, season, price, start_date, end_date, photo_url, status } = req.body;
    const result = await pool.query(
      'UPDATE season_passes SET holder_name = $1, email = $2, pass_type = $3, season = $4, price = $5, start_date = $6, end_date = $7, photo_url = $8, status = $9 WHERE id = $10 RETURNING *',
      [holder_name, email, pass_type, season, price, start_date, end_date, photo_url, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM season_passes WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

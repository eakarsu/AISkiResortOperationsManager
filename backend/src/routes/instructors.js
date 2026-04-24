const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM instructors ORDER BY created_at DESC';
    let params = [];
    if (search) {
      query = 'SELECT * FROM instructors WHERE name ILIKE $1 OR specialization ILIKE $1 ORDER BY created_at DESC';
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
    const result = await pool.query('SELECT * FROM instructors WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, specialization, certification_level, languages, availability, hourly_rate, rating, years_experience, phone } = req.body;
    const result = await pool.query(
      'INSERT INTO instructors (name, specialization, certification_level, languages, availability, hourly_rate, rating, years_experience, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [name, specialization, certification_level, languages, availability, hourly_rate, rating, years_experience, phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, specialization, certification_level, languages, availability, hourly_rate, rating, years_experience, phone } = req.body;
    const result = await pool.query(
      'UPDATE instructors SET name = $1, specialization = $2, certification_level = $3, languages = $4, availability = $5, hourly_rate = $6, rating = $7, years_experience = $8, phone = $9 WHERE id = $10 RETURNING *',
      [name, specialization, certification_level, languages, availability, hourly_rate, rating, years_experience, phone, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM instructors WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

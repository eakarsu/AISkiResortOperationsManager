const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM lessons ORDER BY created_at DESC';
    let params = [];
    if (search) {
      query = 'SELECT * FROM lessons WHERE guest_name ILIKE $1 OR instructor_name ILIKE $1 ORDER BY created_at DESC';
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
    const result = await pool.query('SELECT * FROM lessons WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { lesson_type, skill_level, instructor_name, guest_name, guest_count, scheduled_date, start_time, duration, price, status, meeting_point } = req.body;
    const result = await pool.query(
      'INSERT INTO lessons (lesson_type, skill_level, instructor_name, guest_name, guest_count, scheduled_date, start_time, duration, price, status, meeting_point) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [lesson_type, skill_level, instructor_name, guest_name, guest_count, scheduled_date, start_time, duration, price, status, meeting_point]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { lesson_type, skill_level, instructor_name, guest_name, guest_count, scheduled_date, start_time, duration, price, status, meeting_point } = req.body;
    const result = await pool.query(
      'UPDATE lessons SET lesson_type = $1, skill_level = $2, instructor_name = $3, guest_name = $4, guest_count = $5, scheduled_date = $6, start_time = $7, duration = $8, price = $9, status = $10, meeting_point = $11 WHERE id = $12 RETURNING *',
      [lesson_type, skill_level, instructor_name, guest_name, guest_count, scheduled_date, start_time, duration, price, status, meeting_point, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM lessons WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

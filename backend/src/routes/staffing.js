const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM staffing ORDER BY created_at DESC';
    let params = [];
    if (search) {
      query = 'SELECT * FROM staffing WHERE employee_name ILIKE $1 OR department ILIKE $1 ORDER BY created_at DESC';
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
    const result = await pool.query('SELECT * FROM staffing WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { employee_name, department, position, shift_date, shift_start, shift_end, status, hourly_rate, hours_worked, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO staffing (employee_name, department, position, shift_date, shift_start, shift_end, status, hourly_rate, hours_worked, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [employee_name, department, position, shift_date, shift_start, shift_end, status, hourly_rate, hours_worked, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { employee_name, department, position, shift_date, shift_start, shift_end, status, hourly_rate, hours_worked, notes } = req.body;
    const result = await pool.query(
      'UPDATE staffing SET employee_name = $1, department = $2, position = $3, shift_date = $4, shift_start = $5, shift_end = $6, status = $7, hourly_rate = $8, hours_worked = $9, notes = $10 WHERE id = $11 RETURNING *',
      [employee_name, department, position, shift_date, shift_start, shift_end, status, hourly_rate, hours_worked, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM staffing WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

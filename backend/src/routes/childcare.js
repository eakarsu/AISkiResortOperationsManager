const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM childcare ORDER BY created_at DESC';
    let params = [];
    if (search) {
      query = 'SELECT * FROM childcare WHERE child_name ILIKE $1 OR parent_name ILIKE $1 ORDER BY created_at DESC';
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
    const result = await pool.query('SELECT * FROM childcare WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { child_name, parent_name, parent_phone, age, check_in, check_out, special_needs, meal_plan, status, rate } = req.body;
    const result = await pool.query(
      'INSERT INTO childcare (child_name, parent_name, parent_phone, age, check_in, check_out, special_needs, meal_plan, status, rate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [child_name, parent_name, parent_phone, age, check_in, check_out, special_needs, meal_plan, status, rate]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { child_name, parent_name, parent_phone, age, check_in, check_out, special_needs, meal_plan, status, rate } = req.body;
    const result = await pool.query(
      'UPDATE childcare SET child_name = $1, parent_name = $2, parent_phone = $3, age = $4, check_in = $5, check_out = $6, special_needs = $7, meal_plan = $8, status = $9, rate = $10 WHERE id = $11 RETURNING *',
      [child_name, parent_name, parent_phone, age, check_in, check_out, special_needs, meal_plan, status, rate, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM childcare WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    let baseQuery = 'FROM trails';
    let params = [];
    if (search) {
      baseQuery += ' WHERE name ILIKE $1';
      params = [`%${search}%`];
    }
    const countQ = await pool.query(`SELECT COUNT(*) ${baseQuery}`, params);
    const total = parseInt(countQ.rows[0].count);
    params.push(limit, offset);
    const dataQ = await pool.query(`SELECT * ${baseQuery} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
    res.json({ data: dataQ.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/trails/open - returns only open trails
router.get('/open', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, difficulty, status, conditions, grooming_status, snowfall_last24h, last_groomed FROM trails WHERE status = 'open' ORDER BY difficulty, name"
    );
    res.json({ data: result.rows, total: result.rows.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trails WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/',
  body('name').notEmpty().withMessage('Name is required'),
  body('difficulty').notEmpty().withMessage('Difficulty is required'),
  validate,
  async (req, res) => {
    try {
      const { name, difficulty, status, grooming_status, length, vertical_drop, snowfall_last24h, conditions, last_groomed } = req.body;
      const result = await pool.query(
        'INSERT INTO trails (name, difficulty, status, grooming_status, length, vertical_drop, snowfall_last24h, conditions, last_groomed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [name, difficulty, status, grooming_status, length, vertical_drop, snowfall_last24h, conditions, last_groomed]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
  }
);

router.put('/:id',
  body('name').optional().notEmpty(),
  validate,
  async (req, res) => {
    try {
      const { name, difficulty, status, grooming_status, length, vertical_drop, snowfall_last24h, conditions, last_groomed } = req.body;
      const result = await pool.query(
        'UPDATE trails SET name = $1, difficulty = $2, status = $3, grooming_status = $4, length = $5, vertical_drop = $6, snowfall_last24h = $7, conditions = $8, last_groomed = $9 WHERE id = $10 RETURNING *',
        [name, difficulty, status, grooming_status, length, vertical_drop, snowfall_last24h, conditions, last_groomed, req.params.id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
  }
);

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM trails WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

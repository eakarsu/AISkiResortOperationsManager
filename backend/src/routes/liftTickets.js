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
    let baseQuery = 'FROM lift_tickets';
    let params = [];
    if (search) { baseQuery += ' WHERE guest_name ILIKE $1'; params = [`%${search}%`]; }
    const countQ = await pool.query(`SELECT COUNT(*) ${baseQuery}`, params);
    const total = parseInt(countQ.rows[0].count);
    params.push(limit, offset);
    const dataQ = await pool.query(`SELECT * ${baseQuery} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
    res.json({ data: dataQ.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lift_tickets WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/',
  body('guest_name').notEmpty().withMessage('guest_name required'),
  body('ticket_type').notEmpty().withMessage('ticket_type required'),
  body('price').isNumeric().withMessage('price must be a number'),
  validate,
  async (req, res) => {
    try {
      const { guest_name, ticket_type, price, purchase_date, valid_date, status, payment_method } = req.body;
      const result = await pool.query(
        'INSERT INTO lift_tickets (guest_name, ticket_type, price, purchase_date, valid_date, status, payment_method) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [guest_name, ticket_type, price, purchase_date, valid_date, status, payment_method]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
  }
);

router.put('/:id',
  body('price').optional().isNumeric(),
  validate,
  async (req, res) => {
    try {
      const { guest_name, ticket_type, price, purchase_date, valid_date, status, payment_method } = req.body;
      const result = await pool.query(
        'UPDATE lift_tickets SET guest_name=$1, ticket_type=$2, price=$3, purchase_date=$4, valid_date=$5, status=$6, payment_method=$7 WHERE id=$8 RETURNING *',
        [guest_name, ticket_type, price, purchase_date, valid_date, status, payment_method, req.params.id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
  }
);

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM lift_tickets WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

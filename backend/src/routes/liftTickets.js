const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM lift_tickets ORDER BY created_at DESC';
    let params = [];
    if (search) {
      query = 'SELECT * FROM lift_tickets WHERE guest_name ILIKE $1 ORDER BY created_at DESC';
      params = [`%${search}%`];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lift_tickets WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create
router.post('/', async (req, res) => {
  try {
    const { guest_name, ticket_type, price, purchase_date, valid_date, status, payment_method } = req.body;
    const result = await pool.query(
      'INSERT INTO lift_tickets (guest_name, ticket_type, price, purchase_date, valid_date, status, payment_method) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [guest_name, ticket_type, price, purchase_date, valid_date, status, payment_method]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    const { guest_name, ticket_type, price, purchase_date, valid_date, status, payment_method } = req.body;
    const result = await pool.query(
      'UPDATE lift_tickets SET guest_name = $1, ticket_type = $2, price = $3, purchase_date = $4, valid_date = $5, status = $6, payment_method = $7 WHERE id = $8 RETURNING *',
      [guest_name, ticket_type, price, purchase_date, valid_date, status, payment_method, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM lift_tickets WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

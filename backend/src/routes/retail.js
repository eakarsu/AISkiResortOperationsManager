const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM retail_transactions ORDER BY created_at DESC';
    let params = [];
    if (search) {
      query = 'SELECT * FROM retail_transactions WHERE item_name ILIKE $1 OR store_name ILIKE $1 ORDER BY created_at DESC';
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
    const result = await pool.query('SELECT * FROM retail_transactions WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { store_name, item_name, category, quantity, unit_price, total_price, payment_method, customer_name, transaction_date } = req.body;
    const result = await pool.query(
      'INSERT INTO retail_transactions (store_name, item_name, category, quantity, unit_price, total_price, payment_method, customer_name, transaction_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [store_name, item_name, category, quantity, unit_price, total_price, payment_method, customer_name, transaction_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { store_name, item_name, category, quantity, unit_price, total_price, payment_method, customer_name, transaction_date } = req.body;
    const result = await pool.query(
      'UPDATE retail_transactions SET store_name = $1, item_name = $2, category = $3, quantity = $4, unit_price = $5, total_price = $6, payment_method = $7, customer_name = $8, transaction_date = $9 WHERE id = $10 RETURNING *',
      [store_name, item_name, category, quantity, unit_price, total_price, payment_method, customer_name, transaction_date, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM retail_transactions WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countQ = await pool.query('SELECT COUNT(*) FROM retail_transactions');
    const total = parseInt(countQ.rows[0].count);
    const result = await pool.query('SELECT * FROM retail_transactions ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM retail_transactions WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { store_name, item_name, category, quantity, unit_price, total_price, payment_method, customer_name, transaction_date } = req.body;
    const result = await pool.query(
      'INSERT INTO retail_transactions (store_name, item_name, category, quantity, unit_price, total_price, payment_method, customer_name, transaction_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [store_name, item_name, category, quantity, unit_price, total_price, payment_method, customer_name, transaction_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { store_name, item_name, category, quantity, unit_price, total_price, payment_method, customer_name, transaction_date } = req.body;
    const result = await pool.query(
      'UPDATE retail_transactions SET store_name=$1, item_name=$2, category=$3, quantity=$4, unit_price=$5, total_price=$6, payment_method=$7, customer_name=$8, transaction_date=$9 WHERE id=$10 RETURNING *',
      [store_name, item_name, category, quantity, unit_price, total_price, payment_method, customer_name, transaction_date, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM retail_transactions WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

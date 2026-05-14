const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countQ = await pool.query('SELECT COUNT(*) FROM lost_found');
    const total = parseInt(countQ.rows[0].count);
    const result = await pool.query('SELECT * FROM lost_found ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lost_found WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { item_description, category, location_found, found_date, finder_name, claimed_by, claimed_date, status, storage_location } = req.body;
    const result = await pool.query(
      'INSERT INTO lost_found (item_description, category, location_found, found_date, finder_name, claimed_by, claimed_date, status, storage_location) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [item_description, category, location_found, found_date, finder_name, claimed_by, claimed_date, status, storage_location]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { item_description, category, location_found, found_date, finder_name, claimed_by, claimed_date, status, storage_location } = req.body;
    const result = await pool.query(
      'UPDATE lost_found SET item_description=$1, category=$2, location_found=$3, found_date=$4, finder_name=$5, claimed_by=$6, claimed_date=$7, status=$8, storage_location=$9 WHERE id=$10 RETURNING *',
      [item_description, category, location_found, found_date, finder_name, claimed_by, claimed_date, status, storage_location, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM lost_found WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

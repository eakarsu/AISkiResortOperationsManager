const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countQ = await pool.query('SELECT COUNT(*) FROM equipment_maintenance');
    const total = parseInt(countQ.rows[0].count);
    const result = await pool.query('SELECT * FROM equipment_maintenance ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipment_maintenance WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { equipment_name, equipment_type, maintenance_type, description, technician, status, priority, scheduled_date, completed_date, cost } = req.body;
    const result = await pool.query(
      'INSERT INTO equipment_maintenance (equipment_name, equipment_type, maintenance_type, description, technician, status, priority, scheduled_date, completed_date, cost) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [equipment_name, equipment_type, maintenance_type, description, technician, status, priority, scheduled_date, completed_date, cost]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { equipment_name, equipment_type, maintenance_type, description, technician, status, priority, scheduled_date, completed_date, cost } = req.body;
    const result = await pool.query(
      'UPDATE equipment_maintenance SET equipment_name=$1, equipment_type=$2, maintenance_type=$3, description=$4, technician=$5, status=$6, priority=$7, scheduled_date=$8, completed_date=$9, cost=$10 WHERE id=$11 RETURNING *',
      [equipment_name, equipment_type, maintenance_type, description, technician, status, priority, scheduled_date, completed_date, cost, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM equipment_maintenance WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

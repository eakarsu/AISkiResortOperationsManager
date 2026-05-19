const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// In-memory storage for operational rules (CRUD)
let operationalRules = [
  { id: 1, lift_name: 'Summit Express', open_time: '08:30', close_time: '16:00', snowmaking_enabled: true, min_temp: 28, max_wind: 35, notes: 'Primary high-speed quad' },
  { id: 2, lift_name: 'Powder Bowl', open_time: '09:00', close_time: '15:30', snowmaking_enabled: true, min_temp: 25, max_wind: 30, notes: 'Snowmaking active overnight' },
  { id: 3, lift_name: 'Beginners Magic Carpet', open_time: '09:00', close_time: '16:30', snowmaking_enabled: false, min_temp: 32, max_wind: 40, notes: 'Open to public lessons only' },
  { id: 4, lift_name: 'Black Diamond Express', open_time: '08:00', close_time: '15:00', snowmaking_enabled: true, min_temp: 20, max_wind: 25, notes: 'Advanced terrain - weather restricted' },
];
let nextRuleId = 5;

// VIZ 1: Lift utilization timeline - returns time-series wait_time + utilization per lift
router.get('/lift-utilization-timeline', async (req, res) => {
  try {
    let lifts = [];
    try {
      const liftRes = await pool.query('SELECT id, name, capacity, wait_time, status FROM lifts ORDER BY name LIMIT 8');
      lifts = liftRes.rows;
    } catch (e) { lifts = []; }

    if (!lifts.length) {
      lifts = [
        { id: 1, name: 'Summit Express', capacity: 2400, wait_time: 12, status: 'open' },
        { id: 2, name: 'Powder Bowl', capacity: 1800, wait_time: 8, status: 'open' },
        { id: 3, name: 'Beginners Magic', capacity: 600, wait_time: 3, status: 'open' },
        { id: 4, name: 'Black Diamond Express', capacity: 2000, wait_time: 15, status: 'open' },
        { id: 5, name: 'Glacier Gondola', capacity: 3000, wait_time: 18, status: 'open' },
      ];
    }

    // Hourly buckets 08:00-16:00
    const hours = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00'];
    const timeline = lifts.map(lift => {
      const base = Math.max(1, lift.wait_time || 5);
      const cap = lift.capacity || 1500;
      const series = hours.map((h, i) => {
        // Bell curve peaking at 11-13
        const peakFactor = 1 - Math.abs(i - 4) / 6;
        const wait = Math.round(base * (0.5 + peakFactor * 1.8) + (lift.id % 5));
        const utilization = Math.min(100, Math.round((peakFactor * 85) + 20 + ((lift.id * 3) % 10)));
        const riders = Math.round(cap * (utilization / 100) * 0.85);
        return { hour: h, wait_minutes: wait, utilization_pct: utilization, riders };
      });
      return { lift_id: lift.id, lift_name: lift.name, capacity: cap, status: lift.status || 'open', series };
    });

    const peakHour = hours[4];
    const avgUtilization = Math.round(timeline.reduce((s, l) => s + l.series.reduce((a, b) => a + b.utilization_pct, 0) / l.series.length, 0) / timeline.length);

    res.json({
      generated_at: new Date().toISOString(),
      hours,
      lifts: timeline,
      summary: { total_lifts: timeline.length, peak_hour: peakHour, avg_utilization_pct: avgUtilization }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VIZ 2: Slope conditions heatmap (slope x time)
router.get('/slope-conditions-heatmap', async (req, res) => {
  try {
    let trails = [];
    try {
      const tRes = await pool.query('SELECT id, name, difficulty, conditions, snowfall_last24h FROM trails ORDER BY name LIMIT 12');
      trails = tRes.rows;
    } catch (e) { trails = []; }

    if (!trails.length) {
      trails = [
        { id: 1, name: 'Sunrise Bowl', difficulty: 'beginner', conditions: 'powder', snowfall_last24h: 8 },
        { id: 2, name: 'Mid-Mountain', difficulty: 'intermediate', conditions: 'packed powder', snowfall_last24h: 6 },
        { id: 3, name: 'Powder Paradise', difficulty: 'expert', conditions: 'powder', snowfall_last24h: 12 },
        { id: 4, name: 'Sunset Boulevard', difficulty: 'intermediate', conditions: 'groomed', snowfall_last24h: 4 },
        { id: 5, name: 'Devil\'s Drop', difficulty: 'expert', conditions: 'icy', snowfall_last24h: 2 },
        { id: 6, name: 'Green Meadow', difficulty: 'beginner', conditions: 'groomed', snowfall_last24h: 3 },
        { id: 7, name: 'Cliff Run', difficulty: 'expert', conditions: 'crusty', snowfall_last24h: 5 },
        { id: 8, name: 'Family Lane', difficulty: 'beginner', conditions: 'packed powder', snowfall_last24h: 4 },
      ];
    }

    const hours = ['07:00','09:00','11:00','13:00','15:00','17:00'];

    // Score 0-100 representing slope condition quality
    const scoreConditions = (cond) => {
      const map = { 'powder': 95, 'packed powder': 85, 'groomed': 78, 'fresh': 90, 'spring': 60, 'crusty': 45, 'icy': 30, 'closed': 0 };
      const c = (cond || 'groomed').toLowerCase();
      return map[c] || 65;
    };

    const heatmap = trails.map(t => {
      const base = scoreConditions(t.conditions);
      const sf = Math.min(20, t.snowfall_last24h || 0);
      const cells = hours.map((h, i) => {
        // Conditions degrade through the day
        const decay = i * 4;
        const morningBoost = i <= 1 ? sf : 0;
        let score = Math.max(0, Math.min(100, base + morningBoost - decay));
        return { hour: h, score, label: score > 80 ? 'excellent' : score > 60 ? 'good' : score > 40 ? 'fair' : 'poor' };
      });
      return { trail_id: t.id, trail_name: t.name, difficulty: t.difficulty || 'intermediate', cells };
    });

    res.json({
      generated_at: new Date().toISOString(),
      hours,
      trails: heatmap,
      summary: { total_trails: heatmap.length, best_window: '09:00-11:00' }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NON-VIZ 1: Grooming report (PDF-style text report, returns structured JSON + plaintext body)
router.get('/grooming-report', async (req, res) => {
  try {
    let trails = [];
    try {
      const tRes = await pool.query('SELECT name, difficulty, grooming_status, last_groomed, conditions, length FROM trails ORDER BY name');
      trails = tRes.rows;
    } catch (e) { trails = []; }

    if (!trails.length) {
      trails = [
        { name: 'Sunrise Bowl', difficulty: 'beginner', grooming_status: 'groomed', last_groomed: '2026-05-17', conditions: 'packed powder', length: 1800 },
        { name: 'Powder Paradise', difficulty: 'expert', grooming_status: 'ungroomed', last_groomed: '2026-05-15', conditions: 'powder', length: 2400 },
        { name: 'Sunset Boulevard', difficulty: 'intermediate', grooming_status: 'groomed', last_groomed: '2026-05-17', conditions: 'groomed', length: 2100 },
        { name: 'Green Meadow', difficulty: 'beginner', grooming_status: 'groomed', last_groomed: '2026-05-17', conditions: 'groomed', length: 1500 },
      ];
    }

    const today = new Date().toISOString().slice(0, 10);
    const groomedCount = trails.filter(t => (t.grooming_status || '').toLowerCase() === 'groomed').length;
    const totalKm = (trails.reduce((s, t) => s + (t.length || 0), 0) / 1000).toFixed(2);

    const lines = [];
    lines.push('ALPINE PEAK RESORT - DAILY GROOMING REPORT');
    lines.push('==========================================');
    lines.push(`Report Date: ${today}`);
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');
    lines.push(`SUMMARY: ${groomedCount}/${trails.length} trails groomed | ${totalKm} km of total trail length`);
    lines.push('');
    lines.push('TRAIL DETAILS:');
    lines.push('--------------');
    trails.forEach((t, idx) => {
      lines.push(`${idx + 1}. ${t.name}  [${(t.difficulty || 'n/a').toUpperCase()}]`);
      lines.push(`   Status:       ${t.grooming_status || 'unknown'}`);
      lines.push(`   Conditions:   ${t.conditions || 'unknown'}`);
      lines.push(`   Last Groomed: ${t.last_groomed || 'unknown'}`);
      lines.push(`   Length:       ${t.length || 0} m`);
      lines.push('');
    });
    lines.push('END OF REPORT');

    res.json({
      report_date: today,
      generated_at: new Date().toISOString(),
      filename: `grooming-report-${today}.pdf`,
      summary: { total_trails: trails.length, groomed: groomedCount, ungroomed: trails.length - groomedCount, total_km: parseFloat(totalKm) },
      trails,
      pdf_body: lines.join('\n')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NON-VIZ 2: Operational rules editor - CRUD via single endpoint
router.all('/operational-rules', (req, res) => {
  try {
    if (req.method === 'GET') {
      return res.json({ rules: operationalRules, count: operationalRules.length });
    }
    if (req.method === 'POST') {
      const { lift_name, open_time, close_time, snowmaking_enabled, min_temp, max_wind, notes } = req.body || {};
      if (!lift_name) return res.status(400).json({ error: 'lift_name required' });
      const rule = {
        id: nextRuleId++,
        lift_name,
        open_time: open_time || '09:00',
        close_time: close_time || '16:00',
        snowmaking_enabled: !!snowmaking_enabled,
        min_temp: typeof min_temp === 'number' ? min_temp : 28,
        max_wind: typeof max_wind === 'number' ? max_wind : 35,
        notes: notes || ''
      };
      operationalRules.push(rule);
      return res.status(201).json(rule);
    }
    if (req.method === 'PUT') {
      const { id } = req.body || {};
      const idx = operationalRules.findIndex(r => r.id === Number(id));
      if (idx === -1) return res.status(404).json({ error: 'Rule not found' });
      operationalRules[idx] = { ...operationalRules[idx], ...req.body, id: operationalRules[idx].id };
      return res.json(operationalRules[idx]);
    }
    if (req.method === 'DELETE') {
      const id = Number(req.body?.id || req.query.id);
      const idx = operationalRules.findIndex(r => r.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Rule not found' });
      const removed = operationalRules.splice(idx, 1)[0];
      return res.json({ deleted: removed });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

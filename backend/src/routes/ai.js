const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { callAI: rawCallAI, parseAIJson } = require('../services/aiService');
const { aiRateLimiter } = require('../middleware/rateLimiter');

// Wrap callAI to surface 503 (no API key) cleanly via err.statusCode.
async function callAI(...args) { return rawCallAI(...args); }

// Helper: persist AI result
async function saveAIResult(endpoint, userId, prompt, result) {
  try {
    await pool.query(
      `INSERT INTO ai_results (endpoint, user_id, prompt_summary, result, model, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT DO NOTHING`,
      [endpoint, userId, String(prompt).slice(0, 500), JSON.stringify(result), 'anthropic/claude-3-5-sonnet-20241022']
    );
  } catch (err) {
    // Table may not exist yet, log and continue
    console.warn('ai_results persist failed (table may not exist):', err.message);
  }
}

// POST /api/ai/dynamic-pricing
router.post('/dynamic-pricing', aiRateLimiter, async (req, res) => {
  try {
    const { conditions, demand_data } = req.body;

    const ticketSales = await pool.query(
      'SELECT ticket_type, price, status, COUNT(*) as count FROM lift_tickets GROUP BY ticket_type, price, status'
    );
    const weather = await pool.query(
      'SELECT * FROM weather_stations ORDER BY last_updated DESC LIMIT 5'
    );
    const trailStatus = await pool.query(
      "SELECT name, difficulty, status, conditions, snowfall_last24h FROM trails WHERE status = 'open'"
    );

    const systemPrompt = `You are an expert ski resort revenue management AI.
Respond ONLY in valid JSON format with this structure:
{
  "pricing_recommendations": [
    { "ticket_type": string, "new_price": number, "current_price": number, "reason": string, "confidence": number }
  ],
  "promotional_pricing": [{ "description": string, "discount_percent": number }],
  "revenue_strategies": string[],
  "demand_forecast_24h": string,
  "competitive_positioning": string
}`;

    const userPrompt = `Analyze and provide dynamic pricing recommendations:
Conditions: ${JSON.stringify(conditions || {})}
Demand Data: ${JSON.stringify(demand_data || {})}
Current Ticket Sales: ${JSON.stringify(ticketSales.rows)}
Weather: ${JSON.stringify(weather.rows)}
Open Trails: ${JSON.stringify(trailStatus.rows)}`;

    const raw = await callAI(systemPrompt, userPrompt);
    const result = parseAIJson(raw);
    if (!result) {
      console.error('Dynamic pricing AI returned invalid JSON:', raw);
      return res.status(422).json({ success: false, error: 'AI returned invalid JSON response' });
    }
    await saveAIResult('/ai/dynamic-pricing', req.user?.id, 'Dynamic pricing analysis', result);
    res.json({ success: true, result });
  } catch (err) {
    if (err.statusCode === 503) return res.status(503).json({ success: false, error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/apply-pricing - auto-apply dynamic pricing
router.post('/apply-pricing', aiRateLimiter, async (req, res) => {
  try {
    const { pricing_recommendations } = req.body;
    if (!Array.isArray(pricing_recommendations) || pricing_recommendations.length === 0) {
      return res.status(400).json({ error: 'pricing_recommendations array required' });
    }

    // Configurable bounds: max ±40% from current price
    const MAX_CHANGE_PERCENT = 0.4;
    const applied = [];
    const skipped = [];

    for (const rec of pricing_recommendations) {
      const { ticket_type, new_price, current_price } = rec;
      if (!ticket_type || !new_price) { skipped.push({ ...rec, reason: 'Missing fields' }); continue; }

      // Validate within bounds
      const basePrice = current_price || new_price;
      const change = Math.abs(new_price - basePrice) / Math.max(basePrice, 1);
      if (change > MAX_CHANGE_PERCENT) {
        skipped.push({ ...rec, reason: `Change of ${(change * 100).toFixed(0)}% exceeds 40% limit` });
        continue;
      }

      // Update lift_tickets with new price for this ticket type (future tickets)
      await pool.query(
        `UPDATE lift_tickets SET price = $1 WHERE ticket_type = $2 AND valid_date >= CURRENT_DATE`,
        [new_price, ticket_type]
      );

      // Audit log
      await pool.query(
        `INSERT INTO pricing_audit_log (ticket_type, old_price, new_price, reason, applied_by, applied_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT DO NOTHING`,
        [ticket_type, current_price, new_price, rec.reason || 'AI recommendation', req.user?.id || 'system']
      ).catch(() => {}); // table may not exist yet

      applied.push(rec);
    }

    res.json({ success: true, applied, skipped, message: `Applied ${applied.length} price changes, skipped ${skipped.length}` });
  } catch (err) {
    if (err.statusCode === 503) return res.status(503).json({ success: false, error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/snow-conditions
router.post('/snow-conditions', aiRateLimiter, async (req, res) => {
  try {
    const { weather_data } = req.body;
    const snowReports = await pool.query('SELECT * FROM snow_reports ORDER BY report_date DESC LIMIT 7');
    const weatherStations = await pool.query('SELECT * FROM weather_stations ORDER BY last_updated DESC');
    const trails = await pool.query('SELECT name, difficulty, status, grooming_status, snowfall_last24h, conditions, last_groomed FROM trails ORDER BY name');
    const snowmakingOps = await pool.query("SELECT * FROM snowmaking_ops WHERE status = 'active'");

    const systemPrompt = `You are a professional ski resort snow conditions analyst.
Respond ONLY in valid JSON format:
{
  "executive_summary": string,
  "overall_rating": "excellent|good|fair|poor",
  "base_depth_inches": number,
  "snow_quality": string,
  "trail_conditions": [{ "name": string, "condition": string, "recommendation": string }],
  "snowmaking_impact": string,
  "forecast": string,
  "beginner_recommendation": string,
  "expert_recommendation": string
}`;

    const userPrompt = `Generate snow conditions report:
Weather: ${JSON.stringify(weather_data || {})}
Snow Reports: ${JSON.stringify(snowReports.rows)}
Weather Stations: ${JSON.stringify(weatherStations.rows)}
Trails: ${JSON.stringify(trails.rows)}
Snowmaking: ${JSON.stringify(snowmakingOps.rows)}`;

    const raw = await callAI(systemPrompt, userPrompt);
    const result = parseAIJson(raw);
    if (!result) {
      console.error('Snow conditions AI returned invalid JSON:', raw);
      return res.status(422).json({ success: false, error: 'AI returned invalid JSON response' });
    }
    await saveAIResult('/ai/snow-conditions', req.user?.id, 'Snow conditions report', result);
    res.json({ success: true, result });
  } catch (err) {
    if (err.statusCode === 503) return res.status(503).json({ success: false, error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/grooming-optimization
router.post('/grooming-optimization', aiRateLimiter, async (req, res) => {
  try {
    const { trail_data, weather_data } = req.body;
    const trails = await pool.query('SELECT * FROM trails ORDER BY last_groomed ASC');
    const weather = await pool.query('SELECT * FROM weather_stations ORDER BY last_updated DESC LIMIT 3');
    const snowReports = await pool.query('SELECT * FROM snow_reports ORDER BY report_date DESC LIMIT 3');
    const snowmaking = await pool.query("SELECT * FROM snowmaking_ops WHERE status IN ('active','scheduled') ORDER BY start_time DESC");

    const systemPrompt = `You are a ski resort grooming operations optimization AI.
Respond ONLY in valid JSON format:
{
  "grooming_schedule": [
    { "trail_name": string, "priority": number, "timing": string, "technique": string, "reason": string }
  ],
  "equipment_recommendations": string[],
  "defer_list": [{ "trail_name": string, "reason": string }],
  "coordination_notes": string,
  "estimated_completion_time": string
}`;

    const userPrompt = `Create optimized grooming schedule:
Trail Data: ${JSON.stringify(trail_data || {})}
Weather: ${JSON.stringify(weather_data || {})}
All Trails: ${JSON.stringify(trails.rows)}
Current Weather: ${JSON.stringify(weather.rows)}
Snow Reports: ${JSON.stringify(snowReports.rows)}
Snowmaking Ops: ${JSON.stringify(snowmaking.rows)}`;

    const raw = await callAI(systemPrompt, userPrompt);
    const result = parseAIJson(raw);
    if (!result) {
      console.error('Grooming optimization AI returned invalid JSON:', raw);
      return res.status(422).json({ success: false, error: 'AI returned invalid JSON response' });
    }
    await saveAIResult('/ai/grooming-optimization', req.user?.id, 'Grooming optimization', result);
    res.json({ success: true, result });
  } catch (err) {
    if (err.statusCode === 503) return res.status(503).json({ success: false, error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/guest-recommendations
router.post('/guest-recommendations', aiRateLimiter, async (req, res) => {
  try {
    const { guest_profile } = req.body;
    const trails = await pool.query("SELECT name, difficulty, status, conditions FROM trails WHERE status = 'open' ORDER BY difficulty");
    const events = await pool.query("SELECT event_name, event_type, location, start_date, end_date, price FROM events WHERE status = 'active' AND start_date >= NOW() ORDER BY start_date LIMIT 10");
    const lessons = await pool.query("SELECT lesson_type, skill_level, scheduled_date, start_time, price FROM lessons WHERE status = 'available' AND scheduled_date >= CURRENT_DATE ORDER BY scheduled_date LIMIT 10");
    const dining = await pool.query("SELECT outlet_name, cuisine_type, location, avg_price, menu_highlights FROM food_beverage WHERE status = 'open'");
    const weather = await pool.query('SELECT temperature, wind_speed, visibility, snow_depth FROM weather_stations ORDER BY last_updated DESC LIMIT 1');

    const systemPrompt = `You are a personalized ski resort concierge AI.
Respond ONLY in valid JSON format:
{
  "trail_recommendations": [{ "name": string, "reason": string, "difficulty": string }],
  "daily_itinerary": [{ "time": string, "activity": string, "location": string }],
  "dining_recommendations": [{ "outlet": string, "reason": string }],
  "lesson_suggestions": [{ "type": string, "level": string, "reason": string }],
  "event_recommendations": [{ "event": string, "reason": string }],
  "safety_tips": string[],
  "hidden_gems": string[]
}`;

    const userPrompt = `Create personalized recommendations:
Guest Profile: ${JSON.stringify(guest_profile || {})}
Open Trails: ${JSON.stringify(trails.rows)}
Events: ${JSON.stringify(events.rows)}
Lessons: ${JSON.stringify(lessons.rows)}
Dining: ${JSON.stringify(dining.rows)}
Weather: ${JSON.stringify(weather.rows)}`;

    const raw = await callAI(systemPrompt, userPrompt);
    const result = parseAIJson(raw);
    if (!result) {
      console.error('Guest recommendations AI returned invalid JSON:', raw);
      return res.status(422).json({ success: false, error: 'AI returned invalid JSON response' });
    }
    await saveAIResult('/ai/guest-recommendations', req.user?.id, `Guest profile: ${JSON.stringify(guest_profile || {}).slice(0, 100)}`, result);
    res.json({ success: true, result });
  } catch (err) {
    if (err.statusCode === 503) return res.status(503).json({ success: false, error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/marketing-content
router.post('/marketing-content', aiRateLimiter, async (req, res) => {
  try {
    const { campaign_type, target_audience, channel } = req.body;
    const snowReport = await pool.query('SELECT * FROM snow_reports ORDER BY report_date DESC LIMIT 1');
    const events = await pool.query("SELECT event_name, event_type, start_date, price FROM events WHERE status = 'active' AND start_date >= NOW() ORDER BY start_date LIMIT 5");
    const trails = await pool.query("SELECT COUNT(*) as open_trails FROM trails WHERE status = 'open'");
    const lifts = await pool.query("SELECT COUNT(*) as open_lifts FROM lifts WHERE status = 'operating'");
    const terrainPark = await pool.query("SELECT feature_name, feature_type, difficulty FROM terrain_park_features WHERE status = 'open'");

    const systemPrompt = `You are a creative ski resort marketing AI.
Respond ONLY in valid JSON format:
{
  "headlines": string[],
  "body_content": string,
  "cta_suggestions": string[],
  "hashtags": string[],
  "content_calendar": [{ "date_offset_days": number, "content_idea": string, "channel": string }],
  "ab_testing_variants": [{ "variant": string, "hypothesis": string }]
}`;

    const userPrompt = `Generate marketing content:
Campaign: ${campaign_type || 'general'}
Audience: ${target_audience || 'general'}
Channel: ${channel || 'social media'}
Snow Report: ${JSON.stringify(snowReport.rows[0] || {})}
Open Trails: ${JSON.stringify(trails.rows[0] || {})}
Open Lifts: ${JSON.stringify(lifts.rows[0] || {})}
Events: ${JSON.stringify(events.rows)}
Terrain Park: ${JSON.stringify(terrainPark.rows)}`;

    const raw = await callAI(systemPrompt, userPrompt);
    const result = parseAIJson(raw);
    if (!result) {
      console.error('Marketing content AI returned invalid JSON:', raw);
      return res.status(422).json({ success: false, error: 'AI returned invalid JSON response' });
    }
    await saveAIResult('/ai/marketing-content', req.user?.id, `${campaign_type} for ${target_audience}`, result);
    res.json({ success: true, result });
  } catch (err) {
    if (err.statusCode === 503) return res.status(503).json({ success: false, error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/staffing-prediction
router.post('/staffing-prediction', aiRateLimiter, async (req, res) => {
  try {
    const { date_range, special_events } = req.body;
    const currentStaffing = await pool.query("SELECT department, position, COUNT(*) as count FROM staffing WHERE status = 'active' GROUP BY department, position");
    const weather = await pool.query('SELECT * FROM weather_stations ORDER BY last_updated DESC LIMIT 3');
    const snowReport = await pool.query('SELECT * FROM snow_reports ORDER BY report_date DESC LIMIT 1');
    const events = await pool.query('SELECT event_name, event_type, start_date, capacity, registered FROM events WHERE start_date >= NOW() ORDER BY start_date LIMIT 10');
    const ticketSales = await pool.query('SELECT valid_date, COUNT(*) as tickets_sold FROM lift_tickets WHERE valid_date >= CURRENT_DATE GROUP BY valid_date ORDER BY valid_date');

    const systemPrompt = `You are a ski resort workforce management AI.
Respond ONLY in valid JSON format:
{
  "predicted_daily_guests": [{ "date": string, "count": number, "confidence": string }],
  "staffing_recommendations": [
    { "department": string, "current": number, "recommended": number, "reason": string }
  ],
  "critical_positions": string[],
  "overtime_recommendations": string[],
  "cost_savings": string[],
  "contingency_plans": string[],
  "training_suggestions": string[]
}`;

    const userPrompt = `Predict staffing needs:
Date Range: ${JSON.stringify(date_range || 'next 7 days')}
Special Events: ${JSON.stringify(special_events || [])}
Current Staffing: ${JSON.stringify(currentStaffing.rows)}
Weather: ${JSON.stringify(weather.rows)}
Snow Report: ${JSON.stringify(snowReport.rows[0] || {})}
Events: ${JSON.stringify(events.rows)}
Ticket Sales: ${JSON.stringify(ticketSales.rows)}`;

    const raw = await callAI(systemPrompt, userPrompt);
    const result = parseAIJson(raw);
    if (!result) {
      console.error('Staffing prediction AI returned invalid JSON:', raw);
      return res.status(422).json({ success: false, error: 'AI returned invalid JSON response' });
    }
    await saveAIResult('/ai/staffing-prediction', req.user?.id, `Staffing for ${date_range}`, result);
    res.json({ success: true, result });
  } catch (err) {
    if (err.statusCode === 503) return res.status(503).json({ success: false, error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/occupancy-forecast (predict resort busy-ness)
router.post('/occupancy-forecast', aiRateLimiter, async (req, res) => {
  try {
    const horizon = parseInt(req.body?.horizon_days) || 14;
    const occ = await pool.query(`
      SELECT date_trunc('day', check_in_date) as day, COUNT(*) as bookings
      FROM accommodations
      WHERE check_in_date >= NOW() - INTERVAL '60 days'
      GROUP BY 1 ORDER BY 1`).catch(() => ({ rows: [] }));
    const future = await pool.query(`
      SELECT date_trunc('day', check_in_date) as day, COUNT(*) as bookings
      FROM accommodations
      WHERE check_in_date BETWEEN NOW() AND NOW() + INTERVAL '${horizon} days'
      GROUP BY 1 ORDER BY 1`).catch(() => ({ rows: [] }));
    const passes = await pool.query(`SELECT COUNT(*) FROM season_passes WHERE status = 'active'`).catch(() => ({ rows: [{ count: 0 }] }));
    const prompt = `You are a ski-resort demand forecaster. Use historical bookings, on-the-books, season pass holders, and seasonality. Return ONLY JSON: {forecast:[{date,predicted_visitor_count,confidence}], peak_dates:[{date,recommended_premium_pct}], soft_dates:[{date,recommended_promo}], capacity_warnings:[{date,area,issue}], summary}.

Historical: ${JSON.stringify(occ.rows)}
On-the-books next ${horizon} days: ${JSON.stringify(future.rows)}
Active season passes: ${passes.rows[0].count}`;
    const ai = await callAI(prompt);
    const result = parseAIJson(ai) || { raw: ai };
    await saveAIResult('/ai/occupancy-forecast', req.user?.id, `Horizon ${horizon}`, result);
    res.json({ success: true, result });
  } catch (err) {
    if (err.statusCode === 503) return res.status(503).json({ success: false, error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/avalanche-risk-assessment
router.post('/avalanche-risk-assessment', aiRateLimiter, async (req, res) => {
  try {
    const { weather, snowpack, location } = req.body || {};
    const recent = await pool.query(`SELECT * FROM avalanche_control ORDER BY created_at DESC LIMIT 10`).catch(() => ({ rows: [] }));
    const snow = await pool.query(`SELECT * FROM snow_reports ORDER BY created_at DESC LIMIT 5`).catch(() => ({ rows: [] }));
    const prompt = `You are an avalanche-risk AI aligned with North American Avalanche Danger Scale. Return ONLY JSON: {danger_levels:{above_treeline:"low|moderate|considerable|high|extreme",near_treeline:"...",below_treeline:"..."}, problem_types:[{type:"storm_slab|wind_slab|persistent_slab|wet_slab|cornice|loose_dry|loose_wet",aspect:[],elevation:[],likelihood:"unlikely|possible|likely|very_likely|almost_certain",size:"small|large|very_large|historic"}], recommended_terrain:[], avoid_terrain:[], travel_advice:[], control_recommendations:[{location,method:"hand_charge|gazex|remote|closure"}], summary}.

Location: ${JSON.stringify(location || 'main mountain')}
Weather: ${JSON.stringify(weather || {})}
Snowpack: ${JSON.stringify(snowpack || {})}
Recent control work: ${JSON.stringify(recent.rows)}
Recent snow reports: ${JSON.stringify(snow.rows)}`;
    const ai = await callAI(prompt);
    const result = parseAIJson(ai) || { raw: ai };
    await saveAIResult('/ai/avalanche-risk-assessment', req.user?.id, JSON.stringify(location || ''), result);
    res.json({ success: true, result });
  } catch (err) {
    if (err.statusCode === 503) return res.status(503).json({ success: false, error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/equipment-maintenance-scheduling
router.post('/equipment-maintenance-scheduling', aiRateLimiter, async (req, res) => {
  try {
    const equipment = await pool.query(`SELECT * FROM equipment_maintenance ORDER BY id DESC LIMIT 100`).catch(() => ({ rows: [] }));
    const lifts = await pool.query(`SELECT id, name, status, last_maintenance_at, next_maintenance_at FROM lifts ORDER BY id`).catch(() => ({ rows: [] }));
    const horizon = parseInt(req.body?.horizon_days) || 30;
    const prompt = `You are an equipment-maintenance scheduling AI for a ski resort. Schedule maintenance during low-traffic windows before failure. Return ONLY JSON: {schedule:[{equipment_id,equipment,window_start,window_end,maintenance_type:"preventive|condition_based|corrective",estimated_hours,risk_if_deferred:"low|medium|high",required_techs,parts_needed:[]}], conflicts_with_events:[], lifts_priority_order:[], summary}.

Equipment maintenance records: ${JSON.stringify(equipment.rows)}
Lifts: ${JSON.stringify(lifts.rows)}
Horizon: ${horizon} days`;
    const ai = await callAI(prompt);
    const result = parseAIJson(ai) || { raw: ai };
    await saveAIResult('/ai/equipment-maintenance-scheduling', req.user?.id, `Horizon ${horizon}`, result);
    res.json({ success: true, result });
  } catch (err) {
    if (err.statusCode === 503) return res.status(503).json({ success: false, error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/instructor-scheduling
router.post('/instructor-scheduling', aiRateLimiter, async (req, res) => {
  try {
    const horizon = parseInt(req.body?.horizon_days) || 14;
    const instructors = await pool.query(`SELECT id, name, specialization, certification_level, languages, availability, hourly_rate, rating, years_experience FROM instructors ORDER BY id`).catch(() => ({ rows: [] }));
    const lessons = await pool.query(`SELECT lesson_type, skill_level, instructor_name, guest_count, scheduled_date, start_time, duration, status, meeting_point FROM lessons WHERE scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${horizon} days' ORDER BY scheduled_date, start_time`).catch(() => ({ rows: [] }));
    const prompt = `You are a ski-instructor scheduling AI. Match instructors to upcoming lessons based on specialization, certification, language, availability, rating, and load balancing. Return ONLY JSON: {assignments:[{lesson_date,lesson_type,skill_level,recommended_instructor,reason,confidence}], coverage_gaps:[{date,gap_type,severity:"low|medium|high",mitigation}], utilization:[{instructor,percent_booked}], hire_recommendations:[{specialization,reason}], summary}.

Instructors: ${JSON.stringify(instructors.rows)}
Upcoming lessons next ${horizon} days: ${JSON.stringify(lessons.rows)}`;
    const ai = await callAI(prompt);
    const result = parseAIJson(ai) || { raw: ai };
    await saveAIResult('/ai/instructor-scheduling', req.user?.id, `Horizon ${horizon}`, result);
    res.json({ success: true, result });
  } catch (err) {
    if (err.statusCode === 503) return res.status(503).json({ success: false, error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/churn-prediction
router.post('/churn-prediction', aiRateLimiter, async (req, res) => {
  try {
    const horizon = parseInt(req.body?.horizon_days) || 30;
    const passes = await pool.query(`SELECT id, holder_name, email, pass_type, season, price, start_date, end_date, status FROM season_passes ORDER BY id DESC LIMIT 500`).catch(() => ({ rows: [] }));
    const tickets = await pool.query(`SELECT ticket_type, COUNT(*) AS sold, AVG(price) AS avg_price FROM lift_tickets WHERE valid_date >= CURRENT_DATE - INTERVAL '90 days' GROUP BY ticket_type`).catch(() => ({ rows: [] }));
    const guestSvc = await pool.query(`SELECT request_type, priority, status, COUNT(*) AS count FROM guest_services WHERE created_at >= NOW() - INTERVAL '90 days' GROUP BY request_type, priority, status`).catch(() => ({ rows: [] }));
    const prompt = `You are a guest-churn prediction AI for a ski resort. Identify season-pass holders and segments at risk of not returning. Return ONLY JSON: {at_risk_segments:[{segment,churn_probability:0.0,size,key_drivers:[],recommended_outreach}], at_risk_holders:[{holder_name,email,pass_type,churn_probability:0.0,reason,retention_offer}], retention_strategies:[{strategy,target_segment,expected_retention_lift_pct}], leading_indicators:[{indicator,current_value,trend}], summary}.

Season passes: ${JSON.stringify(passes.rows.slice(0, 200))}
Recent ticket trends: ${JSON.stringify(tickets.rows)}
Recent guest service signals: ${JSON.stringify(guestSvc.rows)}
Horizon: ${horizon} days`;
    const ai = await callAI(prompt);
    const result = parseAIJson(ai) || { raw: ai };
    await saveAIResult('/ai/churn-prediction', req.user?.id, `Horizon ${horizon}`, result);
    res.json({ success: true, result });
  } catch (err) {
    if (err.statusCode === 503) return res.status(503).json({ success: false, error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/revenue-optimization
router.post('/revenue-optimization', aiRateLimiter, async (req, res) => {
  try {
    const horizon = parseInt(req.body?.horizon_days) || 30;
    const tickets = await pool.query(`SELECT ticket_type, price, status, COUNT(*) AS count, SUM(price) AS revenue FROM lift_tickets WHERE valid_date >= CURRENT_DATE - INTERVAL '90 days' GROUP BY ticket_type, price, status`).catch(() => ({ rows: [] }));
    const passes = await pool.query(`SELECT pass_type, COUNT(*) AS count, SUM(price) AS revenue FROM season_passes GROUP BY pass_type`).catch(() => ({ rows: [] }));
    const accommodations = await pool.query(`SELECT room_type, status, COUNT(*) AS count, AVG(price_per_night) AS avg_price FROM accommodations GROUP BY room_type, status`).catch(() => ({ rows: [] }));
    const fnb = await pool.query(`SELECT category, COUNT(*) AS items, AVG(price) AS avg_price FROM food_beverage GROUP BY category`).catch(() => ({ rows: [] }));
    const retail = await pool.query(`SELECT category, COUNT(*) AS items, AVG(price) AS avg_price, SUM(stock_quantity) AS stock FROM retail GROUP BY category`).catch(() => ({ rows: [] }));
    const lessons = await pool.query(`SELECT lesson_type, skill_level, COUNT(*) AS count, AVG(price) AS avg_price FROM lessons WHERE scheduled_date >= CURRENT_DATE - INTERVAL '90 days' GROUP BY lesson_type, skill_level`).catch(() => ({ rows: [] }));

    const prompt = `You are a ski-resort revenue optimization AI. Analyze cross-channel revenue (lift tickets, season passes, accommodations, F&B, retail, lessons) and recommend a coordinated optimization plan over the next ${horizon} days. Return ONLY JSON: {revenue_levers:[{channel,current_state,recommended_action,expected_uplift_pct,confidence:"low|medium|high"}], pricing_adjustments:[{channel,item,current_price,recommended_price,reason}], bundle_opportunities:[{name,components,target_segment,expected_attach_rate_pct}], capacity_optimizations:[{channel,issue,recommendation}], revenue_projection:{baseline,optimized,uplift_pct}, key_risks:[{risk,mitigation}], priority_actions:[{priority,action,owner,deadline}], summary}.

Lift tickets (90d): ${JSON.stringify(tickets.rows)}
Season passes: ${JSON.stringify(passes.rows)}
Accommodations: ${JSON.stringify(accommodations.rows)}
Food & beverage: ${JSON.stringify(fnb.rows)}
Retail: ${JSON.stringify(retail.rows)}
Lessons (90d): ${JSON.stringify(lessons.rows)}
Horizon: ${horizon} days`;
    const ai = await callAI(prompt);
    const result = parseAIJson(ai) || { raw: ai };
    await saveAIResult('/ai/revenue-optimization', req.user?.id, `Horizon ${horizon}`, result);
    res.json({ success: true, result });
  } catch (err) {
    if (err.statusCode === 503) return res.status(503).json({ success: false, error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

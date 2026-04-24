const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { callAI } = require('../services/aiService');

// POST /api/ai/dynamic-pricing
router.post('/dynamic-pricing', async (req, res) => {
  try {
    const { conditions, demand_data } = req.body;

    const ticketSales = await pool.query(
      'SELECT ticket_type, price, status, COUNT(*) as count FROM lift_tickets GROUP BY ticket_type, price, status'
    );
    const weather = await pool.query(
      'SELECT * FROM weather_stations ORDER BY last_updated DESC LIMIT 5'
    );
    const trailStatus = await pool.query(
      'SELECT name, difficulty, status, conditions, snowfall_last24h FROM trails WHERE status = $1',
      ['open']
    );

    const systemPrompt = `You are an expert ski resort revenue management AI. You analyze real-time data to generate dynamic pricing recommendations for lift tickets, season passes, and services. Consider factors like weather conditions, demand patterns, trail availability, time of day, day of week, holidays, and competitive pricing. Provide specific price recommendations with justifications.`;

    const userPrompt = `Analyze the following ski resort data and provide dynamic pricing recommendations:

Current Conditions: ${JSON.stringify(conditions || {})}
Demand Data: ${JSON.stringify(demand_data || {})}

Current Ticket Sales Summary:
${JSON.stringify(ticketSales.rows, null, 2)}

Current Weather Station Data:
${JSON.stringify(weather.rows, null, 2)}

Open Trails and Conditions:
${JSON.stringify(trailStatus.rows, null, 2)}

Please provide:
1. Recommended pricing adjustments for each ticket type
2. Suggested promotional pricing or discounts
3. Revenue optimization strategies
4. Demand forecast for the next 24-48 hours
5. Competitive positioning recommendations`;

    const result = await callAI(systemPrompt, userPrompt);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/snow-conditions
router.post('/snow-conditions', async (req, res) => {
  try {
    const { weather_data } = req.body;

    const snowReports = await pool.query(
      'SELECT * FROM snow_reports ORDER BY report_date DESC LIMIT 7'
    );
    const weatherStations = await pool.query(
      'SELECT * FROM weather_stations ORDER BY last_updated DESC'
    );
    const trails = await pool.query(
      'SELECT name, difficulty, status, grooming_status, snowfall_last24h, conditions, last_groomed FROM trails ORDER BY name'
    );
    const snowmakingOps = await pool.query(
      'SELECT * FROM snowmaking_ops WHERE status = $1',
      ['active']
    );

    const systemPrompt = `You are a professional ski resort snow conditions analyst. You generate comprehensive, accurate snow condition reports for guests and operations staff. Your reports should be detailed, safety-conscious, and helpful for planning ski days. Include specific trail-by-trail assessments when data is available.`;

    const userPrompt = `Generate a comprehensive snow conditions report based on the following data:

Additional Weather Input: ${JSON.stringify(weather_data || {})}

Recent Snow Reports (last 7 days):
${JSON.stringify(snowReports.rows, null, 2)}

Weather Station Readings:
${JSON.stringify(weatherStations.rows, null, 2)}

Trail Conditions:
${JSON.stringify(trails.rows, null, 2)}

Active Snowmaking Operations:
${JSON.stringify(snowmakingOps.rows, null, 2)}

Please provide:
1. Executive summary of current conditions
2. Detailed trail-by-trail condition assessment
3. Snow quality analysis (powder, packed, icy, etc.)
4. Snowmaking impact and coverage
5. Forecast and expected condition changes
6. Recommendations for different skill levels`;

    const result = await callAI(systemPrompt, userPrompt);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/grooming-optimization
router.post('/grooming-optimization', async (req, res) => {
  try {
    const { trail_data, weather_data } = req.body;

    const trails = await pool.query(
      'SELECT * FROM trails ORDER BY last_groomed ASC'
    );
    const weather = await pool.query(
      'SELECT * FROM weather_stations ORDER BY last_updated DESC LIMIT 3'
    );
    const snowReports = await pool.query(
      'SELECT * FROM snow_reports ORDER BY report_date DESC LIMIT 3'
    );
    const snowmaking = await pool.query(
      'SELECT * FROM snowmaking_ops WHERE status IN ($1, $2) ORDER BY start_time DESC',
      ['active', 'scheduled']
    );

    const systemPrompt = `You are a ski resort grooming operations optimization AI. You analyze trail conditions, weather forecasts, guest traffic patterns, and equipment availability to create optimal grooming schedules. Your goal is to maximize trail quality, guest satisfaction, and operational efficiency while minimizing fuel costs and equipment wear.`;

    const userPrompt = `Create an optimized grooming schedule based on the following data:

Additional Trail Data: ${JSON.stringify(trail_data || {})}
Additional Weather Data: ${JSON.stringify(weather_data || {})}

All Trails (sorted by last groomed):
${JSON.stringify(trails.rows, null, 2)}

Current Weather Conditions:
${JSON.stringify(weather.rows, null, 2)}

Recent Snow Reports:
${JSON.stringify(snowReports.rows, null, 2)}

Snowmaking Operations:
${JSON.stringify(snowmaking.rows, null, 2)}

Please provide:
1. Priority-ranked grooming schedule for tonight/tomorrow
2. Recommended grooming techniques for each trail (corduroy, mogul management, etc.)
3. Equipment deployment recommendations
4. Timing optimization (when to groom each trail)
5. Areas to skip or defer grooming and why
6. Coordination notes with snowmaking operations`;

    const result = await callAI(systemPrompt, userPrompt);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/guest-recommendations
router.post('/guest-recommendations', async (req, res) => {
  try {
    const { guest_profile } = req.body;

    const trails = await pool.query(
      'SELECT name, difficulty, status, conditions FROM trails WHERE status = $1 ORDER BY difficulty',
      ['open']
    );
    const events = await pool.query(
      'SELECT event_name, event_type, location, start_date, end_date, price FROM events WHERE status = $1 AND start_date >= NOW() ORDER BY start_date LIMIT 10',
      ['active']
    );
    const lessons = await pool.query(
      'SELECT lesson_type, skill_level, scheduled_date, start_time, price FROM lessons WHERE status = $1 AND scheduled_date >= CURRENT_DATE ORDER BY scheduled_date LIMIT 10',
      ['available']
    );
    const dining = await pool.query(
      'SELECT outlet_name, cuisine_type, location, avg_price, menu_highlights FROM food_beverage WHERE status = $1',
      ['open']
    );
    const weather = await pool.query(
      'SELECT temperature, wind_speed, visibility, snow_depth FROM weather_stations ORDER BY last_updated DESC LIMIT 1'
    );

    const systemPrompt = `You are a personalized ski resort concierge AI. You create tailored recommendations for guests based on their skill level, preferences, group composition, and current resort conditions. Your recommendations should be specific, actionable, and designed to maximize the guest's enjoyment and safety.`;

    const userPrompt = `Create personalized recommendations for this guest:

Guest Profile: ${JSON.stringify(guest_profile || {})}

Available Open Trails:
${JSON.stringify(trails.rows, null, 2)}

Upcoming Events:
${JSON.stringify(events.rows, null, 2)}

Available Lessons:
${JSON.stringify(lessons.rows, null, 2)}

Dining Options:
${JSON.stringify(dining.rows, null, 2)}

Current Weather:
${JSON.stringify(weather.rows, null, 2)}

Please provide:
1. Recommended trails for their skill level and current conditions
2. Suggested daily itinerary with timing
3. Dining recommendations based on location and preferences
4. Lesson or activity suggestions
5. Event recommendations
6. Safety tips specific to current conditions
7. Hidden gems or special experiences to try`;

    const result = await callAI(systemPrompt, userPrompt);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/marketing-content
router.post('/marketing-content', async (req, res) => {
  try {
    const { campaign_type, target_audience, channel } = req.body;

    const snowReport = await pool.query(
      'SELECT * FROM snow_reports ORDER BY report_date DESC LIMIT 1'
    );
    const events = await pool.query(
      'SELECT event_name, event_type, start_date, price FROM events WHERE status = $1 AND start_date >= NOW() ORDER BY start_date LIMIT 5',
      ['active']
    );
    const trails = await pool.query(
      'SELECT COUNT(*) as open_trails FROM trails WHERE status = $1',
      ['open']
    );
    const lifts = await pool.query(
      'SELECT COUNT(*) as open_lifts FROM lifts WHERE status = $1',
      ['operating']
    );
    const terrainPark = await pool.query(
      'SELECT feature_name, feature_type, difficulty FROM terrain_park_features WHERE status = $1',
      ['open']
    );

    const systemPrompt = `You are a creative ski resort marketing AI specializing in generating compelling marketing content. You create engaging, on-brand content for various channels including social media, email, website, and print. Your content highlights the unique mountain experience, current conditions, and special offerings. Write with enthusiasm and authenticity while maintaining professionalism.`;

    const userPrompt = `Generate marketing content with the following parameters:

Campaign Type: ${campaign_type || 'general promotion'}
Target Audience: ${target_audience || 'general'}
Channel: ${channel || 'social media'}

Current Resort Data:
- Latest Snow Report: ${JSON.stringify(snowReport.rows[0] || {})}
- Open Trails: ${JSON.stringify(trails.rows[0] || {})}
- Open Lifts: ${JSON.stringify(lifts.rows[0] || {})}
- Upcoming Events: ${JSON.stringify(events.rows, null, 2)}
- Terrain Park Features: ${JSON.stringify(terrainPark.rows, null, 2)}

Please provide:
1. Headline/subject line options (3-5 variations)
2. Main body content tailored to the channel
3. Call-to-action suggestions
4. Hashtag recommendations (if social media)
5. Content calendar suggestions for the next 2 weeks
6. A/B testing recommendations for messaging`;

    const result = await callAI(systemPrompt, userPrompt);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/staffing-prediction
router.post('/staffing-prediction', async (req, res) => {
  try {
    const { date_range, special_events } = req.body;

    const currentStaffing = await pool.query(
      'SELECT department, position, COUNT(*) as count FROM staffing WHERE status = $1 GROUP BY department, position',
      ['active']
    );
    const weather = await pool.query(
      'SELECT * FROM weather_stations ORDER BY last_updated DESC LIMIT 3'
    );
    const snowReport = await pool.query(
      'SELECT * FROM snow_reports ORDER BY report_date DESC LIMIT 1'
    );
    const events = await pool.query(
      'SELECT event_name, event_type, start_date, capacity, registered FROM events WHERE start_date >= NOW() ORDER BY start_date LIMIT 10'
    );
    const ticketSales = await pool.query(
      'SELECT valid_date, COUNT(*) as tickets_sold FROM lift_tickets WHERE valid_date >= CURRENT_DATE GROUP BY valid_date ORDER BY valid_date'
    );
    const parking = await pool.query(
      'SELECT lot_name, total_spaces, occupied_spaces FROM parking_lots'
    );

    const systemPrompt = `You are a ski resort workforce management AI. You predict staffing needs based on weather forecasts, historical patterns, event schedules, advance bookings, and operational requirements. Your recommendations ensure adequate coverage for safety, guest service, and operational efficiency while optimizing labor costs.`;

    const userPrompt = `Predict staffing needs for the resort:

Date Range: ${JSON.stringify(date_range || 'next 7 days')}
Special Events: ${JSON.stringify(special_events || [])}

Current Staffing Levels by Department:
${JSON.stringify(currentStaffing.rows, null, 2)}

Weather Conditions:
${JSON.stringify(weather.rows, null, 2)}

Latest Snow Report:
${JSON.stringify(snowReport.rows[0] || {})}

Upcoming Events:
${JSON.stringify(events.rows, null, 2)}

Advance Ticket Sales:
${JSON.stringify(ticketSales.rows, null, 2)}

Parking Lot Status:
${JSON.stringify(parking.rows, null, 2)}

Please provide:
1. Predicted daily guest count for the date range
2. Department-by-department staffing recommendations
3. Critical positions that need additional coverage
4. Overtime and on-call recommendations
5. Cost-saving opportunities without compromising service
6. Contingency plans for weather changes
7. Training or cross-training suggestions`;

    const result = await callAI(systemPrompt, userPrompt);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { pool } = require('./db');

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:4000';

// Security middleware
app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// Auth middleware
const authMiddleware = require('./middleware/auth');

// Public routes
app.use('/api/auth', require('./routes/auth'));
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/reservation-workflow', authMiddleware, require('./routes/reservationWorkflow'));
app.use(/^\/api\/(?:gap-|ai-)/, authMiddleware, (req, res) => res.status(503).json({
  error: 'Generated AI and gap routes are quarantined; use /api/reservation-workflow', retryable: false,
}));

// Protected routes - all require auth
const protectedRoutes = [
  ['/api/ai', require('./routes/ai')],
  ['/api/lift-tickets', require('./routes/liftTickets')],
  ['/api/season-passes', require('./routes/seasonPasses')],
  ['/api/lifts', require('./routes/lifts')],
  ['/api/trails', require('./routes/trails')],
  ['/api/snowmaking', require('./routes/snowmaking')],
  ['/api/patrol-incidents', require('./routes/patrolIncidents')],
  ['/api/rental-inventory', require('./routes/rentalInventory')],
  ['/api/lessons', require('./routes/lessons')],
  ['/api/instructors', require('./routes/instructors')],
  ['/api/snow-reports', require('./routes/snowReports')],
  ['/api/parking', require('./routes/parking')],
  ['/api/food-beverage', require('./routes/foodBeverage')],
  ['/api/retail', require('./routes/retail')],
  ['/api/childcare', require('./routes/childcare')],
  ['/api/lost-found', require('./routes/lostFound')],
  ['/api/guest-services', require('./routes/guestServices')],
  ['/api/events', require('./routes/events')],
  ['/api/accommodations', require('./routes/accommodations')],
  ['/api/shuttles', require('./routes/shuttles')],
  ['/api/equipment-maintenance', require('./routes/equipmentMaintenance')],
  ['/api/rfid-access', require('./routes/rfidAccess')],
  ['/api/weather-stations', require('./routes/weatherStations')],
  ['/api/avalanche-control', require('./routes/avalancheControl')],
  ['/api/staffing', require('./routes/staffing')],
  ['/api/terrain-park', require('./routes/terrainPark')],
];

protectedRoutes.forEach(([path, router]) => {
  app.use(path, authMiddleware, router);
});

// Custom Views (mounted BEFORE error handler / 404)
app.use('/api/custom-views', authMiddleware, require('./routes/customViews'));

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// AI feature mount: revpasday
app.use('/api/ai/revpasday', require('./routes/ai-revpasday'));
// === Batch 07 Gaps & Frontend Mounts ===
app.use('/api/gap-no-occupancyforecast-for-resort-busyness', require('./routes/gap-no-occupancyforecast-for-resort-busyness'));
app.use('/api/gap-no-revenueoptimization-bundle-pricing', require('./routes/gap-no-revenueoptimization-bundle-pricing'));
app.use('/api/gap-no-avalancheriskassessment-ml', require('./routes/gap-no-avalancheriskassessment-ml'));
app.use('/api/gap-no-equipmentmaintenancescheduling-ai', require('./routes/gap-no-equipmentmaintenancescheduling-ai'));
app.use('/api/gap-no-instructorscheduling-demand-matching', require('./routes/gap-no-instructorscheduling-demand-matching'));
app.use('/api/gap-no-churnprediction-returning-guest-likelihoo', require('./routes/gap-no-churnprediction-returning-guest-likelihoo'));
app.use('/api/gap-no-realtime-lift-line-wait-estimation', require('./routes/gap-no-realtime-lift-line-wait-estimation'));
app.use('/api/gap-no-public-online-lesson-booking-widget', require('./routes/gap-no-public-online-lesson-booking-widget'));
app.use('/api/gap-no-food-ordering-pos-integration', require('./routes/gap-no-food-ordering-pos-integration'));
app.use('/api/gap-limited-weather-api-integration-stations-are', require('./routes/gap-limited-weather-api-integration-stations-are'));
app.use('/api/gap-no-lift-ticket-pos-integration', require('./routes/gap-no-lift-ticket-pos-integration'));
app.use('/api/gap-no-guest-mobile-app-companion', require('./routes/gap-no-guest-mobile-app-companion'));
app.use('/api/gap-no-notificationssms-for-guests', require('./routes/gap-no-notificationssms-for-guests'));
// === End Batch 07 ===

const PORT = process.env.BACKEND_PORT || 4001;
async function start(){const result=await pool.query("SELECT to_regclass('public.resort_reservations') AS workflow_table");if(!result.rows[0].workflow_table)throw new Error('Database migrations are required; run ./scripts/migrate.sh');app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));}
start().catch(error=>{console.error('Failed to start server:',error.message);process.exitCode=1;});
module.exports = app;

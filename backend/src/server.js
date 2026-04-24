require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route imports
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const liftTicketRoutes = require('./routes/liftTickets');
const seasonPassRoutes = require('./routes/seasonPasses');
const liftRoutes = require('./routes/lifts');
const trailRoutes = require('./routes/trails');
const snowmakingRoutes = require('./routes/snowmaking');
const patrolIncidentRoutes = require('./routes/patrolIncidents');
const rentalInventoryRoutes = require('./routes/rentalInventory');
const lessonRoutes = require('./routes/lessons');
const instructorRoutes = require('./routes/instructors');
const snowReportRoutes = require('./routes/snowReports');
const parkingRoutes = require('./routes/parking');
const foodBeverageRoutes = require('./routes/foodBeverage');
const retailRoutes = require('./routes/retail');
const childcareRoutes = require('./routes/childcare');
const lostFoundRoutes = require('./routes/lostFound');
const guestServiceRoutes = require('./routes/guestServices');
const eventRoutes = require('./routes/events');
const accommodationRoutes = require('./routes/accommodations');
const shuttleRoutes = require('./routes/shuttles');
const equipmentMaintenanceRoutes = require('./routes/equipmentMaintenance');
const rfidAccessRoutes = require('./routes/rfidAccess');
const weatherStationRoutes = require('./routes/weatherStations');
const avalancheControlRoutes = require('./routes/avalancheControl');
const staffingRoutes = require('./routes/staffing');
const terrainParkRoutes = require('./routes/terrainPark');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/lift-tickets', liftTicketRoutes);
app.use('/api/season-passes', seasonPassRoutes);
app.use('/api/lifts', liftRoutes);
app.use('/api/trails', trailRoutes);
app.use('/api/snowmaking', snowmakingRoutes);
app.use('/api/patrol-incidents', patrolIncidentRoutes);
app.use('/api/rental-inventory', rentalInventoryRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/snow-reports', snowReportRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/food-beverage', foodBeverageRoutes);
app.use('/api/retail', retailRoutes);
app.use('/api/childcare', childcareRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api/guest-services', guestServiceRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/shuttles', shuttleRoutes);
app.use('/api/equipment-maintenance', equipmentMaintenanceRoutes);
app.use('/api/rfid-access', rfidAccessRoutes);
app.use('/api/weather-stations', weatherStationRoutes);
app.use('/api/avalanche-control', avalancheControlRoutes);
app.use('/api/staffing', staffingRoutes);
app.use('/api/terrain-park', terrainParkRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.BACKEND_PORT || 4001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
if (process.env.ALLOW_DESTRUCTIVE_SEED !== 'true') throw new Error('Set ALLOW_DESTRUCTIVE_SEED=true to run the destructive seed explicitly');
if (!process.env.SEED_ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD.length < 12) throw new Error('SEED_ADMIN_PASSWORD must contain at least 12 characters');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🏔️  Alpine Peak Resort - Database Seeding');
    console.log('==========================================\n');

    // Drop all tables
    console.log('Dropping existing tables...');
    await client.query(`
      DROP TABLE IF EXISTS pricing_audit_log CASCADE;
      DROP TABLE IF EXISTS ai_results CASCADE;
      DROP TABLE IF EXISTS terrain_park_features CASCADE;
      DROP TABLE IF EXISTS staffing CASCADE;
      DROP TABLE IF EXISTS avalanche_control CASCADE;
      DROP TABLE IF EXISTS weather_stations CASCADE;
      DROP TABLE IF EXISTS rfid_access CASCADE;
      DROP TABLE IF EXISTS equipment_maintenance CASCADE;
      DROP TABLE IF EXISTS shuttles CASCADE;
      DROP TABLE IF EXISTS accommodations CASCADE;
      DROP TABLE IF EXISTS events CASCADE;
      DROP TABLE IF EXISTS guest_services CASCADE;
      DROP TABLE IF EXISTS lost_found CASCADE;
      DROP TABLE IF EXISTS childcare CASCADE;
      DROP TABLE IF EXISTS retail_transactions CASCADE;
      DROP TABLE IF EXISTS food_beverage CASCADE;
      DROP TABLE IF EXISTS parking_lots CASCADE;
      DROP TABLE IF EXISTS snow_reports CASCADE;
      DROP TABLE IF EXISTS instructors CASCADE;
      DROP TABLE IF EXISTS lessons CASCADE;
      DROP TABLE IF EXISTS rental_inventory CASCADE;
      DROP TABLE IF EXISTS patrol_incidents CASCADE;
      DROP TABLE IF EXISTS snowmaking_ops CASCADE;
      DROP TABLE IF EXISTS trails CASCADE;
      DROP TABLE IF EXISTS lifts CASCADE;
      DROP TABLE IF EXISTS season_passes CASCADE;
      DROP TABLE IF EXISTS lift_tickets CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log('All tables dropped.\n');

    // Create tables
    console.log('Creating tables...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS lift_tickets (
        id SERIAL PRIMARY KEY,
        guest_name VARCHAR(255),
        ticket_type VARCHAR(50),
        price DECIMAL(10,2),
        purchase_date DATE,
        valid_date DATE,
        status VARCHAR(50),
        payment_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS season_passes (
        id SERIAL PRIMARY KEY,
        holder_name VARCHAR(255),
        email VARCHAR(255),
        pass_type VARCHAR(50),
        season VARCHAR(20),
        price DECIMAL(10,2),
        start_date DATE,
        end_date DATE,
        photo_url VARCHAR(500),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS lifts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        type VARCHAR(50),
        capacity INT,
        status VARCHAR(50),
        wait_time INT,
        vertical_rise INT,
        length INT,
        speed DECIMAL(5,2),
        last_maintenance DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS trails (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        difficulty VARCHAR(50),
        status VARCHAR(50),
        grooming_status VARCHAR(50),
        length DECIMAL(5,2),
        vertical_drop INT,
        snowfall_last24h DECIMAL(5,2),
        conditions VARCHAR(100),
        last_groomed TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS snowmaking_ops (
        id SERIAL PRIMARY KEY,
        trail_name VARCHAR(255),
        gun_type VARCHAR(50),
        status VARCHAR(50),
        water_usage DECIMAL(10,2),
        energy_usage DECIMAL(10,2),
        temperature DECIMAL(5,2),
        humidity DECIMAL(5,2),
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS patrol_incidents (
        id SERIAL PRIMARY KEY,
        incident_type VARCHAR(100),
        location VARCHAR(255),
        severity VARCHAR(50),
        description TEXT,
        patroller_name VARCHAR(255),
        guest_name VARCHAR(255),
        guest_age INT,
        status VARCHAR(50),
        reported_at TIMESTAMP DEFAULT NOW(),
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS rental_inventory (
        id SERIAL PRIMARY KEY,
        item_type VARCHAR(50),
        brand VARCHAR(100),
        model VARCHAR(100),
        size VARCHAR(20),
        condition VARCHAR(50),
        status VARCHAR(50),
        daily_rate DECIMAL(10,2),
        last_serviced DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        lesson_type VARCHAR(50),
        skill_level VARCHAR(50),
        instructor_name VARCHAR(255),
        guest_name VARCHAR(255),
        guest_count INT,
        scheduled_date DATE,
        start_time TIME,
        duration INT,
        price DECIMAL(10,2),
        status VARCHAR(50),
        meeting_point VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS instructors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        specialization VARCHAR(100),
        certification_level VARCHAR(50),
        languages VARCHAR(255),
        availability VARCHAR(50),
        hourly_rate DECIMAL(10,2),
        rating DECIMAL(3,2),
        years_experience INT,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS snow_reports (
        id SERIAL PRIMARY KEY,
        report_date DATE,
        new_snow DECIMAL(5,2),
        base_depth DECIMAL(5,2),
        conditions VARCHAR(100),
        temperature_high DECIMAL(5,2),
        temperature_low DECIMAL(5,2),
        wind_speed DECIMAL(5,2),
        wind_direction VARCHAR(10),
        visibility VARCHAR(50),
        trails_open INT,
        lifts_open INT,
        published BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS parking_lots (
        id SERIAL PRIMARY KEY,
        lot_name VARCHAR(255),
        total_spaces INT,
        occupied_spaces INT,
        status VARCHAR(50),
        lot_type VARCHAR(50),
        rate DECIMAL(10,2),
        distance_to_lodge VARCHAR(50),
        shuttle_available BOOLEAN,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS food_beverage (
        id SERIAL PRIMARY KEY,
        outlet_name VARCHAR(255),
        location VARCHAR(255),
        cuisine_type VARCHAR(100),
        capacity INT,
        current_occupancy INT,
        status VARCHAR(50),
        opening_time TIME,
        closing_time TIME,
        avg_price DECIMAL(10,2),
        menu_highlights TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS retail_transactions (
        id SERIAL PRIMARY KEY,
        store_name VARCHAR(255),
        item_name VARCHAR(255),
        category VARCHAR(100),
        quantity INT,
        unit_price DECIMAL(10,2),
        total_price DECIMAL(10,2),
        payment_method VARCHAR(50),
        customer_name VARCHAR(255),
        transaction_date TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS childcare (
        id SERIAL PRIMARY KEY,
        child_name VARCHAR(255),
        parent_name VARCHAR(255),
        parent_phone VARCHAR(20),
        age INT,
        check_in TIMESTAMP,
        check_out TIMESTAMP,
        special_needs TEXT,
        meal_plan VARCHAR(50),
        status VARCHAR(50),
        rate DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS lost_found (
        id SERIAL PRIMARY KEY,
        item_description VARCHAR(500),
        category VARCHAR(100),
        location_found VARCHAR(255),
        found_date DATE,
        finder_name VARCHAR(255),
        claimed_by VARCHAR(255),
        claimed_date DATE,
        status VARCHAR(50),
        storage_location VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS guest_services (
        id SERIAL PRIMARY KEY,
        guest_name VARCHAR(255),
        request_type VARCHAR(100),
        description TEXT,
        priority VARCHAR(50),
        status VARCHAR(50),
        assigned_to VARCHAR(255),
        location VARCHAR(255),
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        event_name VARCHAR(255),
        event_type VARCHAR(100),
        description TEXT,
        location VARCHAR(255),
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        capacity INT,
        registered INT,
        price DECIMAL(10,2),
        status VARCHAR(50),
        organizer VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS accommodations (
        id SERIAL PRIMARY KEY,
        property_name VARCHAR(255),
        room_type VARCHAR(100),
        capacity INT,
        price_per_night DECIMAL(10,2),
        amenities TEXT,
        status VARCHAR(50),
        guest_name VARCHAR(255),
        check_in DATE,
        check_out DATE,
        booking_status VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS shuttles (
        id SERIAL PRIMARY KEY,
        route_name VARCHAR(255),
        vehicle_id VARCHAR(50),
        driver_name VARCHAR(255),
        capacity INT,
        current_passengers INT,
        departure_time TIME,
        arrival_time TIME,
        status VARCHAR(50),
        frequency_minutes INT,
        stops TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS equipment_maintenance (
        id SERIAL PRIMARY KEY,
        equipment_name VARCHAR(255),
        equipment_type VARCHAR(100),
        maintenance_type VARCHAR(100),
        description TEXT,
        technician VARCHAR(255),
        status VARCHAR(50),
        priority VARCHAR(50),
        scheduled_date DATE,
        completed_date DATE,
        cost DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS rfid_access (
        id SERIAL PRIMARY KEY,
        card_id VARCHAR(100),
        holder_name VARCHAR(255),
        access_point VARCHAR(255),
        access_type VARCHAR(50),
        timestamp TIMESTAMP DEFAULT NOW(),
        pass_type VARCHAR(50),
        valid BOOLEAN,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS weather_stations (
        id SERIAL PRIMARY KEY,
        station_name VARCHAR(255),
        location VARCHAR(255),
        elevation INT,
        temperature DECIMAL(5,2),
        humidity DECIMAL(5,2),
        wind_speed DECIMAL(5,2),
        wind_direction VARCHAR(10),
        barometric_pressure DECIMAL(7,2),
        snow_depth DECIMAL(5,2),
        visibility DECIMAL(5,2),
        last_updated TIMESTAMP DEFAULT NOW(),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS avalanche_control (
        id SERIAL PRIMARY KEY,
        zone_name VARCHAR(255),
        risk_level VARCHAR(50),
        control_method VARCHAR(100),
        team_lead VARCHAR(255),
        team_size INT,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        result TEXT,
        weather_conditions VARCHAR(255),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS staffing (
        id SERIAL PRIMARY KEY,
        employee_name VARCHAR(255),
        department VARCHAR(100),
        position VARCHAR(100),
        shift_date DATE,
        shift_start TIME,
        shift_end TIME,
        status VARCHAR(50),
        hourly_rate DECIMAL(10,2),
        hours_worked DECIMAL(5,2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS terrain_park_features (
        id SERIAL PRIMARY KEY,
        feature_name VARCHAR(255),
        feature_type VARCHAR(100),
        size VARCHAR(50),
        difficulty VARCHAR(50),
        status VARCHAR(50),
        location VARCHAR(255),
        last_inspected TIMESTAMP,
        inspector VARCHAR(255),
        condition VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ai_results (
        id SERIAL PRIMARY KEY,
        endpoint VARCHAR(255),
        user_id INTEGER,
        prompt_summary TEXT,
        result JSONB,
        model VARCHAR(200),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS pricing_audit_log (
        id SERIAL PRIMARY KEY,
        applied_by INTEGER,
        ticket_type VARCHAR(100),
        old_price DECIMAL(10,2),
        new_price DECIMAL(10,2),
        reason TEXT,
        confidence DECIMAL(5,2),
        applied_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('All 28 tables created.\n');

    // Seed admin user
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 12);
    await client.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Admin', 'admin@alpinepeak.com', $1, 'admin')
    `, [hashedPassword]);
    console.log('Admin user created with the environment-provided credential.\n');

    // Seed lift_tickets
    console.log('Seeding lift_tickets...');
    await client.query(`
      INSERT INTO lift_tickets (guest_name, ticket_type, price, purchase_date, valid_date, status, payment_method) VALUES
      ('James Mitchell', 'Adult Full Day', 129.00, '2025-01-10', '2025-01-12', 'active', 'credit_card'),
      ('Sarah Chen', 'Adult Half Day', 89.00, '2025-01-11', '2025-01-11', 'used', 'credit_card'),
      ('Michael Torres', 'Child Full Day', 79.00, '2025-01-12', '2025-01-15', 'active', 'debit_card'),
      ('Emily Watson', 'Senior Full Day', 99.00, '2025-01-13', '2025-01-13', 'used', 'cash'),
      ('Robert Kim', 'Adult Full Day', 139.00, '2025-01-14', '2025-01-18', 'active', 'credit_card'),
      ('Lisa Anderson', 'Adult 2-Day', 239.00, '2025-01-15', '2025-01-20', 'active', 'credit_card'),
      ('David Park', 'Child Half Day', 55.00, '2025-01-15', '2025-01-16', 'expired', 'debit_card'),
      ('Jennifer Lopez', 'Adult Full Day', 129.00, '2025-01-16', '2025-01-17', 'refunded', 'credit_card'),
      ('Thomas Brown', 'Senior Half Day', 69.00, '2025-01-17', '2025-01-19', 'active', 'cash'),
      ('Amanda Rivera', 'Adult Full Day', 139.00, '2025-01-18', '2025-01-20', 'active', 'credit_card'),
      ('Chris Nguyen', 'Child Full Day', 79.00, '2025-01-18', '2025-01-18', 'used', 'debit_card'),
      ('Karen White', 'Adult 3-Day', 349.00, '2025-01-19', '2025-01-22', 'active', 'credit_card'),
      ('Brian Martinez', 'Adult Full Day', 129.00, '2025-01-20', '2025-01-21', 'active', 'apple_pay'),
      ('Michelle Lee', 'Senior Full Day', 99.00, '2025-01-20', '2025-01-20', 'used', 'credit_card'),
      ('Daniel Harris', 'Adult Half Day', 89.00, '2025-01-21', '2025-01-22', 'active', 'credit_card'),
      ('Rachel Green', 'Child Full Day', 79.00, '2025-01-21', '2025-01-25', 'active', 'debit_card')
    `);

    // Seed season_passes
    console.log('Seeding season_passes...');
    await client.query(`
      INSERT INTO season_passes (holder_name, email, pass_type, season, price, start_date, end_date, photo_url, status) VALUES
      ('John Harrison', 'john.h@email.com', 'Unlimited', '2024-2025', 1499.00, '2024-11-01', '2025-04-30', '/photos/john_h.jpg', 'active'),
      ('Maria Gonzalez', 'maria.g@email.com', 'Unlimited', '2024-2025', 1499.00, '2024-11-01', '2025-04-30', '/photos/maria_g.jpg', 'active'),
      ('William Taylor', 'will.t@email.com', 'Weekday', '2024-2025', 899.00, '2024-11-01', '2025-04-30', '/photos/will_t.jpg', 'active'),
      ('Ashley Johnson', 'ashley.j@email.com', 'Unlimited', '2024-2025', 1499.00, '2024-11-01', '2025-04-30', '/photos/ashley_j.jpg', 'suspended'),
      ('Kevin O''Brien', 'kevin.ob@email.com', 'Senior Unlimited', '2024-2025', 1099.00, '2024-11-01', '2025-04-30', '/photos/kevin_ob.jpg', 'active'),
      ('Samantha Reed', 'sam.r@email.com', 'Child Season', '2024-2025', 649.00, '2024-11-01', '2025-04-30', '/photos/sam_r.jpg', 'active'),
      ('Christopher Young', 'chris.y@email.com', 'Unlimited Plus', '2024-2025', 1799.00, '2024-11-01', '2025-04-30', '/photos/chris_y.jpg', 'active'),
      ('Nicole Adams', 'nicole.a@email.com', 'Weekday', '2024-2025', 899.00, '2024-11-01', '2025-04-30', '/photos/nicole_a.jpg', 'active'),
      ('Brandon Scott', 'brandon.s@email.com', 'Unlimited', '2024-2025', 1499.00, '2024-11-01', '2025-04-30', '/photos/brandon_s.jpg', 'expired'),
      ('Megan Clark', 'megan.c@email.com', '10-Day Flex', '2024-2025', 799.00, '2024-11-01', '2025-04-30', '/photos/megan_c.jpg', 'active'),
      ('Tyler Wright', 'tyler.w@email.com', 'Unlimited', '2024-2025', 1499.00, '2024-11-01', '2025-04-30', '/photos/tyler_w.jpg', 'active'),
      ('Laura Hernandez', 'laura.h@email.com', 'Weekday', '2024-2025', 899.00, '2024-11-01', '2025-04-30', '/photos/laura_h.jpg', 'active'),
      ('Jason King', 'jason.k@email.com', 'Senior Unlimited', '2024-2025', 1099.00, '2024-11-01', '2025-04-30', '/photos/jason_k.jpg', 'active'),
      ('Stephanie Moore', 'steph.m@email.com', 'Unlimited Plus', '2024-2025', 1799.00, '2024-11-01', '2025-04-30', '/photos/steph_m.jpg', 'active'),
      ('Ryan Phillips', 'ryan.p@email.com', '10-Day Flex', '2024-2025', 799.00, '2024-11-01', '2025-04-30', '/photos/ryan_p.jpg', 'active')
    `);

    // Seed lifts
    console.log('Seeding lifts...');
    await client.query(`
      INSERT INTO lifts (name, type, capacity, status, wait_time, vertical_rise, length, speed, last_maintenance) VALUES
      ('Summit Express', 'High-Speed Quad', 4, 'open', 8, 2200, 5800, 5.00, '2025-01-05'),
      ('Eagle Ridge Gondola', 'Gondola', 8, 'open', 12, 3100, 8500, 5.50, '2025-01-03'),
      ('Bear Paw Quad', 'Fixed-Grip Quad', 4, 'open', 5, 1400, 4200, 2.50, '2025-01-08'),
      ('Bunny Hill Magic Carpet', 'Magic Carpet', 1, 'open', 0, 120, 400, 1.00, '2025-01-10'),
      ('Timberline Six', 'High-Speed Six', 6, 'open', 15, 2800, 7200, 5.00, '2025-01-02'),
      ('Powder Basin Chair', 'Triple Chair', 3, 'closed', 0, 1800, 5100, 2.00, '2024-12-20'),
      ('Avalanche Alley Lift', 'Fixed-Grip Quad', 4, 'on_hold', 0, 2000, 5500, 2.50, '2025-01-07'),
      ('Wildflower Triple', 'Triple Chair', 3, 'open', 3, 900, 3200, 2.00, '2025-01-09'),
      ('Storm Peak Platter', 'Surface Lift', 1, 'open', 1, 600, 1800, 1.50, '2025-01-06'),
      ('Elk Meadows Chair', 'Fixed-Grip Quad', 4, 'open', 6, 1600, 4800, 2.50, '2025-01-04'),
      ('Alpine Ascent', 'High-Speed Quad', 4, 'open', 10, 2500, 6500, 5.00, '2025-01-01'),
      ('Glacier Express', 'Gondola', 8, 'maintenance', 0, 3400, 9200, 5.50, '2024-12-15'),
      ('Pine Ridge Double', 'Double Chair', 2, 'open', 2, 700, 2800, 2.00, '2025-01-08'),
      ('Moose Run Chair', 'Fixed-Grip Quad', 4, 'open', 4, 1200, 3900, 2.50, '2025-01-06'),
      ('Village Gondola', 'Gondola', 6, 'open', 7, 1000, 3500, 4.00, '2025-01-10')
    `);

    // Seed trails
    console.log('Seeding trails...');
    await client.query(`
      INSERT INTO trails (name, difficulty, status, grooming_status, length, vertical_drop, snowfall_last24h, conditions, last_groomed) VALUES
      ('Powder Bowl', 'Expert', 'open', 'ungroomed', 2.80, 1800, 6.00, 'Deep powder, excellent', '2025-01-10 05:00:00'),
      ('Eagle''s Descent', 'Advanced', 'open', 'groomed', 3.20, 2100, 4.50, 'Packed powder, very good', '2025-01-12 04:30:00'),
      ('Timber Ridge', 'Intermediate', 'open', 'groomed', 2.10, 1200, 4.50, 'Groomed corduroy, excellent', '2025-01-12 05:00:00'),
      ('Mogul Madness', 'Expert', 'open', 'ungroomed', 1.50, 1600, 6.00, 'Large moguls, firm base', '2025-01-05 05:00:00'),
      ('Bunny Slope', 'Beginner', 'open', 'groomed', 0.40, 120, 4.50, 'Smooth groomed, perfect for beginners', '2025-01-12 06:00:00'),
      ('Columbine Way', 'Intermediate', 'open', 'groomed', 1.80, 1000, 3.00, 'Packed powder, good', '2025-01-12 04:00:00'),
      ('Storm Chute', 'Expert', 'closed', 'not_groomed', 1.20, 2000, 8.00, 'Avalanche risk - closed', '2024-12-28 05:00:00'),
      ('Meadow Run', 'Beginner', 'open', 'groomed', 0.90, 400, 4.50, 'Wide groomed trail, excellent', '2025-01-12 05:30:00'),
      ('Black Diamond Alley', 'Expert', 'open', 'ungroomed', 1.80, 1900, 6.00, 'Steep, variable conditions', '2025-01-08 05:00:00'),
      ('Aspen Glades', 'Advanced', 'open', 'ungroomed', 2.40, 1500, 5.00, 'Gladed tree runs, powder stashes', '2025-01-06 05:00:00'),
      ('Sunset Boulevard', 'Intermediate', 'open', 'groomed', 2.60, 1100, 4.00, 'Scenic cruiser, well groomed', '2025-01-12 04:45:00'),
      ('Elk Park', 'Beginner', 'open', 'groomed', 0.70, 300, 4.50, 'Gentle slope, family friendly', '2025-01-12 05:15:00'),
      ('Cornice Drop', 'Expert', 'open', 'ungroomed', 0.80, 1400, 7.00, 'Steep chutes, expert only', '2025-01-03 05:00:00'),
      ('Wildcat Trail', 'Intermediate', 'open', 'groomed', 2.00, 1300, 3.50, 'Winding trail through trees', '2025-01-12 04:15:00'),
      ('Silver Bullet', 'Advanced', 'open', 'groomed', 2.90, 1700, 5.00, 'Fast steep groomer', '2025-01-12 04:00:00'),
      ('Rocky Mountain High', 'Advanced', 'open', 'ungroomed', 3.50, 2400, 6.50, 'Above treeline, wind-affected', '2025-01-09 05:00:00')
    `);

    // Seed snowmaking_ops
    console.log('Seeding snowmaking_ops...');
    await client.query(`
      INSERT INTO snowmaking_ops (trail_name, gun_type, status, water_usage, energy_usage, temperature, humidity, start_time, end_time) VALUES
      ('Bunny Slope', 'Fan Gun', 'active', 15000.00, 450.00, -8.50, 35.00, '2025-01-12 20:00:00', NULL),
      ('Timber Ridge', 'Tower Gun', 'active', 22000.00, 680.00, -10.00, 30.00, '2025-01-12 19:00:00', NULL),
      ('Columbine Way', 'Fan Gun', 'active', 18000.00, 520.00, -9.00, 32.00, '2025-01-12 21:00:00', NULL),
      ('Meadow Run', 'Ground Gun', 'completed', 12000.00, 380.00, -12.00, 28.00, '2025-01-11 19:00:00', '2025-01-12 05:00:00'),
      ('Elk Park', 'Fan Gun', 'completed', 10000.00, 310.00, -11.00, 25.00, '2025-01-11 20:00:00', '2025-01-12 04:00:00'),
      ('Sunset Boulevard', 'Tower Gun', 'active', 25000.00, 750.00, -8.00, 38.00, '2025-01-12 18:00:00', NULL),
      ('Wildcat Trail', 'Fan Gun', 'scheduled', 0.00, 0.00, -7.00, 40.00, '2025-01-13 19:00:00', NULL),
      ('Silver Bullet', 'Tower Gun', 'completed', 28000.00, 820.00, -14.00, 22.00, '2025-01-10 18:00:00', '2025-01-11 06:00:00'),
      ('Bunny Slope', 'Ground Gun', 'completed', 8000.00, 250.00, -10.50, 30.00, '2025-01-09 20:00:00', '2025-01-10 03:00:00'),
      ('Eagle''s Descent', 'Fan Gun', 'active', 20000.00, 600.00, -9.50, 33.00, '2025-01-12 19:30:00', NULL),
      ('Timber Ridge', 'Fan Gun', 'completed', 19000.00, 560.00, -13.00, 26.00, '2025-01-08 19:00:00', '2025-01-09 05:00:00'),
      ('Meadow Run', 'Ground Gun', 'scheduled', 0.00, 0.00, -8.00, 35.00, '2025-01-13 20:00:00', NULL),
      ('Columbine Way', 'Tower Gun', 'paused', 14000.00, 420.00, -6.00, 45.00, '2025-01-12 22:00:00', NULL),
      ('Elk Park', 'Fan Gun', 'active', 11000.00, 340.00, -9.00, 31.00, '2025-01-12 20:30:00', NULL),
      ('Sunset Boulevard', 'Fan Gun', 'completed', 23000.00, 700.00, -15.00, 20.00, '2025-01-07 18:00:00', '2025-01-08 06:00:00')
    `);

    // Seed patrol_incidents
    console.log('Seeding patrol_incidents...');
    await client.query(`
      INSERT INTO patrol_incidents (incident_type, location, severity, description, patroller_name, guest_name, guest_age, status, reported_at, resolved_at) VALUES
      ('Injury - Knee', 'Eagle''s Descent mid-station', 'moderate', 'Guest fell on icy patch, twisted left knee. Splint applied, transported by toboggan.', 'Mike Daniels', 'Sarah Chen', 34, 'resolved', '2025-01-12 10:30:00', '2025-01-12 11:45:00'),
      ('Collision', 'Timber Ridge intersection', 'minor', 'Two skiers collided at trail merge. Minor bruising, no transport needed.', 'Jessica Hart', 'Tom Bradley', 28, 'resolved', '2025-01-12 11:00:00', '2025-01-12 11:20:00'),
      ('Lost Child', 'Base Lodge area', 'high', 'Parent reported 6-year-old missing near base lodge. Found at rental shop.', 'Carlos Mendez', 'Lily Watson', 6, 'resolved', '2025-01-12 13:15:00', '2025-01-12 13:40:00'),
      ('Injury - Wrist', 'Mogul Madness', 'moderate', 'Snowboarder caught edge in moguls, landed on wrist. Possible fracture, sent to clinic.', 'Mike Daniels', 'Jason Reid', 22, 'resolved', '2025-01-12 09:45:00', '2025-01-12 10:30:00'),
      ('Equipment Failure', 'Summit Express loading', 'low', 'Guest ski binding released unexpectedly at lift. No injury, equipment inspected.', 'Amy Foster', 'Robert Kim', 45, 'resolved', '2025-01-11 14:00:00', '2025-01-11 14:15:00'),
      ('Hypothermia Risk', 'Storm Chute area', 'high', 'Skier found disoriented in whiteout conditions near closed trail. Core temp low.', 'Carlos Mendez', 'Peter Olson', 52, 'resolved', '2025-01-10 15:30:00', '2025-01-10 16:45:00'),
      ('Injury - Shoulder', 'Black Diamond Alley', 'moderate', 'Expert skier hit tree at speed. Dislocated shoulder. Helicopter evacuation requested.', 'Jessica Hart', 'Mark Stevens', 38, 'resolved', '2025-01-11 11:00:00', '2025-01-11 12:30:00'),
      ('Out of Bounds', 'Beyond Powder Bowl boundary', 'high', 'Two skiers found outside resort boundary. Guided back safely by patrol.', 'Mike Daniels', 'Alex Turner', 29, 'resolved', '2025-01-09 14:45:00', '2025-01-09 16:00:00'),
      ('Medical Emergency', 'Summit Lodge dining', 'critical', 'Guest experienced chest pains at lunch. CPR initiated, ambulance called.', 'Amy Foster', 'Richard Hall', 67, 'resolved', '2025-01-08 12:30:00', '2025-01-08 13:15:00'),
      ('Injury - Concussion', 'Cornice Drop', 'high', 'Skier took large air off cornice, landed headfirst. Helmet cracked, dazed.', 'Carlos Mendez', 'Dave Morrison', 25, 'open', '2025-01-12 14:00:00', NULL),
      ('Lift Evacuation', 'Glacier Express mid-tower 7', 'moderate', 'Gondola stopped due to mechanical issue. 24 guests evacuated by rope.', 'Jessica Hart', 'Multiple Guests', 0, 'resolved', '2025-01-07 10:00:00', '2025-01-07 12:30:00'),
      ('Frostbite', 'Alpine Ascent summit', 'moderate', 'Guest with inadequate gloves showing frostbite symptoms on fingers.', 'Amy Foster', 'Nancy Drew', 31, 'resolved', '2025-01-11 15:00:00', '2025-01-11 15:30:00'),
      ('Injury - Leg', 'Silver Bullet lower', 'moderate', 'Intermediate skier fell at high speed on groomer. Lower leg pain, possible fracture.', 'Mike Daniels', 'Kevin Park', 41, 'open', '2025-01-12 13:30:00', NULL),
      ('Reckless Skiing', 'Bunny Slope', 'low', 'Advanced skier reported skiing recklessly through beginner area. Pass pulled for the day.', 'Carlos Mendez', 'Chad Benson', 19, 'resolved', '2025-01-12 10:00:00', '2025-01-12 10:10:00'),
      ('Injury - Back', 'Aspen Glades', 'high', 'Skier hit hidden stump in glades. Back pain, immobilized on backboard.', 'Jessica Hart', 'Linda Torres', 44, 'open', '2025-01-12 14:30:00', NULL)
    `);

    // Seed rental_inventory
    console.log('Seeding rental_inventory...');
    await client.query(`
      INSERT INTO rental_inventory (item_type, brand, model, size, condition, status, daily_rate, last_serviced) VALUES
      ('Skis', 'Rossignol', 'Experience 82', '170cm', 'excellent', 'available', 55.00, '2025-01-10'),
      ('Skis', 'Salomon', 'QST 92', '176cm', 'good', 'rented', 60.00, '2025-01-08'),
      ('Skis', 'Atomic', 'Vantage 86', '163cm', 'excellent', 'available', 55.00, '2025-01-11'),
      ('Snowboard', 'Burton', 'Custom', '156cm', 'good', 'rented', 50.00, '2025-01-09'),
      ('Snowboard', 'Lib Tech', 'Skate Banana', '152cm', 'excellent', 'available', 55.00, '2025-01-10'),
      ('Boots', 'Tecnica', 'Mach Sport 90', '27.5', 'good', 'rented', 35.00, '2025-01-07'),
      ('Boots', 'Nordica', 'Speedmachine 100', '26.0', 'excellent', 'available', 40.00, '2025-01-11'),
      ('Boots', 'Salomon', 'X Pro 80', '28.0', 'fair', 'maintenance', 30.00, '2024-12-20'),
      ('Snowboard Boots', 'Burton', 'Ruler', '10', 'good', 'available', 35.00, '2025-01-09'),
      ('Poles', 'Leki', 'Carbon 14S', '120cm', 'excellent', 'available', 12.00, '2025-01-10'),
      ('Helmet', 'Smith', 'Vantage', 'Large', 'good', 'rented', 15.00, '2025-01-05'),
      ('Helmet', 'Giro', 'Range', 'Medium', 'excellent', 'available', 15.00, '2025-01-11'),
      ('Goggles', 'Oakley', 'Flight Deck', 'One Size', 'excellent', 'available', 18.00, '2025-01-10'),
      ('Skis', 'K2', 'Mindbender 89Ti', '177cm', 'good', 'rented', 65.00, '2025-01-06'),
      ('Snowboard', 'Jones', 'Mountain Twin', '160cm', 'excellent', 'available', 58.00, '2025-01-11'),
      ('Skis', 'Head', 'Kore 93', '180cm', 'excellent', 'available', 60.00, '2025-01-10')
    `);

    // Seed lessons
    console.log('Seeding lessons...');
    await client.query(`
      INSERT INTO lessons (lesson_type, skill_level, instructor_name, guest_name, guest_count, scheduled_date, start_time, duration, price, status, meeting_point) VALUES
      ('Private Ski', 'Beginner', 'Hans Mueller', 'Emily Watson', 1, '2025-01-13', '09:00', 120, 350.00, 'confirmed', 'Base Lodge - Ski School Desk'),
      ('Group Ski', 'Intermediate', 'Sophie Laurent', 'Group Booking', 6, '2025-01-13', '10:00', 180, 120.00, 'confirmed', 'Elk Meadows Chair Base'),
      ('Private Snowboard', 'Beginner', 'Jake Thompson', 'Chris Nguyen', 1, '2025-01-13', '09:30', 120, 350.00, 'confirmed', 'Base Lodge - Snowboard Center'),
      ('Group Ski', 'Advanced', 'Maria Vasquez', 'Group Booking', 4, '2025-01-13', '10:00', 180, 140.00, 'confirmed', 'Summit Express Base'),
      ('Kids Camp', 'Beginner', 'Heidi Braun', 'Watson Family', 3, '2025-01-13', '09:00', 360, 199.00, 'confirmed', 'Kids Adventure Zone'),
      ('Private Ski', 'Expert', 'Jean-Pierre Dubois', 'Mark Stevens', 2, '2025-01-14', '08:30', 180, 450.00, 'pending', 'Alpine Ascent Base'),
      ('Group Snowboard', 'Beginner', 'Jake Thompson', 'Group Booking', 8, '2025-01-14', '10:00', 120, 99.00, 'confirmed', 'Base Lodge - Snowboard Center'),
      ('Telemark', 'Intermediate', 'Hans Mueller', 'Tyler Wright', 1, '2025-01-14', '13:00', 120, 380.00, 'confirmed', 'Elk Meadows Chair Base'),
      ('Private Ski', 'Intermediate', 'Sophie Laurent', 'Amanda Rivera', 2, '2025-01-14', '09:00', 120, 350.00, 'pending', 'Base Lodge - Ski School Desk'),
      ('Adaptive Ski', 'Beginner', 'Maria Vasquez', 'Danny Brooks', 1, '2025-01-15', '10:00', 120, 0.00, 'confirmed', 'Adaptive Center'),
      ('Kids Camp', 'Intermediate', 'Heidi Braun', 'Johnson Family', 2, '2025-01-15', '09:00', 360, 199.00, 'confirmed', 'Kids Adventure Zone'),
      ('Group Ski', 'Beginner', 'Sophie Laurent', 'Group Booking', 10, '2025-01-15', '10:00', 180, 99.00, 'waitlist', 'Base Lodge - Ski School Desk'),
      ('Private Snowboard', 'Advanced', 'Jake Thompson', 'Alex Turner', 1, '2025-01-15', '09:00', 180, 420.00, 'confirmed', 'Terrain Park Entrance'),
      ('Backcountry Tour', 'Expert', 'Jean-Pierre Dubois', 'Tour Group', 4, '2025-01-16', '07:00', 480, 500.00, 'confirmed', 'Patrol Headquarters'),
      ('Private Ski', 'Beginner', 'Hans Mueller', 'Lisa Anderson', 1, '2025-01-16', '09:00', 120, 350.00, 'cancelled', 'Base Lodge - Ski School Desk')
    `);

    // Seed instructors
    console.log('Seeding instructors...');
    await client.query(`
      INSERT INTO instructors (name, specialization, certification_level, languages, availability, hourly_rate, rating, years_experience, phone) VALUES
      ('Hans Mueller', 'Alpine Skiing', 'Level 3 PSIA', 'English, German', 'available', 85.00, 4.90, 18, '970-555-0101'),
      ('Sophie Laurent', 'Alpine Skiing', 'Level 2 PSIA', 'English, French', 'available', 70.00, 4.75, 10, '970-555-0102'),
      ('Jake Thompson', 'Snowboarding', 'Level 3 AASI', 'English', 'available', 80.00, 4.85, 12, '970-555-0103'),
      ('Maria Vasquez', 'Alpine Skiing', 'Level 3 PSIA', 'English, Spanish', 'available', 85.00, 4.95, 20, '970-555-0104'),
      ('Heidi Braun', 'Children Programs', 'Level 2 PSIA', 'English, German', 'available', 65.00, 4.80, 8, '970-555-0105'),
      ('Jean-Pierre Dubois', 'Backcountry / Expert', 'Level 3 PSIA', 'English, French', 'available', 95.00, 4.92, 22, '970-555-0106'),
      ('Kenji Yamamoto', 'Telemark', 'Level 2 PSIA', 'English, Japanese', 'on_leave', 75.00, 4.70, 14, '970-555-0107'),
      ('Emma Collins', 'Freestyle / Park', 'Level 2 AASI', 'English', 'available', 72.00, 4.65, 6, '970-555-0108'),
      ('Carlos Fuentes', 'Alpine Skiing', 'Level 1 PSIA', 'English, Spanish', 'available', 55.00, 4.50, 3, '970-555-0109'),
      ('Anna Petrov', 'Alpine Skiing', 'Level 2 PSIA', 'English, Russian', 'available', 70.00, 4.78, 11, '970-555-0110'),
      ('Ryan O''Malley', 'Snowboarding', 'Level 2 AASI', 'English', 'available', 68.00, 4.60, 7, '970-555-0111'),
      ('Ingrid Svensson', 'Cross-Country', 'Level 3 PSIA-Nordic', 'English, Swedish', 'available', 80.00, 4.88, 15, '970-555-0112'),
      ('Tom Blackwood', 'Adaptive Skiing', 'Level 2 PSIA-Adaptive', 'English', 'available', 75.00, 4.90, 9, '970-555-0113'),
      ('Mei Chen', 'Alpine Skiing', 'Level 1 PSIA', 'English, Mandarin', 'available', 55.00, 4.45, 2, '970-555-0114'),
      ('Diego Ramirez', 'Snowboarding', 'Level 1 AASI', 'English, Spanish', 'unavailable', 52.00, 4.40, 2, '970-555-0115')
    `);

    // Seed snow_reports
    console.log('Seeding snow_reports...');
    await client.query(`
      INSERT INTO snow_reports (report_date, new_snow, base_depth, conditions, temperature_high, temperature_low, wind_speed, wind_direction, visibility, trails_open, lifts_open, published) VALUES
      ('2025-01-12', 6.00, 68.00, 'Powder', 22.00, 5.00, 12.00, 'NW', 'Good', 14, 13, true),
      ('2025-01-11', 3.50, 64.00, 'Packed Powder', 25.00, 8.00, 8.00, 'W', 'Excellent', 14, 14, true),
      ('2025-01-10', 8.00, 62.00, 'Powder', 18.00, 2.00, 20.00, 'NW', 'Fair', 12, 12, true),
      ('2025-01-09', 0.00, 56.00, 'Machine Groomed', 28.00, 12.00, 5.00, 'SW', 'Excellent', 14, 14, true),
      ('2025-01-08', 0.50, 57.00, 'Packed Powder', 30.00, 15.00, 3.00, 'S', 'Excellent', 14, 14, true),
      ('2025-01-07', 12.00, 58.00, 'Powder', 15.00, -2.00, 25.00, 'NW', 'Poor', 10, 10, true),
      ('2025-01-06', 4.00, 50.00, 'Packed Powder', 20.00, 4.00, 15.00, 'N', 'Good', 13, 13, true),
      ('2025-01-05', 2.00, 48.00, 'Machine Groomed', 26.00, 10.00, 7.00, 'W', 'Excellent', 14, 14, true),
      ('2025-01-04', 0.00, 47.00, 'Packed Powder', 32.00, 18.00, 4.00, 'SE', 'Excellent', 14, 14, true),
      ('2025-01-03', 5.50, 48.00, 'Powder', 20.00, 3.00, 18.00, 'NW', 'Fair', 12, 11, true),
      ('2025-01-02', 1.00, 44.00, 'Packed Powder', 24.00, 7.00, 10.00, 'W', 'Good', 13, 13, true),
      ('2025-01-01', 0.00, 44.00, 'Machine Groomed', 30.00, 14.00, 5.00, 'S', 'Excellent', 14, 14, true),
      ('2024-12-31', 7.00, 45.00, 'Powder', 16.00, 0.00, 22.00, 'NW', 'Fair', 11, 11, true),
      ('2024-12-30', 3.00, 40.00, 'Packed Powder', 22.00, 6.00, 12.00, 'N', 'Good', 13, 13, true),
      ('2024-12-29', 0.00, 38.00, 'Machine Groomed', 28.00, 11.00, 6.00, 'W', 'Excellent', 14, 14, true)
    `);

    // Seed parking_lots
    console.log('Seeding parking_lots...');
    await client.query(`
      INSERT INTO parking_lots (lot_name, total_spaces, occupied_spaces, status, lot_type, rate, distance_to_lodge, shuttle_available) VALUES
      ('Main Village Lot', 800, 650, 'open', 'general', 25.00, '200 ft', false),
      ('Premium Village Lot', 150, 148, 'full', 'premium', 50.00, '50 ft', false),
      ('Overflow North', 500, 210, 'open', 'general', 15.00, '0.5 miles', true),
      ('Overflow South', 400, 85, 'open', 'general', 15.00, '0.7 miles', true),
      ('Employee Lot', 200, 175, 'open', 'employee', 0.00, '0.3 miles', true),
      ('VIP Underground', 50, 35, 'open', 'vip', 75.00, '0 ft (direct access)', false),
      ('Timberline Road Lot', 300, 180, 'open', 'general', 20.00, '0.2 miles', true),
      ('Base Camp Lot', 600, 520, 'open', 'general', 25.00, '300 ft', false),
      ('Eagle Ridge Lot', 250, 245, 'full', 'general', 20.00, '0.1 miles', false),
      ('RV Parking Area', 40, 12, 'open', 'rv', 40.00, '0.4 miles', true),
      ('Ski-In/Ski-Out Garage', 80, 78, 'full', 'premium', 65.00, '0 ft (slope access)', false),
      ('Nordic Center Lot', 120, 45, 'open', 'general', 15.00, '100 ft', false),
      ('Adventure Zone Lot', 200, 130, 'open', 'general', 20.00, '150 ft', false),
      ('Shuttle Hub Lot', 350, 280, 'open', 'general', 10.00, '1.0 miles', true),
      ('Handicap Accessible Lot', 60, 22, 'open', 'accessible', 0.00, '100 ft', false)
    `);

    // Seed food_beverage
    console.log('Seeding food_beverage...');
    await client.query(`
      INSERT INTO food_beverage (outlet_name, location, cuisine_type, capacity, current_occupancy, status, opening_time, closing_time, avg_price, menu_highlights) VALUES
      ('Summit Lodge Restaurant', 'Summit - Top of Eagle Ridge Gondola', 'American Grill', 200, 145, 'open', '10:00', '15:30', 22.00, 'Elk burger, loaded nachos, craft beer selection, mountain chili'),
      ('Base Camp Grill', 'Base Village Level 1', 'Fast Casual', 150, 110, 'open', '08:00', '16:00', 15.00, 'Burgers, fries, chicken tenders, pizza slices, hot dogs'),
      ('Timberline Pub', 'Base Village Level 2', 'Pub & Bar', 120, 85, 'open', '11:00', '22:00', 18.00, 'Wings, sliders, fish and chips, 24 craft beers on tap'),
      ('Eagle''s Nest Cafe', 'Mid-mountain at Eagle Ridge', 'Coffee & Bakery', 60, 42, 'open', '07:30', '15:00', 8.00, 'Espresso, hot chocolate, fresh pastries, breakfast burritos'),
      ('The Alpine Table', 'Grand Lodge 2nd Floor', 'Fine Dining', 80, 0, 'closed', '17:00', '22:00', 55.00, 'Colorado lamb, pan-seared trout, wagyu steak, wine pairings'),
      ('Powder Day Pizza', 'Base Village Level 1', 'Pizza', 90, 70, 'open', '10:30', '20:00', 14.00, 'Wood-fired pizza, calzones, garlic knots, Italian sodas'),
      ('The Warming Hut', 'Trail-side near Elk Meadows', 'Snack Bar', 30, 18, 'open', '09:00', '14:30', 10.00, 'Hot cocoa, soup, grilled cheese, cookies, hand warmers'),
      ('Avalanche Bar & Grill', 'Base Village outdoor deck', 'Bar & Grill', 100, 55, 'open', '11:00', '21:00', 20.00, 'BBQ ribs, pulled pork, craft cocktails, live music weekends'),
      ('Bamboo Bowl', 'Base Village Level 1', 'Asian Fusion', 70, 52, 'open', '11:00', '20:00', 16.00, 'Ramen, poke bowls, dumplings, bao buns, sake'),
      ('The Crepe Station', 'Mid-mountain lodge', 'French Crepes', 40, 30, 'open', '08:00', '15:00', 12.00, 'Sweet and savory crepes, French press coffee, fresh juices'),
      ('S''mores Shack', 'Fire pit area near Village Gondola', 'Desserts', 25, 15, 'open', '14:00', '21:00', 8.00, 'S''mores kits, hot chocolate bar, apple cider, cookies'),
      ('Peak Performance Smoothies', 'Base Lodge near rental shop', 'Health Food', 35, 20, 'open', '07:00', '16:00', 11.00, 'Protein smoothies, acai bowls, energy bars, fresh juice'),
      ('Mogul Breakfast House', 'Grand Lodge 1st Floor', 'Breakfast', 100, 0, 'closed', '06:30', '11:00', 18.00, 'Pancake stacks, eggs benedict, omelettes, fresh waffles'),
      ('The Ice Bar', 'Outdoor ice sculpture area', 'Cocktail Bar', 50, 0, 'closed', '16:00', '23:00', 16.00, 'Specialty cocktails served in ice glasses, hot toddies'),
      ('Treeline Tacos', 'Base Village food court', 'Mexican', 60, 48, 'open', '10:00', '19:00', 13.00, 'Street tacos, burritos, quesadillas, margaritas, horchata')
    `);

    // Seed retail_transactions
    console.log('Seeding retail_transactions...');
    await client.query(`
      INSERT INTO retail_transactions (store_name, item_name, category, quantity, unit_price, total_price, payment_method, customer_name, transaction_date) VALUES
      ('Alpine Peak Pro Shop', 'Smith Vantage Helmet', 'Safety Gear', 1, 250.00, 250.00, 'credit_card', 'James Mitchell', '2025-01-12 09:15:00'),
      ('Alpine Peak Pro Shop', 'Oakley Flight Deck Goggles', 'Accessories', 1, 180.00, 180.00, 'credit_card', 'Sarah Chen', '2025-01-12 09:30:00'),
      ('Village General Store', 'Hand Warmers (10-pack)', 'Accessories', 3, 8.99, 26.97, 'cash', 'Tom Bradley', '2025-01-12 08:45:00'),
      ('Alpine Peak Pro Shop', 'Helly Hansen Ski Jacket', 'Apparel', 1, 399.00, 399.00, 'credit_card', 'Emily Watson', '2025-01-12 10:00:00'),
      ('Village General Store', 'Sunscreen SPF 50', 'Health', 2, 12.99, 25.98, 'debit_card', 'Robert Kim', '2025-01-12 10:15:00'),
      ('Resort Gift Shop', 'Alpine Peak Logo Hoodie', 'Souvenirs', 2, 65.00, 130.00, 'credit_card', 'Lisa Anderson', '2025-01-12 11:00:00'),
      ('Alpine Peak Pro Shop', 'Smartwool Merino Socks', 'Apparel', 3, 24.99, 74.97, 'apple_pay', 'David Park', '2025-01-12 11:30:00'),
      ('Resort Gift Shop', 'Souvenir Coffee Mug', 'Souvenirs', 4, 15.00, 60.00, 'cash', 'Jennifer Lopez', '2025-01-12 12:00:00'),
      ('Village General Store', 'Lip Balm SPF 30', 'Health', 2, 5.99, 11.98, 'cash', 'Thomas Brown', '2025-01-12 08:30:00'),
      ('Alpine Peak Pro Shop', 'Giro Range Helmet', 'Safety Gear', 1, 200.00, 200.00, 'credit_card', 'Amanda Rivera', '2025-01-11 14:00:00'),
      ('Alpine Peak Pro Shop', 'Burton Custom Bindings', 'Equipment', 1, 320.00, 320.00, 'credit_card', 'Chris Nguyen', '2025-01-11 15:00:00'),
      ('Resort Gift Shop', 'Alpine Peak Sticker Pack', 'Souvenirs', 5, 5.00, 25.00, 'cash', 'Karen White', '2025-01-11 16:00:00'),
      ('Village General Store', 'Trail Map (Laminated)', 'Accessories', 1, 3.99, 3.99, 'cash', 'Brian Martinez', '2025-01-12 07:45:00'),
      ('Alpine Peak Pro Shop', 'Patagonia Base Layer Top', 'Apparel', 1, 89.00, 89.00, 'debit_card', 'Michelle Lee', '2025-01-12 13:00:00'),
      ('Resort Gift Shop', 'Handcrafted Wood Ornament', 'Souvenirs', 2, 22.00, 44.00, 'credit_card', 'Daniel Harris', '2025-01-12 14:00:00')
    `);

    // Seed childcare
    console.log('Seeding childcare...');
    await client.query(`
      INSERT INTO childcare (child_name, parent_name, parent_phone, age, check_in, check_out, special_needs, meal_plan, status, rate) VALUES
      ('Emma Watson', 'Emily Watson', '303-555-0201', 4, '2025-01-12 08:30:00', '2025-01-12 15:30:00', NULL, 'lunch_snack', 'checked_in', 120.00),
      ('Liam Mitchell', 'James Mitchell', '303-555-0202', 3, '2025-01-12 09:00:00', NULL, 'Peanut allergy', 'full_day', 'checked_in', 130.00),
      ('Sophia Kim', 'Robert Kim', '303-555-0203', 5, '2025-01-12 08:00:00', '2025-01-12 12:00:00', NULL, 'snack_only', 'checked_out', 75.00),
      ('Oliver Chen', 'Sarah Chen', '303-555-0204', 2, '2025-01-12 09:30:00', NULL, 'Needs nap at 1pm', 'full_day', 'checked_in', 140.00),
      ('Ava Rivera', 'Amanda Rivera', '303-555-0205', 6, '2025-01-12 08:15:00', NULL, NULL, 'lunch_snack', 'checked_in', 110.00),
      ('Noah Bradley', 'Tom Bradley', '303-555-0206', 4, '2025-01-12 10:00:00', NULL, NULL, 'snack_only', 'checked_in', 95.00),
      ('Isabella Park', 'David Park', '303-555-0207', 3, '2025-01-12 08:45:00', NULL, 'Dairy intolerance', 'full_day', 'checked_in', 130.00),
      ('Ethan Anderson', 'Lisa Anderson', '303-555-0208', 5, '2025-01-12 09:00:00', '2025-01-12 13:00:00', NULL, 'lunch_snack', 'checked_out', 85.00),
      ('Mia Lopez', 'Jennifer Lopez', '303-555-0209', 4, '2025-01-11 08:30:00', '2025-01-11 15:00:00', NULL, 'full_day', 'completed', 130.00),
      ('Lucas Brown', 'Thomas Brown', '303-555-0210', 6, '2025-01-11 09:00:00', '2025-01-11 14:00:00', NULL, 'lunch_snack', 'completed', 100.00),
      ('Charlotte White', 'Karen White', '303-555-0211', 2, '2025-01-12 09:15:00', NULL, 'Gluten-free meals required', 'full_day', 'checked_in', 145.00),
      ('Jack Martinez', 'Brian Martinez', '303-555-0212', 5, '2025-01-12 08:00:00', NULL, NULL, 'lunch_snack', 'checked_in', 110.00),
      ('Ella Harris', 'Daniel Harris', '303-555-0213', 3, '2025-01-12 10:30:00', NULL, NULL, 'snack_only', 'checked_in', 90.00),
      ('Henry Lee', 'Michelle Lee', '303-555-0214', 7, '2025-01-12 08:00:00', '2025-01-12 11:00:00', NULL, 'snack_only', 'checked_out', 60.00),
      ('Grace Green', 'Rachel Green', '303-555-0215', 4, '2025-01-12 09:00:00', NULL, 'Egg allergy', 'full_day', 'checked_in', 130.00)
    `);

    // Seed lost_found
    console.log('Seeding lost_found...');
    await client.query(`
      INSERT INTO lost_found (item_description, category, location_found, found_date, finder_name, claimed_by, claimed_date, status, storage_location) VALUES
      ('Black Smith Vantage helmet, size L, scratched on right side', 'Headwear', 'Summit Express unloading area', '2025-01-12', 'Lift Op Brian', NULL, NULL, 'unclaimed', 'Lost & Found Bin A1'),
      ('Red Helly Hansen ski jacket, womens medium', 'Clothing', 'Summit Lodge Restaurant', '2025-01-12', 'Server Katie', 'Emily Watson', '2025-01-12', 'claimed', 'N/A'),
      ('Apple iPhone 15 Pro, blue case', 'Electronics', 'Timber Ridge trail-side', '2025-01-11', 'Patrol - Mike Daniels', NULL, NULL, 'unclaimed', 'Lost & Found Safe'),
      ('Pair of Oakley ski goggles, orange lens', 'Accessories', 'Base Camp Grill', '2025-01-11', 'Staff Linda', 'Jason Reid', '2025-01-12', 'claimed', 'N/A'),
      ('Children''s pink Burton snowboard, 120cm', 'Equipment', 'Bunny Slope rack area', '2025-01-10', 'Instructor Heidi', NULL, NULL, 'unclaimed', 'Equipment Storage B'),
      ('Set of car keys, Ford remote with Colorado keychain', 'Keys', 'Main Village Lot shuttle stop', '2025-01-12', 'Shuttle driver Tom', NULL, NULL, 'unclaimed', 'Lost & Found Safe'),
      ('Green Osprey backpack with water bladder', 'Bags', 'Eagle''s Nest Cafe', '2025-01-10', 'Barista Sam', 'Robert Kim', '2025-01-11', 'claimed', 'N/A'),
      ('Pair of Leki ski poles, 120cm', 'Equipment', 'Bear Paw Quad unloading', '2025-01-09', 'Lift Op Steve', NULL, NULL, 'unclaimed', 'Equipment Storage A'),
      ('Blue Buff neck gaiter', 'Clothing', 'Timberline Pub', '2025-01-12', 'Bartender Dave', NULL, NULL, 'unclaimed', 'Lost & Found Bin A2'),
      ('GoPro Hero 12 camera with chest mount', 'Electronics', 'Mogul Madness trail', '2025-01-11', 'Patrol - Carlos', NULL, NULL, 'unclaimed', 'Lost & Found Safe'),
      ('Child''s stuffed bear toy', 'Personal', 'Kids Adventure Zone', '2025-01-12', 'Instructor Heidi', NULL, NULL, 'unclaimed', 'Lost & Found Bin B1'),
      ('Prescription sunglasses, Ray-Ban', 'Accessories', 'Village Gondola cabin 47', '2025-01-08', 'Gondola attendant', 'Karen White', '2025-01-09', 'claimed', 'N/A'),
      ('Single black Nordica ski boot, size 27.5', 'Equipment', 'Parking Lot B shuttle stop', '2025-01-07', 'Shuttle driver Maria', NULL, NULL, 'unclaimed', 'Equipment Storage A'),
      ('Wallet, brown leather, contains ID for Mike Johnson', 'Personal', 'Avalanche Bar deck', '2025-01-12', 'Server Jake', NULL, NULL, 'unclaimed', 'Lost & Found Safe'),
      ('Diamond stud earring', 'Jewelry', 'The Alpine Table restaurant', '2025-01-06', 'Cleaning staff Ana', NULL, NULL, 'unclaimed', 'Lost & Found Safe')
    `);

    // Seed guest_services
    console.log('Seeding guest_services...');
    await client.query(`
      INSERT INTO guest_services (guest_name, request_type, description, priority, status, assigned_to, location, resolved_at) VALUES
      ('James Mitchell', 'Complaint', 'Long wait time at Summit Express - over 25 minutes in line', 'medium', 'in_progress', 'Guest Relations - Sarah', 'Summit Express', NULL),
      ('Emily Watson', 'Information', 'Requesting trail map and beginner trail recommendations', 'low', 'resolved', 'Guest Services Desk', 'Base Lodge', '2025-01-12 09:15:00'),
      ('Robert Kim', 'Equipment Issue', 'Rental ski binding keeps releasing on left ski', 'high', 'in_progress', 'Rental Shop - Dave', 'Rental Center', NULL),
      ('Lisa Anderson', 'Lost Item', 'Lost phone somewhere on Eagle''s Descent trail', 'medium', 'open', 'Ski Patrol', 'Eagle''s Descent', NULL),
      ('Sarah Chen', 'Accommodation', 'Room heater not working in Room 412, very cold', 'high', 'in_progress', 'Maintenance - Joe', 'Alpine Lodge Room 412', NULL),
      ('Tom Bradley', 'Dining Reservation', 'Requesting table for 6 at The Alpine Table for tonight', 'low', 'resolved', 'Concierge - Maria', 'Grand Lodge', '2025-01-12 10:00:00'),
      ('Amanda Rivera', 'Transportation', 'Need shuttle from Overflow South lot, been waiting 20 mins', 'high', 'resolved', 'Shuttle Dispatch', 'Overflow South Lot', '2025-01-12 11:20:00'),
      ('Chris Nguyen', 'Feedback', 'Excellent experience with snowboard instructor Jake Thompson', 'low', 'resolved', 'Guest Relations', 'Base Lodge', '2025-01-12 15:00:00'),
      ('Karen White', 'Medical', 'Child has minor allergic reaction, needs first aid', 'critical', 'resolved', 'Patrol - Amy Foster', 'Kids Adventure Zone', '2025-01-12 11:45:00'),
      ('Brian Martinez', 'Refund', 'Requesting refund on afternoon lift ticket due to lift closure', 'medium', 'open', 'Ticket Office - Ken', 'Ticket Office', NULL),
      ('Michelle Lee', 'Accessibility', 'Requesting wheelchair access information for lodge facilities', 'medium', 'resolved', 'Guest Services - Pat', 'Base Lodge', '2025-01-12 09:30:00'),
      ('Daniel Harris', 'Special Event', 'Inquiring about private area for birthday celebration', 'low', 'in_progress', 'Events Team - Lisa', 'Grand Lodge', NULL),
      ('Rachel Green', 'Childcare', 'Need to extend childcare hours until 4:30 PM', 'medium', 'resolved', 'Snow Cubs - Director', 'Childcare Center', '2025-01-12 13:00:00'),
      ('David Park', 'Parking', 'Premium lot was full despite having premium parking pass', 'high', 'open', 'Parking Manager', 'Premium Village Lot', NULL),
      ('Jennifer Lopez', 'General', 'Asking about group discount for party of 12 tomorrow', 'low', 'in_progress', 'Ticket Office - Ken', 'Ticket Office', NULL)
    `);

    // Seed events
    console.log('Seeding events...');
    await client.query(`
      INSERT INTO events (event_name, event_type, description, location, start_date, end_date, capacity, registered, price, status, organizer) VALUES
      ('Moonlight Night Skiing', 'Recreation', 'Guided night skiing under the full moon with headlamps on groomed trails', 'Sunset Boulevard trail', '2025-01-18 18:00:00', '2025-01-18 21:00:00', 50, 42, 45.00, 'upcoming', 'Alpine Peak Events'),
      ('Powder Day Festival', 'Festival', 'Celebrating 12+ inches of fresh snow with live music, demos, and prizes', 'Base Village', '2025-01-20 10:00:00', '2025-01-20 16:00:00', 500, 0, 0.00, 'upcoming', 'Marketing Team'),
      ('Kids Ski Race', 'Competition', 'Annual kids slalom race for ages 6-14 with medals and prizes', 'Elk Park trail', '2025-01-25 09:00:00', '2025-01-25 14:00:00', 80, 67, 25.00, 'upcoming', 'Ski School'),
      ('Wine & Cheese Apres-Ski', 'Social', 'Colorado wine tasting paired with artisan cheeses on the deck', 'Avalanche Bar & Grill deck', '2025-01-17 16:00:00', '2025-01-17 19:00:00', 60, 58, 55.00, 'upcoming', 'F&B Department'),
      ('Avalanche Safety Workshop', 'Education', 'Learn avalanche awareness, rescue techniques, and beacon usage', 'Patrol Headquarters', '2025-01-19 08:00:00', '2025-01-19 12:00:00', 30, 28, 75.00, 'upcoming', 'Ski Patrol'),
      ('Live Music: The Mountain Echoes', 'Entertainment', 'Local bluegrass band performing on the outdoor stage', 'Base Village Stage', '2025-01-12 15:00:00', '2025-01-12 18:00:00', 200, 145, 0.00, 'active', 'Entertainment Team'),
      ('Torchlight Parade', 'Spectacle', 'Ski instructors descend with torches for a spectacular night display', 'Eagle''s Descent trail', '2025-02-01 19:00:00', '2025-02-01 20:00:00', 1000, 0, 0.00, 'upcoming', 'Alpine Peak Events'),
      ('Freestyle Jam Session', 'Competition', 'Open terrain park competition with prizes for best trick', 'Terrain Park', '2025-01-26 11:00:00', '2025-01-26 15:00:00', 40, 35, 30.00, 'upcoming', 'Park Crew'),
      ('Sunrise Yoga on Snow', 'Wellness', 'Morning yoga session on the mountain at sunrise', 'Summit Deck', '2025-01-15 06:30:00', '2025-01-15 07:30:00', 25, 25, 20.00, 'sold_out', 'Wellness Team'),
      ('Brews & Boards Demo Day', 'Demo', 'Try the latest snowboards while sampling local craft beers', 'Base Lodge', '2025-01-22 10:00:00', '2025-01-22 15:00:00', 100, 78, 35.00, 'upcoming', 'Burton / Local Brewery'),
      ('Ice Sculpture Competition', 'Art', 'Watch professional ice sculptors create mountain-themed works', 'Village Plaza', '2025-02-08 09:00:00', '2025-02-08 16:00:00', 300, 0, 0.00, 'upcoming', 'Arts Council'),
      ('Cardboard Box Derby', 'Fun Race', 'Build a sled from cardboard and race down Bunny Slope', 'Bunny Slope', '2025-02-15 13:00:00', '2025-02-15 16:00:00', 60, 22, 15.00, 'upcoming', 'Marketing Team'),
      ('Ski Patrol Fundraiser Dinner', 'Fundraiser', 'Gala dinner to support volunteer ski patrol operations', 'The Alpine Table', '2025-02-14 18:00:00', '2025-02-14 22:00:00', 80, 64, 150.00, 'upcoming', 'Patrol Association'),
      ('First Tracks Friday', 'Recreation', 'Early access to freshly groomed runs before public opening', 'All groomed trails', '2025-01-17 07:00:00', '2025-01-17 08:30:00', 100, 95, 35.00, 'upcoming', 'Mountain Ops'),
      ('Photography Workshop: Mountain Light', 'Education', 'Learn to capture stunning winter mountain photography', 'Various locations', '2025-01-24 09:00:00', '2025-01-24 15:00:00', 15, 14, 85.00, 'upcoming', 'Pro Photographer Guild')
    `);

    // Seed accommodations
    console.log('Seeding accommodations...');
    await client.query(`
      INSERT INTO accommodations (property_name, room_type, capacity, price_per_night, amenities, status, guest_name, check_in, check_out, booking_status) VALUES
      ('Alpine Lodge', 'King Suite', 2, 389.00, 'Fireplace, hot tub, mountain view, kitchenette', 'occupied', 'James Mitchell', '2025-01-11', '2025-01-15', 'checked_in'),
      ('Alpine Lodge', 'Double Queen', 4, 299.00, 'Balcony, mini fridge, coffee maker', 'occupied', 'Emily Watson', '2025-01-10', '2025-01-14', 'checked_in'),
      ('Alpine Lodge', 'Standard King', 2, 229.00, 'Mountain view, coffee maker, wifi', 'available', NULL, NULL, NULL, 'available'),
      ('Timberline Condos', '2BR Condo', 6, 499.00, 'Full kitchen, washer/dryer, fireplace, ski storage', 'occupied', 'Anderson Family', '2025-01-12', '2025-01-19', 'checked_in'),
      ('Timberline Condos', '1BR Condo', 4, 349.00, 'Kitchenette, fireplace, balcony', 'occupied', 'Robert Kim', '2025-01-11', '2025-01-13', 'checked_in'),
      ('Timberline Condos', '3BR Penthouse', 8, 899.00, 'Full kitchen, hot tub, panoramic views, 2 fireplaces', 'occupied', 'White Family', '2025-01-10', '2025-01-17', 'checked_in'),
      ('Grand Lodge', 'Luxury Suite', 2, 549.00, 'Spa bath, premium bedding, room service, ski valet', 'occupied', 'Sarah Chen', '2025-01-12', '2025-01-16', 'checked_in'),
      ('Grand Lodge', 'Family Room', 5, 379.00, 'Bunk beds, game console, adjoining rooms available', 'available', NULL, NULL, NULL, 'available'),
      ('Grand Lodge', 'Standard Double', 2, 199.00, 'Wifi, mini fridge, complimentary breakfast', 'maintenance', NULL, NULL, NULL, 'blocked'),
      ('Creekside Cabins', 'Deluxe Cabin', 6, 599.00, 'Full kitchen, hot tub, fire pit, creek views, pet friendly', 'occupied', 'Martinez Family', '2025-01-09', '2025-01-16', 'checked_in'),
      ('Creekside Cabins', 'Standard Cabin', 4, 399.00, 'Kitchenette, fireplace, deck, pet friendly', 'available', NULL, NULL, NULL, 'available'),
      ('Ski-In/Ski-Out Residences', 'Premium 2BR', 4, 749.00, 'Slope access, heated boot room, concierge, hot tub', 'occupied', 'Tom Bradley', '2025-01-12', '2025-01-18', 'checked_in'),
      ('Ski-In/Ski-Out Residences', 'Luxury 3BR', 6, 1199.00, 'Slope access, private chef available, theater room', 'occupied', 'Harrison Family', '2025-01-08', '2025-01-15', 'checked_in'),
      ('Alpine Lodge', 'ADA King Room', 2, 229.00, 'Wheelchair accessible, roll-in shower, mountain view', 'available', NULL, NULL, NULL, 'available'),
      ('Base Camp Hostel', '4-Bed Dorm', 4, 69.00, 'Shared bathroom, lockers, common kitchen, ski storage', 'occupied', 'Chris Nguyen', '2025-01-12', '2025-01-14', 'checked_in')
    `);

    // Seed shuttles
    console.log('Seeding shuttles...');
    await client.query(`
      INSERT INTO shuttles (route_name, vehicle_id, driver_name, capacity, current_passengers, departure_time, arrival_time, status, frequency_minutes, stops) VALUES
      ('Village Loop', 'SH-001', 'Miguel Santos', 24, 18, '08:00', '08:25', 'in_transit', 15, 'Main Lot, Base Lodge, Village Center, Grand Lodge, Main Lot'),
      ('Overflow North Express', 'SH-002', 'Patricia Hayes', 30, 25, '07:45', '08:00', 'in_transit', 10, 'Overflow North Lot, Base Lodge'),
      ('Overflow South Express', 'SH-003', 'Tom Kellerman', 30, 12, '08:15', '08:35', 'loading', 12, 'Overflow South Lot, Base Lodge'),
      ('Town Connector', 'SH-004', 'Diana Marsh', 40, 35, '07:30', '08:00', 'in_transit', 20, 'Downtown Hotel District, Grocery Plaza, Resort Main Entrance'),
      ('Employee Shuttle', 'SH-005', 'Rick Alvarez', 20, 18, '06:00', '06:20', 'completed', 30, 'Employee Housing, Employee Lot, Base Lodge Staff Entrance'),
      ('Nordic Center Link', 'SH-006', 'Sarah Flynn', 15, 8, '08:30', '08:45', 'in_transit', 30, 'Base Lodge, Nordic Center, Creekside Cabins'),
      ('Evening Town Return', 'SH-007', 'Miguel Santos', 40, 0, '16:00', '16:30', 'scheduled', 30, 'Resort Main Entrance, Grocery Plaza, Downtown Hotel District'),
      ('Airport Express', 'SH-008', 'Jim Oakley', 20, 14, '09:00', '10:30', 'in_transit', 120, 'Resort Main Entrance, Eagle County Airport'),
      ('Shuttle Hub Connector', 'SH-009', 'Lisa Chang', 30, 22, '07:30', '07:45', 'in_transit', 15, 'Shuttle Hub Lot, Timberline Road Lot, Base Lodge'),
      ('Timberline Condos Route', 'SH-010', 'Frank Russo', 15, 10, '08:00', '08:15', 'in_transit', 20, 'Timberline Condos, Village Center, Base Lodge'),
      ('Evening Dining Shuttle', 'SH-011', 'Patricia Hayes', 24, 0, '17:30', '18:00', 'scheduled', 45, 'Resort Lodges, Downtown Restaurants, Resort Lodges'),
      ('Ski-In/Ski-Out Express', 'SH-012', 'Tom Kellerman', 12, 6, '08:45', '09:00', 'in_transit', 30, 'Ski-In/Ski-Out Residences, Base Lodge, Village Center'),
      ('Late Night Return', 'SH-013', 'Rick Alvarez', 30, 0, '22:00', '22:30', 'scheduled', 60, 'Village Center, All Parking Lots'),
      ('Adventure Zone Shuttle', 'SH-014', 'Diana Marsh', 20, 15, '09:00', '09:10', 'in_transit', 20, 'Base Lodge, Adventure Zone, Tubing Hill'),
      ('RV Lot Connector', 'SH-015', 'Sarah Flynn', 15, 4, '08:15', '08:30', 'in_transit', 30, 'RV Parking Area, Base Lodge')
    `);

    // Seed equipment_maintenance
    console.log('Seeding equipment_maintenance...');
    await client.query(`
      INSERT INTO equipment_maintenance (equipment_name, equipment_type, maintenance_type, description, technician, status, priority, scheduled_date, completed_date, cost) VALUES
      ('Summit Express Haul Rope', 'Lift Component', 'Inspection', 'Annual haul rope magnetic testing and visual inspection', 'Dave Kowalski', 'completed', 'critical', '2025-01-05', '2025-01-05', 4500.00),
      ('Glacier Express Drive Terminal', 'Lift Component', 'Repair', 'Drive motor bearing replacement after unusual vibration detected', 'Dave Kowalski', 'in_progress', 'critical', '2025-01-12', NULL, 12000.00),
      ('PistenBully 600 Groomer #3', 'Grooming Vehicle', 'Scheduled Service', '500-hour service: oil change, filter replacement, track tension', 'Tony Machado', 'completed', 'high', '2025-01-08', '2025-01-08', 2800.00),
      ('Snow Gun Array - Bunny Slope', 'Snowmaking', 'Repair', 'Replace frozen nozzle assembly on gun #4', 'Brett Hansen', 'completed', 'medium', '2025-01-10', '2025-01-10', 650.00),
      ('Timberline Six Deropement System', 'Lift Safety', 'Testing', 'Monthly deropement system function test', 'Dave Kowalski', 'scheduled', 'critical', '2025-01-15', NULL, 800.00),
      ('PistenBully 400 Groomer #1', 'Grooming Vehicle', 'Repair', 'Hydraulic line leak on tiller assembly', 'Tony Machado', 'in_progress', 'high', '2025-01-12', NULL, 1500.00),
      ('Water Pump Station #2', 'Snowmaking Infrastructure', 'Scheduled Service', 'Pump impeller inspection and seal replacement', 'Brett Hansen', 'scheduled', 'medium', '2025-01-16', NULL, 3200.00),
      ('Eagle Ridge Gondola Cabin #23', 'Lift Cabin', 'Repair', 'Door latch mechanism not engaging properly', 'Dave Kowalski', 'completed', 'high', '2025-01-09', '2025-01-09', 450.00),
      ('Snowcat Winch System', 'Grooming Vehicle', 'Inspection', 'Winch cable inspection and load testing for steep terrain grooming', 'Tony Machado', 'scheduled', 'high', '2025-01-14', NULL, 1200.00),
      ('Compressor Station Alpha', 'Snowmaking Infrastructure', 'Scheduled Service', 'Air compressor maintenance, filter change, belt inspection', 'Brett Hansen', 'completed', 'medium', '2025-01-06', '2025-01-06', 900.00),
      ('Bear Paw Quad Chair #47', 'Lift Chair', 'Repair', 'Restraining bar spring replacement', 'Dave Kowalski', 'completed', 'medium', '2025-01-07', '2025-01-07', 200.00),
      ('Avalanche Beacon Transceivers (Set of 20)', 'Safety Equipment', 'Testing', 'Quarterly function test of all patrol avalanche transceivers', 'Carlos Mendez', 'completed', 'critical', '2025-01-03', '2025-01-03', 0.00),
      ('Magic Carpet Motor', 'Lift Component', 'Scheduled Service', 'Belt tension adjustment and motor bearing lubrication', 'Tony Machado', 'completed', 'low', '2025-01-10', '2025-01-10', 150.00),
      ('Terrain Park Rail Set', 'Park Feature', 'Inspection', 'Weld inspection on all metal features after cold snap', 'Brett Hansen', 'in_progress', 'medium', '2025-01-12', NULL, 0.00),
      ('Emergency Toboggan Fleet', 'Safety Equipment', 'Inspection', 'Pre-season inspection of all 15 rescue toboggans', 'Carlos Mendez', 'completed', 'high', '2024-11-15', '2024-11-16', 350.00)
    `);

    // Seed rfid_access
    console.log('Seeding rfid_access...');
    await client.query(`
      INSERT INTO rfid_access (card_id, holder_name, access_point, access_type, timestamp, pass_type, valid) VALUES
      ('RFID-00142', 'John Harrison', 'Summit Express Gate', 'lift_entry', '2025-01-12 09:05:00', 'Season Unlimited', true),
      ('RFID-00142', 'John Harrison', 'Eagle Ridge Gondola Gate', 'lift_entry', '2025-01-12 10:22:00', 'Season Unlimited', true),
      ('RFID-00287', 'Maria Gonzalez', 'Timberline Six Gate', 'lift_entry', '2025-01-12 09:15:00', 'Season Unlimited', true),
      ('RFID-00501', 'James Mitchell', 'Summit Express Gate', 'lift_entry', '2025-01-12 08:50:00', 'Day Pass', true),
      ('RFID-00501', 'James Mitchell', 'Bear Paw Quad Gate', 'lift_entry', '2025-01-12 11:30:00', 'Day Pass', true),
      ('RFID-00398', 'Ashley Johnson', 'Alpine Ascent Gate', 'lift_entry', '2025-01-12 09:30:00', 'Season Unlimited', false),
      ('RFID-00612', 'Sarah Chen', 'Village Gondola Gate', 'lift_entry', '2025-01-12 09:00:00', 'Day Pass', true),
      ('RFID-00155', 'Kevin O''Brien', 'Wildflower Triple Gate', 'lift_entry', '2025-01-12 10:45:00', 'Senior Season', true),
      ('RFID-00743', 'Robert Kim', 'Elk Meadows Chair Gate', 'lift_entry', '2025-01-12 09:20:00', 'Day Pass', true),
      ('RFID-00287', 'Maria Gonzalez', 'Summit Express Gate', 'lift_entry', '2025-01-12 11:00:00', 'Season Unlimited', true),
      ('RFID-00320', 'Christopher Young', 'Eagle Ridge Gondola Gate', 'lift_entry', '2025-01-12 08:45:00', 'Season Plus', true),
      ('RFID-00320', 'Christopher Young', 'Alpine Ascent Gate', 'lift_entry', '2025-01-12 10:15:00', 'Season Plus', true),
      ('RFID-00445', 'Megan Clark', 'Bear Paw Quad Gate', 'lift_entry', '2025-01-12 09:40:00', '10-Day Flex', true),
      ('RFID-00889', 'Lisa Anderson', 'Bunny Hill Magic Carpet Gate', 'lift_entry', '2025-01-12 10:00:00', 'Day Pass', true),
      ('RFID-00556', 'Tyler Wright', 'Timberline Six Gate', 'lift_entry', '2025-01-12 08:55:00', 'Season Unlimited', true)
    `);

    // Seed weather_stations
    console.log('Seeding weather_stations...');
    await client.query(`
      INSERT INTO weather_stations (station_name, location, elevation, temperature, humidity, wind_speed, wind_direction, barometric_pressure, snow_depth, visibility, last_updated, status) VALUES
      ('Summit Peak Station', 'Summit - 12,450 ft', 12450, 5.00, 45.00, 22.00, 'NW', 1013.25, 78.00, 8.00, '2025-01-12 14:00:00', 'active'),
      ('Mid-Mountain Station', 'Eagle Ridge Mid-Station - 10,800 ft', 10800, 12.00, 50.00, 15.00, 'W', 1015.50, 65.00, 10.00, '2025-01-12 14:00:00', 'active'),
      ('Base Village Station', 'Base Lodge - 8,950 ft', 8950, 22.00, 38.00, 5.00, 'SW', 1018.75, 42.00, 15.00, '2025-01-12 14:00:00', 'active'),
      ('North Bowl Station', 'Powder Bowl Ridge - 11,900 ft', 11900, 3.00, 55.00, 28.00, 'NW', 1012.00, 85.00, 5.00, '2025-01-12 14:00:00', 'active'),
      ('Timberline Station', 'Treeline at 11,400 ft', 11400, 8.00, 48.00, 12.00, 'N', 1014.80, 70.00, 10.00, '2025-01-12 14:00:00', 'active'),
      ('Avalanche Gulch Station', 'Avalanche Control Zone - 12,100 ft', 12100, 2.00, 60.00, 30.00, 'NW', 1011.50, 92.00, 4.00, '2025-01-12 14:00:00', 'active'),
      ('Elk Meadows Station', 'Elk Meadows Area - 9,500 ft', 9500, 18.00, 42.00, 8.00, 'W', 1017.20, 48.00, 12.00, '2025-01-12 14:00:00', 'active'),
      ('Nordic Center Station', 'Cross-Country Area - 9,200 ft', 9200, 20.00, 40.00, 6.00, 'SW', 1017.80, 38.00, 15.00, '2025-01-12 14:00:00', 'active'),
      ('Storm Peak Station', 'Storm Peak Exposed Ridge - 12,200 ft', 12200, 0.00, 65.00, 35.00, 'NW', 1010.80, 88.00, 3.00, '2025-01-12 14:00:00', 'active'),
      ('Terrain Park Station', 'Terrain Park Area - 9,800 ft', 9800, 16.00, 44.00, 10.00, 'W', 1016.50, 52.00, 12.00, '2025-01-12 14:00:00', 'active'),
      ('Snowmaking Control Station', 'Snowmaking Ops Center - 9,600 ft', 9600, 18.00, 41.00, 7.00, 'SW', 1017.00, 45.00, 14.00, '2025-01-12 14:00:00', 'active'),
      ('Parking Remote Station', 'Main Parking Area - 8,850 ft', 8850, 24.00, 35.00, 3.00, 'S', 1019.00, 30.00, 15.00, '2025-01-12 14:00:00', 'active'),
      ('Glacier Station', 'Near Glacier Express Top - 12,300 ft', 12300, 1.00, 62.00, 32.00, 'N', 1011.20, 90.00, 4.00, '2025-01-12 13:00:00', 'maintenance'),
      ('Backcountry Gate Station', 'Backcountry Access Point - 11,700 ft', 11700, 6.00, 52.00, 18.00, 'NW', 1013.80, 75.00, 7.00, '2025-01-12 14:00:00', 'active'),
      ('Valley Floor Station', 'Resort Entrance - 8,700 ft', 8700, 26.00, 32.00, 2.00, 'S', 1019.50, 22.00, 15.00, '2025-01-12 14:00:00', 'active')
    `);

    // Seed avalanche_control
    console.log('Seeding avalanche_control...');
    await client.query(`
      INSERT INTO avalanche_control (zone_name, risk_level, control_method, team_lead, team_size, start_time, end_time, result, weather_conditions, status) VALUES
      ('North Bowl Alpha', 'considerable', 'Explosive - Hand Charge', 'Carlos Mendez', 4, '2025-01-12 06:00:00', '2025-01-12 07:30:00', 'Slab released, size D2. Trail cleared for opening at 9am.', 'Clear, -5F, NW wind 20mph', 'completed'),
      ('Storm Chute Upper', 'high', 'Explosive - Avalauncher', 'Mike Daniels', 3, '2025-01-12 06:15:00', '2025-01-12 08:00:00', 'Multiple slides triggered. Zone remains CLOSED.', 'Overcast, -2F, NW wind 30mph', 'completed'),
      ('Cornice Ridge East', 'considerable', 'Ski Cutting', 'Jessica Hart', 3, '2025-01-12 07:00:00', '2025-01-12 08:00:00', 'Small sluffs only, zone cleared for public.', 'Clear, 5F, W wind 12mph', 'completed'),
      ('Powder Bowl West Face', 'moderate', 'Explosive - Hand Charge', 'Carlos Mendez', 4, '2025-01-12 06:30:00', '2025-01-12 07:15:00', 'No result. Snowpack stable.', 'Clear, 0F, NW wind 15mph', 'completed'),
      ('Glacier Cirque', 'high', 'Explosive - Gazex', 'Mike Daniels', 2, '2025-01-12 06:00:00', '2025-01-12 07:00:00', 'Large slab D2.5 released. Secondary charges successful.', 'Overcast, -8F, N wind 25mph', 'completed'),
      ('Avalanche Alley', 'considerable', 'Explosive - Avalauncher', 'Jessica Hart', 3, '2025-01-12 06:45:00', '2025-01-12 08:15:00', 'Moderate slab released D1.5. Zone on hold for assessment.', 'Partly cloudy, -3F, NW wind 18mph', 'completed'),
      ('Black Diamond Ridge', 'moderate', 'Ski Cutting', 'Carlos Mendez', 2, '2025-01-12 07:30:00', '2025-01-12 08:00:00', 'No activity. Snowpack stable, cleared for public.', 'Clear, 8F, W wind 10mph', 'completed'),
      ('Storm Chute Lower', 'high', 'Monitoring', 'Mike Daniels', 1, '2025-01-12 08:00:00', NULL, 'Continuous monitoring. Remains CLOSED.', 'Overcast, 2F, NW wind 28mph', 'active'),
      ('North Bowl Beta', 'moderate', 'Explosive - Hand Charge', 'Jessica Hart', 3, '2025-01-11 06:00:00', '2025-01-11 07:00:00', 'Small release D1. Cleared after settling.', 'Clear, -4F, NW wind 15mph', 'completed'),
      ('Eagle Ridge Chute', 'low', 'Ski Cutting', 'Carlos Mendez', 2, '2025-01-11 07:00:00', '2025-01-11 07:30:00', 'No activity. Stable conditions.', 'Clear, 10F, W wind 8mph', 'completed'),
      ('Timber Bowl', 'moderate', 'Explosive - Hand Charge', 'Mike Daniels', 4, '2025-01-10 06:00:00', '2025-01-10 07:45:00', 'Two small releases in starting zone. Cleared.', 'Snowing, 5F, NW wind 20mph', 'completed'),
      ('Summit Cornice', 'considerable', 'Explosive - Gazex', 'Carlos Mendez', 2, '2025-01-10 05:45:00', '2025-01-10 06:30:00', 'Large cornice collapse triggered slab below. Effective.', 'Snowing, -6F, NW wind 25mph', 'completed'),
      ('Backcountry Gate Zone', 'considerable', 'Assessment Only', 'Jessica Hart', 2, '2025-01-12 07:00:00', '2025-01-12 08:30:00', 'Gate open with caution advisory posted. Persistent slab concern.', 'Clear, 3F, NW wind 15mph', 'completed'),
      ('Powder Bowl East Face', 'moderate', 'Ski Cutting', 'Mike Daniels', 3, '2025-01-12 07:15:00', '2025-01-12 07:45:00', 'Minor sluffing. Cleared for advanced skiers.', 'Clear, 2F, W wind 12mph', 'completed'),
      ('Rocky Mountain Chutes', 'high', 'Explosive - Avalauncher', 'Carlos Mendez', 4, '2025-01-12 06:00:00', '2025-01-12 08:00:00', 'Significant release D2. Second round needed. Zone closed.', 'Partly cloudy, -5F, N wind 30mph', 'completed')
    `);

    // Seed staffing
    console.log('Seeding staffing...');
    await client.query(`
      INSERT INTO staffing (employee_name, department, position, shift_date, shift_start, shift_end, status, hourly_rate, hours_worked, notes) VALUES
      ('Mike Daniels', 'Ski Patrol', 'Senior Patroller', '2025-01-12', '06:00', '15:00', 'on_duty', 32.00, 9.00, 'Lead morning avalanche control'),
      ('Jessica Hart', 'Ski Patrol', 'Patroller', '2025-01-12', '06:00', '15:00', 'on_duty', 28.00, 9.00, 'Assigned to North Bowl sector'),
      ('Carlos Mendez', 'Ski Patrol', 'Senior Patroller', '2025-01-12', '06:00', '15:00', 'on_duty', 32.00, 9.00, 'Avalanche team lead'),
      ('Amy Foster', 'Ski Patrol', 'Patroller', '2025-01-12', '07:00', '16:00', 'on_duty', 28.00, 9.00, 'Base area and medical response'),
      ('Dave Kowalski', 'Maintenance', 'Lead Mechanic', '2025-01-12', '05:00', '14:00', 'on_duty', 38.00, 9.00, 'Glacier Express repair priority'),
      ('Tony Machado', 'Grooming', 'Senior Groomer Operator', '2025-01-12', '02:00', '10:00', 'completed', 30.00, 8.00, 'Groomed Timber Ridge, Sunset Blvd, Columbine'),
      ('Hans Mueller', 'Ski School', 'Head Instructor', '2025-01-12', '08:30', '16:30', 'on_duty', 42.00, 8.00, 'Private lessons morning, staff meeting 4pm'),
      ('Sophie Laurent', 'Ski School', 'Instructor', '2025-01-12', '09:00', '16:00', 'on_duty', 35.00, 7.00, 'Group intermediate class'),
      ('Katie Morrison', 'Food & Beverage', 'Summit Lodge Manager', '2025-01-12', '09:00', '17:00', 'on_duty', 25.00, 8.00, 'Managing lunch rush'),
      ('Brian Cooper', 'Lifts', 'Lift Operations Supervisor', '2025-01-12', '07:00', '16:00', 'on_duty', 26.00, 9.00, 'Overseeing all lift operations'),
      ('Steve Bartlett', 'Lifts', 'Lift Operator', '2025-01-12', '07:30', '16:30', 'on_duty', 18.00, 9.00, 'Assigned to Summit Express'),
      ('Maria Santos', 'Guest Services', 'Guest Relations Manager', '2025-01-12', '08:00', '17:00', 'on_duty', 24.00, 9.00, 'Handling escalated complaints'),
      ('Ken Watanabe', 'Ticket Office', 'Ticket Agent', '2025-01-12', '07:00', '15:00', 'on_duty', 18.00, 8.00, 'Window 1, processing refunds'),
      ('Pat Sullivan', 'Guest Services', 'Concierge', '2025-01-12', '08:00', '16:00', 'on_duty', 20.00, 8.00, 'Front desk, accommodation inquiries'),
      ('Brett Hansen', 'Snowmaking', 'Snowmaking Lead', '2025-01-12', '18:00', '04:00', 'scheduled', 30.00, 0.00, 'Night shift - target Bunny Slope and Timber Ridge'),
      ('Linda Torres', 'Childcare', 'Childcare Director', '2025-01-12', '07:30', '16:30', 'on_duty', 22.00, 9.00, 'Full house today - 12 children')
    `);

    // Seed terrain_park_features
    console.log('Seeding terrain_park_features...');
    await client.query(`
      INSERT INTO terrain_park_features (feature_name, feature_type, size, difficulty, status, location, last_inspected, inspector, condition) VALUES
      ('Booter 40', 'Jump', 'Large (40ft)', 'Expert', 'open', 'Main Park - Top Section', '2025-01-12 07:00:00', 'Park Crew - Zack', 'Excellent - freshly shaped'),
      ('Booter 20', 'Jump', 'Medium (20ft)', 'Intermediate', 'open', 'Main Park - Mid Section', '2025-01-12 07:00:00', 'Park Crew - Zack', 'Good'),
      ('Booter 10', 'Jump', 'Small (10ft)', 'Beginner', 'open', 'Progression Park', '2025-01-12 07:15:00', 'Park Crew - Emma', 'Excellent'),
      ('Flat Down Rail 30ft', 'Rail', 'Large', 'Advanced', 'open', 'Main Park - Rail Garden', '2025-01-12 07:00:00', 'Park Crew - Zack', 'Good - minor surface rust'),
      ('Down-Flat-Down Rail 20ft', 'Rail', 'Medium', 'Intermediate', 'open', 'Main Park - Rail Garden', '2025-01-12 07:00:00', 'Park Crew - Zack', 'Excellent'),
      ('Flat Box 15ft', 'Box', 'Small', 'Beginner', 'open', 'Progression Park', '2025-01-12 07:15:00', 'Park Crew - Emma', 'Excellent'),
      ('Rainbow Rail', 'Rail', 'Medium', 'Advanced', 'open', 'Main Park - Rail Garden', '2025-01-12 07:00:00', 'Park Crew - Zack', 'Good'),
      ('Flat-Down Box 20ft', 'Box', 'Medium', 'Intermediate', 'open', 'Main Park - Mid Section', '2025-01-12 07:00:00', 'Park Crew - Zack', 'Excellent'),
      ('Cannon Rail', 'Rail', 'Large', 'Expert', 'closed', 'Main Park - Top Section', '2025-01-12 07:00:00', 'Park Crew - Zack', 'Needs weld repair'),
      ('Halfpipe 18ft', 'Halfpipe', 'Large (18ft walls)', 'Expert', 'open', 'Halfpipe Zone', '2025-01-12 06:30:00', 'Park Crew - Zack', 'Good - cut this morning'),
      ('Mini Halfpipe', 'Halfpipe', 'Small (8ft walls)', 'Intermediate', 'open', 'Progression Park', '2025-01-12 07:15:00', 'Park Crew - Emma', 'Good'),
      ('Whale Tail', 'Jib Feature', 'Medium', 'Advanced', 'open', 'Main Park - Jib Line', '2025-01-12 07:00:00', 'Park Crew - Zack', 'Excellent'),
      ('Wall Ride', 'Wall Feature', 'Large', 'Advanced', 'open', 'Main Park - Jib Line', '2025-01-12 07:00:00', 'Park Crew - Zack', 'Good'),
      ('Butter Box 10ft', 'Box', 'Small', 'Beginner', 'open', 'Progression Park', '2025-01-12 07:15:00', 'Park Crew - Emma', 'Excellent'),
      ('Step-Up Jump', 'Jump', 'Large', 'Expert', 'open', 'Main Park - Top Section', '2025-01-12 07:00:00', 'Park Crew - Zack', 'Good - lip needs rebuild tonight')
    `);

    console.log('\n==========================================');
    console.log('Database seeded successfully!');
    console.log('==========================================');
    console.log('Admin credential was supplied through the environment.');
    console.log('Tables created: 26');
    console.log('==========================================\n');

  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();

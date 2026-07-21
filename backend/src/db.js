const { Pool } = require('pg');
const { databaseUrl } = require('./config/security');

const pool = new Pool({
  connectionString: databaseUrl,
});

const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };

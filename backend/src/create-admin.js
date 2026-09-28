const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const email = String(process.env.SEED_ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.SEED_ADMIN_PASSWORD || '';
if (!email.includes('@') || password.length < 12) {
  throw new Error('Configured demo administrator credentials are invalid');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE
       SET name = EXCLUDED.name, password = EXCLUDED.password, role = 'admin'`,
    ['Demo Administrator', email, passwordHash]
  );
}

main()
  .then(() => pool.end())
  .catch(async (error) => {
    console.error(error.message);
    await pool.end().catch(() => {});
    process.exitCode = 1;
  });

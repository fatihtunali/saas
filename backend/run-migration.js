const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function runMigration() {
  try {
    console.log('Starting migration: Add destination_city_id to quotations...\n');

    const sql = fs.readFileSync('./migrations/001_add_destination_to_quotations.sql', 'utf8');

    console.log('Executing migration...');
    await pool.query(sql);

    console.log('✅ Migration completed successfully!');
    console.log('Added destination_city_id column to quotations table\n');

    // Verify the column was added
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'quotations'
      AND column_name = 'destination_city_id'
    `);

    if (result.rows.length > 0) {
      console.log('✓ Column verification:');
      console.log(result.rows[0]);
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

runMigration();

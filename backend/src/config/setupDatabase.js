const pool = require('./database');

async function setupDatabase() {
  try {
    console.log('Starting database setup...');

    // Create operators table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS operators (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        contact_email VARCHAR(255) UNIQUE NOT NULL,
        contact_phone VARCHAR(50),
        address TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Operators table created');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'operator')),
        operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_operator_id ON users(operator_id);
      CREATE INDEX IF NOT EXISTS idx_operators_email ON operators(contact_email);
    `);
    console.log('✓ Database indexes created');

    console.log('✓ Database setup completed successfully!');
  } catch (error) {
    console.error('✗ Database setup error:', error);
    throw error;
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('Database setup finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupDatabase;

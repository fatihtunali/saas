const bcrypt = require('bcrypt');
const pool = require('./database');
require('dotenv').config();

async function createSuperAdmin() {
  try {
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error('Super admin email and password must be set in .env file');
    }

    // Check if super admin already exists
    const existingAdmin = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('✓ Super admin already exists');
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert super admin user
    await pool.query(
      `INSERT INTO users (email, password_hash, role, operator_id, is_active)
       VALUES ($1, $2, $3, NULL, true)`,
      [email, passwordHash, 'super_admin']
    );

    console.log('✓ Super admin created successfully');
    console.log('  Email:', email);

  } catch (error) {
    console.error('✗ Error creating super admin:', error);
    throw error;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createSuperAdmin()
    .then(() => {
      console.log('Super admin creation finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Super admin creation failed:', error);
      process.exit(1);
    });
}

module.exports = createSuperAdmin;

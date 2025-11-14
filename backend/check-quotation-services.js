const db = require('./src/config/database');

async function checkServices() {
  try {
    // Get quotation services
    const services = await db.query(
      'SELECT * FROM quotation_services WHERE quotation_id = 111 AND deleted_at IS NULL'
    );

    console.log('Quotation 111 has', services.rows.length, 'services');
    if (services.rows.length > 0) {
      console.log('\nFirst service columns:');
      console.log(Object.keys(services.rows[0]));
      console.log('\nServices data:');
      services.rows.forEach((s, i) => {
        console.log(`\nService ${i + 1}:`, s);
      });
    }

    // Check bookings schema to see if it has destination_city_id
    const bookings = await db.query('SELECT * FROM bookings LIMIT 1');
    console.log('\n\nBookings table columns:');
    console.log(Object.keys(bookings.rows[0] || {}));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkServices();

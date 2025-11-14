const db = require('./src/config/database');

async function fixBookingDestination() {
  try {
    // Get quotation 111's destination
    const quotation = await db.query(
      'SELECT id, destination_city_id FROM quotations WHERE id = 111'
    );

    if (quotation.rows.length === 0) {
      console.log('Quotation 111 not found');
      process.exit(1);
    }

    const q = quotation.rows[0];
    console.log('Quotation 111 destination_city_id:', q.destination_city_id);

    // Update booking 6 with the destination
    await db.query(
      'UPDATE bookings SET destination_city_id = $1 WHERE id = 6',
      [q.destination_city_id]
    );

    console.log('Updated booking 6 with destination_city_id:', q.destination_city_id);

    // Verify
    const booking = await db.query(
      'SELECT id, booking_code, destination_city_id FROM bookings WHERE id = 6'
    );
    console.log('Booking 6:', booking.rows[0]);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixBookingDestination();

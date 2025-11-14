const db = require('./src/config/database');

async function fixBooking() {
  try {
    // Get quotation 111 data
    const quotation = await db.query('SELECT * FROM quotations WHERE id = 111');
    const q = quotation.rows[0];

    console.log('Quotation 111 total_amount:', q.total_amount);

    // Update booking 6 with correct data
    await db.query(`
      UPDATE bookings
      SET total_cost = $1,
          total_selling_price = $2,
          special_requests = $3,
          internal_notes = $4
      WHERE id = 6
    `, [q.total_amount, q.total_amount, q.notes, q.internal_notes]);

    console.log('Updated booking 6 with quotation data');

    // Verify
    const booking = await db.query('SELECT id, booking_code, total_cost, total_selling_price FROM bookings WHERE id = 6');
    console.log('Booking 6:', booking.rows[0]);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixBooking();

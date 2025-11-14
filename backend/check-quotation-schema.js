const db = require('./src/config/database');

async function checkSchema() {
  try {
    // Get quotation 111 data to see all columns
    const quotation = await db.query('SELECT * FROM quotations WHERE id = 111');

    if (quotation.rows.length === 0) {
      console.log('Quotation 111 not found');
      process.exit(1);
    }

    console.log('Quotation 111 columns:');
    console.log(Object.keys(quotation.rows[0]));
    console.log('\nQuotation 111 data:');
    console.log(quotation.rows[0]);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSchema();

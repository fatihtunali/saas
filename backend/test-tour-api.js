const db = require('./src/config/database');
require('dotenv').config();

(async () => {
  try {
    const query = `
      SELECT tc.*, s.company_name as supplier_name
      FROM tour_companies tc
      LEFT JOIN suppliers s ON tc.supplier_id = s.id
      WHERE tc.deleted_at IS NULL
      AND tc.operator_id = 1
      LIMIT 3
    `;

    const result = await db.query(query);

    console.log('Database returned:', result.rows.length, 'rows');
    if (result.rows.length > 0) {
      console.log('First row sample:', {
        id: result.rows[0].id,
        company_name: result.rows[0].company_name,
        tour_name: result.rows[0].tour_name,
        is_active: result.rows[0].is_active,
      });

      // Test transformation
      const transformedData = result.rows.map(row => ({
        id: row.id,
        companyName: row.company_name,
        tourName: row.tour_name,
        tourType: row.tour_type,
        isActive: row.is_active,
      }));

      console.log('\nTransformed for frontend:');
      console.log(JSON.stringify(transformedData, null, 2));
    }

    await db.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

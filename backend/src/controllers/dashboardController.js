const db = require('../config/database');

/**
 * Dashboard Controller
 *
 * Provides aggregated data for dashboard metrics, charts, and activity feeds.
 * All queries are filtered by operator_id for multi-tenant security.
 */

/**
 * Get dashboard statistics
 * Returns: bookings count, revenue, receivables, payables with trends
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' ? null : req.user.operator_id;

    // Get current month bookings count
    const bookingsQuery = operatorId
      ? `SELECT COUNT(*) as count,
                COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
                                    AND created_at < DATE_TRUNC('month', CURRENT_DATE)
                               THEN 1 ELSE 0 END), 0) as last_month_count
         FROM bookings
         WHERE operator_id = $1
         AND deleted_at IS NULL
         AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`
      : `SELECT COUNT(*) as count,
                COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
                                    AND created_at < DATE_TRUNC('month', CURRENT_DATE)
                               THEN 1 ELSE 0 END), 0) as last_month_count
         FROM bookings
         WHERE deleted_at IS NULL
         AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`;

    const bookingsResult = operatorId
      ? await db.query(bookingsQuery, [operatorId])
      : await db.query(bookingsQuery);

    // Get current month revenue
    const revenueQuery = operatorId
      ? `SELECT COALESCE(SUM(total_selling_price), 0) as total,
                COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
                                    AND created_at < DATE_TRUNC('month', CURRENT_DATE)
                               THEN total_selling_price ELSE 0 END), 0) as last_month_total
         FROM bookings
         WHERE operator_id = $1
         AND deleted_at IS NULL
         AND status IN ('confirmed', 'completed')
         AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`
      : `SELECT COALESCE(SUM(total_selling_price), 0) as total,
                COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
                                    AND created_at < DATE_TRUNC('month', CURRENT_DATE)
                               THEN total_selling_price ELSE 0 END), 0) as last_month_total
         FROM bookings
         WHERE deleted_at IS NULL
         AND status IN ('confirmed', 'completed')
         AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`;

    const revenueResult = operatorId
      ? await db.query(revenueQuery, [operatorId])
      : await db.query(revenueQuery);

    // Get receivables (outstanding client payments)
    const receivablesQuery = operatorId
      ? `SELECT COALESCE(SUM(amount), 0) as total
         FROM client_payments
         WHERE operator_id = $1
         AND deleted_at IS NULL
         AND status = 'pending'`
      : `SELECT COALESCE(SUM(amount), 0) as total
         FROM client_payments
         WHERE deleted_at IS NULL
         AND status = 'pending'`;

    const receivablesResult = operatorId
      ? await db.query(receivablesQuery, [operatorId])
      : await db.query(receivablesQuery);

    // Get payables (outstanding supplier payments)
    const payablesQuery = operatorId
      ? `SELECT COALESCE(SUM(amount), 0) as total
         FROM supplier_payments
         WHERE operator_id = $1
         AND deleted_at IS NULL
         AND status = 'pending'`
      : `SELECT COALESCE(SUM(amount), 0) as total
         FROM supplier_payments
         WHERE deleted_at IS NULL
         AND status = 'pending'`;

    const payablesResult = operatorId
      ? await db.query(payablesQuery, [operatorId])
      : await db.query(payablesQuery);

    // Calculate trends
    const bookingsCount = parseInt(bookingsResult.rows[0].count) || 0;
    const lastMonthBookings = parseInt(bookingsResult.rows[0].last_month_count) || 0;
    const bookingsTrend = lastMonthBookings > 0
      ? ((bookingsCount - lastMonthBookings) / lastMonthBookings * 100).toFixed(1)
      : bookingsCount > 0 ? 100 : 0;

    const revenueTotal = parseFloat(revenueResult.rows[0].total) || 0;
    const lastMonthRevenue = parseFloat(revenueResult.rows[0].last_month_total) || 0;
    const revenueTrend = lastMonthRevenue > 0
      ? ((revenueTotal - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : revenueTotal > 0 ? 100 : 0;

    res.json({
      bookings: {
        current: bookingsCount,
        trend: parseFloat(bookingsTrend),
        label: 'This Month',
      },
      revenue: {
        current: revenueTotal,
        trend: parseFloat(revenueTrend),
        label: 'This Month',
        currency: 'USD',
      },
      receivables: {
        current: parseFloat(receivablesResult.rows[0].total) || 0,
        trend: 0,
        label: 'Outstanding',
        currency: 'USD',
      },
      payables: {
        current: parseFloat(payablesResult.rows[0].total) || 0,
        trend: 0,
        label: 'Outstanding',
        currency: 'USD',
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

/**
 * Get revenue chart data
 * Returns: Revenue data points for the specified period
 */
exports.getRevenueChart = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' ? null : req.user.operator_id;
    const { period = 'monthly' } = req.query;

    let dateFormat, dateInterval, limit;
    switch (period) {
      case 'daily':
        dateFormat = 'YYYY-MM-DD';
        dateInterval = '1 day';
        limit = 30;
        break;
      case 'weekly':
        dateFormat = 'IYYY-IW';
        dateInterval = '1 week';
        limit = 12;
        break;
      case 'yearly':
        dateFormat = 'YYYY';
        dateInterval = '1 year';
        limit = 5;
        break;
      case 'monthly':
      default:
        dateFormat = 'YYYY-MM';
        dateInterval = '1 month';
        limit = 12;
    }

    const revenueQuery = operatorId
      ? `SELECT
           TO_CHAR(created_at, $1) as period,
           COALESCE(SUM(total_selling_price), 0) as revenue,
           COUNT(*) as bookings_count
         FROM bookings
         WHERE operator_id = $2
         AND deleted_at IS NULL
         AND status IN ('confirmed', 'completed')
         AND created_at >= CURRENT_DATE - INTERVAL '${limit} ${dateInterval}'
         GROUP BY TO_CHAR(created_at, $1)
         ORDER BY period ASC`
      : `SELECT
           TO_CHAR(created_at, $1) as period,
           COALESCE(SUM(total_selling_price), 0) as revenue,
           COUNT(*) as bookings_count
         FROM bookings
         WHERE deleted_at IS NULL
         AND status IN ('confirmed', 'completed')
         AND created_at >= CURRENT_DATE - INTERVAL '${limit} ${dateInterval}'
         GROUP BY TO_CHAR(created_at, $1)
         ORDER BY period ASC`;

    const result = operatorId
      ? await db.query(revenueQuery, [dateFormat, operatorId])
      : await db.query(revenueQuery, [dateFormat]);

    const data = result.rows.map(row => ({
      period: row.period,
      revenue: parseFloat(row.revenue),
      bookingsCount: parseInt(row.bookings_count),
    }));

    const total = data.reduce((sum, item) => sum + item.revenue, 0);

    res.json({
      data,
      total,
      period,
      currency: 'USD',
    });
  } catch (error) {
    console.error('Error fetching revenue chart:', error);
    res.status(500).json({ error: 'Failed to fetch revenue chart data' });
  }
};

/**
 * Get bookings chart data
 * Returns: Bookings breakdown by status
 */
exports.getBookingsChart = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' ? null : req.user.operator_id;

    const bookingsQuery = operatorId
      ? `SELECT
           status,
           COUNT(*) as count,
           COALESCE(SUM(total_selling_price), 0) as total_value
         FROM bookings
         WHERE operator_id = $1
         AND deleted_at IS NULL
         GROUP BY status
         ORDER BY count DESC`
      : `SELECT
           status,
           COUNT(*) as count,
           COALESCE(SUM(total_selling_price), 0) as total_value
         FROM bookings
         WHERE deleted_at IS NULL
         GROUP BY status
         ORDER BY count DESC`;

    const result = operatorId
      ? await db.query(bookingsQuery, [operatorId])
      : await db.query(bookingsQuery);

    const statusBreakdown = result.rows.map(row => ({
      status: row.status,
      count: parseInt(row.count),
      value: parseFloat(row.total_value),
    }));

    const totalBookings = statusBreakdown.reduce((sum, item) => sum + item.count, 0);
    const totalValue = statusBreakdown.reduce((sum, item) => sum + item.value, 0);

    res.json({
      statusBreakdown,
      totalBookings,
      totalValue,
      currency: 'USD',
    });
  } catch (error) {
    console.error('Error fetching bookings chart:', error);
    res.status(500).json({ error: 'Failed to fetch bookings chart data' });
  }
};

/**
 * Get recent activity feed
 * Returns: Recent bookings, payments, or modifications
 */
exports.getRecentActivity = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' ? null : req.user.operator_id;
    const { type = 'bookings', limit = 10 } = req.query;

    let activityData = [];

    if (type === 'bookings') {
      const bookingsQuery = operatorId
        ? `SELECT
             b.id,
             b.booking_code,
             b.status,
             b.total_selling_price,
             b.created_at,
             COALESCE(oc.company_name, c.full_name) as customer_name
           FROM bookings b
           LEFT JOIN operators_clients oc ON b.operators_client_id = oc.id
           LEFT JOIN clients c ON b.client_id = c.id
           WHERE b.operator_id = $1
           AND b.deleted_at IS NULL
           ORDER BY b.created_at DESC
           LIMIT $2`
        : `SELECT
             b.id,
             b.booking_code,
             b.status,
             b.total_selling_price,
             b.created_at,
             COALESCE(oc.company_name, c.full_name) as customer_name
           FROM bookings b
           LEFT JOIN operators_clients oc ON b.operators_client_id = oc.id
           LEFT JOIN clients c ON b.client_id = c.id
           WHERE b.deleted_at IS NULL
           ORDER BY b.created_at DESC
           LIMIT $1`;

      const result = operatorId
        ? await db.query(bookingsQuery, [operatorId, limit])
        : await db.query(bookingsQuery, [limit]);

      activityData = result.rows.map(row => ({
        id: row.id,
        type: 'bookings',
        bookingCode: row.booking_code,
        tourName: null,
        customerName: row.customer_name,
        status: row.status,
        amount: parseFloat(row.total_selling_price),
        timestamp: row.created_at,
      }));
    } else if (type === 'payments') {
      const paymentsQuery = operatorId
        ? `SELECT
             cp.id,
             cp.payment_code,
             cp.amount,
             cp.payment_method,
             cp.status,
             cp.payment_date,
             b.booking_code,
             COALESCE(oc.company_name, c.full_name) as customer_name
           FROM client_payments cp
           LEFT JOIN bookings b ON cp.booking_id = b.id
           LEFT JOIN operators_clients oc ON b.operators_client_id = oc.id
           LEFT JOIN clients c ON b.client_id = c.id
           WHERE cp.operator_id = $1
           AND cp.deleted_at IS NULL
           ORDER BY cp.payment_date DESC
           LIMIT $2`
        : `SELECT
             cp.id,
             cp.payment_code,
             cp.amount,
             cp.payment_method,
             cp.status,
             cp.payment_date,
             b.booking_code,
             COALESCE(oc.company_name, c.full_name) as customer_name
           FROM client_payments cp
           LEFT JOIN bookings b ON cp.booking_id = b.id
           LEFT JOIN operators_clients oc ON b.operators_client_id = oc.id
           LEFT JOIN clients c ON b.client_id = c.id
           WHERE cp.deleted_at IS NULL
           ORDER BY cp.payment_date DESC
           LIMIT $1`;

      const result = operatorId
        ? await db.query(paymentsQuery, [operatorId, limit])
        : await db.query(paymentsQuery, [limit]);

      activityData = result.rows.map(row => ({
        id: row.id,
        type: 'payments',
        paymentCode: row.payment_code,
        bookingCode: row.booking_code,
        customerName: row.customer_name,
        paymentMethod: row.payment_method,
        status: row.status,
        amount: parseFloat(row.amount),
        timestamp: row.payment_date,
      }));
    }

    res.json({
      items: activityData,
      type,
      total: activityData.length,
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};

/**
 * Get upcoming tours
 * Returns: Tours with upcoming start dates
 */
exports.getUpcomingTours = async (req, res) => {
  try {
    const operatorId = req.user.role === 'super_admin' ? null : req.user.operator_id;
    const { limit = 5 } = req.query;

    const toursQuery = operatorId
      ? `SELECT
           b.id,
           b.booking_code,
           b.travel_start_date,
           b.travel_end_date,
           b.status,
           b.total_selling_price,
           COUNT(bp.id) as passenger_count,
           COALESCE(oc.company_name, c.full_name) as customer_name
         FROM bookings b
         LEFT JOIN booking_passengers bp ON b.id = bp.booking_id AND bp.deleted_at IS NULL
         LEFT JOIN operators_clients oc ON b.operators_client_id = oc.id
         LEFT JOIN clients c ON b.client_id = c.id
         WHERE b.operator_id = $1
         AND b.deleted_at IS NULL
         AND b.travel_start_date >= CURRENT_DATE
         AND b.status IN ('confirmed', 'quotation')
         GROUP BY b.id, b.booking_code, b.travel_start_date, b.travel_end_date,
                  b.status, b.total_selling_price, oc.company_name, c.full_name
         ORDER BY b.travel_start_date ASC
         LIMIT $2`
      : `SELECT
           b.id,
           b.booking_code,
           b.travel_start_date,
           b.travel_end_date,
           b.status,
           b.total_selling_price,
           COUNT(bp.id) as passenger_count,
           COALESCE(oc.company_name, c.full_name) as customer_name
         FROM bookings b
         LEFT JOIN booking_passengers bp ON b.id = bp.booking_id AND bp.deleted_at IS NULL
         LEFT JOIN operators_clients oc ON b.operators_client_id = oc.id
         LEFT JOIN clients c ON b.client_id = c.id
         WHERE b.deleted_at IS NULL
         AND b.travel_start_date >= CURRENT_DATE
         AND b.status IN ('confirmed', 'quotation')
         GROUP BY b.id, b.booking_code, b.travel_start_date, b.travel_end_date,
                  b.status, b.total_selling_price, oc.company_name, c.full_name
         ORDER BY b.travel_start_date ASC
         LIMIT $1`;

    const result = operatorId
      ? await db.query(toursQuery, [operatorId, limit])
      : await db.query(toursQuery, [limit]);

    const tours = result.rows.map(row => ({
      id: row.id,
      bookingCode: row.booking_code,
      tourName: null,
      customerName: row.customer_name,
      startDate: row.travel_start_date,
      endDate: row.travel_end_date,
      status: row.status,
      passengerCount: parseInt(row.passenger_count),
      totalPrice: parseFloat(row.total_selling_price),
    }));

    res.json({
      tours,
      total: tours.length,
    });
  } catch (error) {
    console.error('Error fetching upcoming tours:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming tours' });
  }
};

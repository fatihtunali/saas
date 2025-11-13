const pool = require('../config/database');

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get operator ID from request
 */
const getOperatorId = (req) => {
  return req.user.operator_id;
};

/**
 * Calculate aging bucket for a date
 */
const calculateAgingBucket = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = now - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 30) return 'current';
  if (diffDays <= 60) return '31-60';
  if (diffDays <= 90) return '61-90';
  return '90+';
};

/**
 * Format date for SQL queries
 */
const formatDateForSQL = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Get comparison period dates
 */
const getComparisonPeriod = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end - start;

  const comparisonEnd = new Date(start);
  comparisonEnd.setDate(comparisonEnd.getDate() - 1);

  const comparisonStart = new Date(comparisonEnd);
  comparisonStart.setDate(comparisonStart.getDate() - Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return {
    start: formatDateForSQL(comparisonStart),
    end: formatDateForSQL(comparisonEnd)
  };
};

// ============================================
// FINANCIAL REPORTS
// ============================================

/**
 * 1. Revenue Report
 * GET /api/reports/revenue
 */
exports.getRevenueReport = async (req, res) => {
  try {
    const operatorId = getOperatorId(req);
    const { start_date, end_date, currency, client_type, service_type, payment_status } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    // Build WHERE conditions
    let whereConditions = ['b.operator_id = ?'];
    let params = [operatorId];

    if (start_date && end_date) {
      whereConditions.push('b.created_at BETWEEN ? AND ?');
      params.push(start_date, end_date);
    }

    if (client_type && client_type !== 'all') {
      whereConditions.push('b.client_type = ?');
      params.push(client_type);
    }

    if (payment_status && payment_status !== 'all') {
      whereConditions.push('b.payment_status = ?');
      params.push(payment_status);
    }

    const whereClause = whereConditions.join(' AND ');

    // Main revenue query
    const [revenueData] = await pool.query(`
      SELECT
        DATE(b.created_at) as date,
        b.booking_code,
        CASE
          WHEN b.client_type = 'b2c' THEN c.full_name
          WHEN b.client_type = 'b2b' THEN oc.full_name
        END as client_name,
        b.total_amount,
        b.currency_code,
        b.total_in_base_currency,
        b.payment_status,
        b.client_type
      FROM bookings b
      LEFT JOIN clients c ON b.client_id = c.id AND b.client_type = 'b2c'
      LEFT JOIN operators_clients oc ON b.client_id = oc.id AND b.client_type = 'b2b'
      WHERE ${whereClause}
      ORDER BY b.created_at DESC
    `, params);

    // Service type breakdown query
    const [serviceBreakdown] = await pool.query(`
      SELECT
        bs.service_type,
        COUNT(DISTINCT bs.booking_id) as booking_count,
        SUM(bs.selling_price_in_base_currency) as total_revenue
      FROM booking_services bs
      INNER JOIN bookings b ON bs.booking_id = b.id
      WHERE ${whereClause}
      ${service_type && service_type !== 'all' ? 'AND bs.service_type = ?' : ''}
      GROUP BY bs.service_type
      ORDER BY total_revenue DESC
    `, service_type && service_type !== 'all' ? [...params, service_type] : params);

    // Summary metrics
    const totalRevenue = revenueData.reduce((sum, row) => sum + parseFloat(row.total_in_base_currency || 0), 0);
    const totalBookings = revenueData.length;
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Get comparison period data for growth calculation
    const comparisonPeriod = getComparisonPeriod(start_date, end_date);
    const [comparisonData] = await pool.query(`
      SELECT SUM(b.total_in_base_currency) as total
      FROM bookings b
      WHERE b.operator_id = ? AND b.created_at BETWEEN ? AND ?
    `, [operatorId, comparisonPeriod.start, comparisonPeriod.end]);

    const previousRevenue = parseFloat(comparisonData[0]?.total || 0);
    const growthPercentage = previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    // Group revenue by date for chart
    const revenueByDate = {};
    revenueData.forEach(row => {
      const date = row.date;
      if (!revenueByDate[date]) {
        revenueByDate[date] = 0;
      }
      revenueByDate[date] += parseFloat(row.total_in_base_currency || 0);
    });

    const chartData = Object.keys(revenueByDate).map(date => ({
      date,
      revenue: revenueByDate[date]
    }));

    // Client type breakdown
    const clientTypeBreakdown = revenueData.reduce((acc, row) => {
      const type = row.client_type || 'unknown';
      if (!acc[type]) {
        acc[type] = { count: 0, revenue: 0 };
      }
      acc[type].count++;
      acc[type].revenue += parseFloat(row.total_in_base_currency || 0);
      return acc;
    }, {});

    res.json({
      summary: {
        total_revenue: totalRevenue,
        total_bookings: totalBookings,
        average_booking_value: averageBookingValue,
        growth_percentage: growthPercentage
      },
      data: revenueData,
      service_breakdown: serviceBreakdown,
      client_type_breakdown: Object.keys(clientTypeBreakdown).map(type => ({
        client_type: type,
        count: clientTypeBreakdown[type].count,
        revenue: clientTypeBreakdown[type].revenue
      })),
      chart_data: chartData
    });

  } catch (error) {
    console.error('Revenue Report Error:', error);
    res.status(500).json({ error: 'Failed to generate revenue report', details: error.message });
  }
};

/**
 * 2. Profit & Loss Statement
 * GET /api/reports/profit-loss
 */
exports.getProfitLossReport = async (req, res) => {
  try {
    const operatorId = getOperatorId(req);
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    // Total Revenue
    const [revenueData] = await pool.query(`
      SELECT
        SUM(b.total_in_base_currency) as total_revenue,
        COUNT(*) as booking_count
      FROM bookings b
      WHERE b.operator_id = ? AND b.created_at BETWEEN ? AND ?
    `, [operatorId, start_date, end_date]);

    // Revenue by Service Type
    const [revenueByService] = await pool.query(`
      SELECT
        bs.service_type,
        SUM(bs.selling_price_in_base_currency) as revenue
      FROM booking_services bs
      INNER JOIN bookings b ON bs.booking_id = b.id
      WHERE b.operator_id = ? AND b.created_at BETWEEN ? AND ?
      GROUP BY bs.service_type
      ORDER BY revenue DESC
    `, [operatorId, start_date, end_date]);

    // Total Costs
    const [costData] = await pool.query(`
      SELECT
        SUM(bs.cost_in_base_currency) as total_cost
      FROM booking_services bs
      INNER JOIN bookings b ON bs.booking_id = b.id
      WHERE b.operator_id = ? AND b.created_at BETWEEN ? AND ?
    `, [operatorId, start_date, end_date]);

    // Costs by Service Type
    const [costsByService] = await pool.query(`
      SELECT
        bs.service_type,
        SUM(bs.cost_in_base_currency) as cost
      FROM booking_services bs
      INNER JOIN bookings b ON bs.booking_id = b.id
      WHERE b.operator_id = ? AND b.created_at BETWEEN ? AND ?
      GROUP BY bs.service_type
      ORDER BY cost DESC
    `, [operatorId, start_date, end_date]);

    // Monthly breakdown
    const [monthlyData] = await pool.query(`
      SELECT
        DATE_FORMAT(b.created_at, '%Y-%m') as month,
        SUM(b.total_in_base_currency) as revenue,
        SUM(bs_costs.total_cost) as cost
      FROM bookings b
      LEFT JOIN (
        SELECT booking_id, SUM(cost_in_base_currency) as total_cost
        FROM booking_services
        GROUP BY booking_id
      ) bs_costs ON b.id = bs_costs.booking_id
      WHERE b.operator_id = ? AND b.created_at BETWEEN ? AND ?
      GROUP BY DATE_FORMAT(b.created_at, '%Y-%m')
      ORDER BY month
    `, [operatorId, start_date, end_date]);

    const totalRevenue = parseFloat(revenueData[0]?.total_revenue || 0);
    const totalCost = parseFloat(costData[0]?.total_cost || 0);
    const grossProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Combine revenue and cost by service type
    const serviceTypeData = {};
    revenueByService.forEach(item => {
      if (!serviceTypeData[item.service_type]) {
        serviceTypeData[item.service_type] = { revenue: 0, cost: 0 };
      }
      serviceTypeData[item.service_type].revenue = parseFloat(item.revenue || 0);
    });
    costsByService.forEach(item => {
      if (!serviceTypeData[item.service_type]) {
        serviceTypeData[item.service_type] = { revenue: 0, cost: 0 };
      }
      serviceTypeData[item.service_type].cost = parseFloat(item.cost || 0);
    });

    const serviceBreakdown = Object.keys(serviceTypeData).map(type => ({
      service_type: type,
      revenue: serviceTypeData[type].revenue,
      cost: serviceTypeData[type].cost,
      profit: serviceTypeData[type].revenue - serviceTypeData[type].cost,
      margin: serviceTypeData[type].revenue > 0
        ? ((serviceTypeData[type].revenue - serviceTypeData[type].cost) / serviceTypeData[type].revenue) * 100
        : 0
    }));

    res.json({
      summary: {
        total_revenue: totalRevenue,
        total_cost: totalCost,
        gross_profit: grossProfit,
        profit_margin: profitMargin
      },
      service_breakdown: serviceBreakdown,
      monthly_data: monthlyData.map(row => ({
        month: row.month,
        revenue: parseFloat(row.revenue || 0),
        cost: parseFloat(row.cost || 0),
        profit: parseFloat(row.revenue || 0) - parseFloat(row.cost || 0)
      }))
    });

  } catch (error) {
    console.error('Profit & Loss Report Error:', error);
    res.status(500).json({ error: 'Failed to generate P&L report', details: error.message });
  }
};

/**
 * 3. Receivables Aging Report
 * GET /api/reports/receivables-aging
 */
exports.getReceivablesAgingReport = async (req, res) => {
  try {
    const operatorId = getOperatorId(req);
    const { as_of_date } = req.query;

    const asOfDate = as_of_date || new Date().toISOString().split('T')[0];

    const [receivablesData] = await pool.query(`
      SELECT
        b.booking_code,
        CASE
          WHEN b.client_type = 'b2c' THEN c.full_name
          WHEN b.client_type = 'b2b' THEN oc.full_name
        END as client_name,
        b.client_type,
        b.created_at as invoice_date,
        b.start_date as due_date,
        b.total_in_base_currency as total_amount,
        COALESCE(SUM(cp.amount_in_base_currency), 0) as paid_amount,
        (b.total_in_base_currency - COALESCE(SUM(cp.amount_in_base_currency), 0)) as amount_due,
        DATEDIFF(?, b.start_date) as days_outstanding
      FROM bookings b
      LEFT JOIN clients c ON b.client_id = c.id AND b.client_type = 'b2c'
      LEFT JOIN operators_clients oc ON b.client_id = oc.id AND b.client_type = 'b2b'
      LEFT JOIN client_payments cp ON b.id = cp.booking_id AND cp.status = 'completed'
      WHERE b.operator_id = ?
        AND b.payment_status != 'fully_paid'
        AND b.status != 'cancelled'
      GROUP BY b.id
      HAVING amount_due > 0
      ORDER BY days_outstanding DESC
    `, [asOfDate, operatorId]);

    // Calculate aging buckets
    const agingBuckets = {
      current: { count: 0, amount: 0 },
      '31-60': { count: 0, amount: 0 },
      '61-90': { count: 0, amount: 0 },
      '90+': { count: 0, amount: 0 }
    };

    const detailedData = receivablesData.map(row => {
      const daysOutstanding = parseInt(row.days_outstanding);
      let bucket = 'current';

      if (daysOutstanding > 90) bucket = '90+';
      else if (daysOutstanding > 60) bucket = '61-90';
      else if (daysOutstanding > 30) bucket = '31-60';

      const amountDue = parseFloat(row.amount_due);
      agingBuckets[bucket].count++;
      agingBuckets[bucket].amount += amountDue;

      return {
        ...row,
        amount_due: amountDue,
        aging_bucket: bucket
      };
    });

    const totalOutstanding = Object.values(agingBuckets).reduce((sum, bucket) => sum + bucket.amount, 0);

    res.json({
      summary: {
        total_outstanding: totalOutstanding,
        current: agingBuckets.current.amount,
        days_31_60: agingBuckets['31-60'].amount,
        days_61_90: agingBuckets['61-90'].amount,
        days_90_plus: agingBuckets['90+'].amount
      },
      aging_buckets: agingBuckets,
      data: detailedData
    });

  } catch (error) {
    console.error('Receivables Aging Report Error:', error);
    res.status(500).json({ error: 'Failed to generate receivables aging report', details: error.message });
  }
};

/**
 * 4. Payables Aging Report
 * GET /api/reports/payables-aging
 */
exports.getPayablesAgingReport = async (req, res) => {
  try {
    const operatorId = getOperatorId(req);
    const { as_of_date } = req.query;

    const asOfDate = as_of_date || new Date().toISOString().split('T')[0];

    const [payablesData] = await pool.query(`
      SELECT
        b.booking_code,
        s.name as supplier_name,
        sp.invoice_date,
        sp.due_date,
        sp.amount_in_base_currency as amount_owed,
        sp.status,
        DATEDIFF(?, sp.due_date) as days_until_due
      FROM supplier_payments sp
      INNER JOIN bookings b ON sp.booking_id = b.id
      INNER JOIN suppliers s ON sp.supplier_id = s.id
      WHERE b.operator_id = ?
        AND sp.status != 'paid'
      ORDER BY sp.due_date
    `, [asOfDate, operatorId]);

    // Calculate aging buckets
    const agingBuckets = {
      current: { count: 0, amount: 0 },
      '31-60': { count: 0, amount: 0 },
      '61-90': { count: 0, amount: 0 },
      overdue: { count: 0, amount: 0 }
    };

    const detailedData = payablesData.map(row => {
      const daysUntilDue = parseInt(row.days_until_due);
      let bucket = 'current';
      let status = 'scheduled';

      if (daysUntilDue < 0) {
        bucket = 'overdue';
        status = 'overdue';
      } else if (daysUntilDue <= 30) {
        bucket = 'current';
      } else if (daysUntilDue <= 60) {
        bucket = '31-60';
      } else {
        bucket = '61-90';
      }

      const amountOwed = parseFloat(row.amount_owed);
      agingBuckets[bucket].count++;
      agingBuckets[bucket].amount += amountOwed;

      return {
        ...row,
        amount_owed: amountOwed,
        aging_bucket: bucket,
        payment_status: status
      };
    });

    const totalPayables = Object.values(agingBuckets).reduce((sum, bucket) => sum + bucket.amount, 0);

    res.json({
      summary: {
        total_payables: totalPayables,
        current: agingBuckets.current.amount,
        days_31_60: agingBuckets['31-60'].amount,
        days_61_90: agingBuckets['61-90'].amount,
        overdue: agingBuckets.overdue.amount
      },
      aging_buckets: agingBuckets,
      data: detailedData
    });

  } catch (error) {
    console.error('Payables Aging Report Error:', error);
    res.status(500).json({ error: 'Failed to generate payables aging report', details: error.message });
  }
};

/**
 * 5. Commission Report
 * GET /api/reports/commissions
 */
exports.getCommissionReport = async (req, res) => {
  try {
    const operatorId = getOperatorId(req);
    const { start_date, end_date, commission_type, status } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    let whereConditions = ['b.operator_id = ?', 'c.created_at BETWEEN ? AND ?'];
    let params = [operatorId, start_date, end_date];

    if (commission_type && commission_type !== 'all') {
      whereConditions.push('c.commission_type = ?');
      params.push(commission_type);
    }

    if (status && status !== 'all') {
      whereConditions.push('c.status = ?');
      params.push(status);
    }

    const whereClause = whereConditions.join(' AND ');

    const [commissionsData] = await pool.query(`
      SELECT
        b.booking_code,
        c.commission_type,
        CASE
          WHEN c.user_id IS NOT NULL THEN u.username
          WHEN c.partner_operator_id IS NOT NULL THEN po.name
          ELSE 'Unknown'
        END as recipient_name,
        c.base_amount_in_base_currency as base_amount,
        c.commission_percentage,
        c.commission_amount_in_base_currency as commission_amount,
        c.status,
        c.due_date,
        c.created_at
      FROM commissions c
      INNER JOIN bookings b ON c.booking_id = b.id
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN operators po ON c.partner_operator_id = po.id
      WHERE ${whereClause}
      ORDER BY c.created_at DESC
    `, params);

    // Summary by type
    const [typeBreakdown] = await pool.query(`
      SELECT
        c.commission_type,
        COUNT(*) as count,
        SUM(c.commission_amount_in_base_currency) as total_amount
      FROM commissions c
      INNER JOIN bookings b ON c.booking_id = b.id
      WHERE ${whereClause}
      GROUP BY c.commission_type
    `, params);

    // Summary by status
    const [statusBreakdown] = await pool.query(`
      SELECT
        c.status,
        COUNT(*) as count,
        SUM(c.commission_amount_in_base_currency) as total_amount
      FROM commissions c
      INNER JOIN bookings b ON c.booking_id = b.id
      WHERE ${whereClause}
      GROUP BY c.status
    `, params);

    const totalEarned = commissionsData.reduce((sum, row) => sum + parseFloat(row.commission_amount || 0), 0);
    const totalPaid = commissionsData
      .filter(row => row.status === 'paid')
      .reduce((sum, row) => sum + parseFloat(row.commission_amount || 0), 0);
    const totalPending = commissionsData
      .filter(row => row.status === 'pending' || row.status === 'approved')
      .reduce((sum, row) => sum + parseFloat(row.commission_amount || 0), 0);

    res.json({
      summary: {
        total_commissions_earned: totalEarned,
        total_commissions_paid: totalPaid,
        pending_commissions: totalPending,
        commission_count: commissionsData.length
      },
      data: commissionsData,
      type_breakdown: typeBreakdown,
      status_breakdown: statusBreakdown
    });

  } catch (error) {
    console.error('Commission Report Error:', error);
    res.status(500).json({ error: 'Failed to generate commission report', details: error.message });
  }
};

// ============================================
// BOOKING REPORTS
// ============================================

/**
 * 6. Bookings by Date Range
 * GET /api/reports/bookings-by-date
 */
exports.getBookingsByDateReport = async (req, res) => {
  try {
    const operatorId = getOperatorId(req);
    const { start_date, end_date, status } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    let whereConditions = ['b.operator_id = ?', 'b.created_at BETWEEN ? AND ?'];
    let params = [operatorId, start_date, end_date];

    if (status && status !== 'all') {
      whereConditions.push('b.status = ?');
      params.push(status);
    }

    const whereClause = whereConditions.join(' AND ');

    const [bookingsData] = await pool.query(`
      SELECT
        DATE(b.created_at) as booking_date,
        b.booking_code,
        CASE
          WHEN b.client_type = 'b2c' THEN c.full_name
          WHEN b.client_type = 'b2b' THEN oc.full_name
        END as client_name,
        b.start_date,
        b.end_date,
        b.status,
        b.total_in_base_currency as total_amount,
        b.payment_status
      FROM bookings b
      LEFT JOIN clients c ON b.client_id = c.id AND b.client_type = 'b2c'
      LEFT JOIN operators_clients oc ON b.client_id = oc.id AND b.client_type = 'b2b'
      WHERE ${whereClause}
      ORDER BY b.created_at DESC
    `, params);

    // Daily aggregation
    const [dailyStats] = await pool.query(`
      SELECT
        DATE(b.created_at) as date,
        COUNT(*) as booking_count,
        SUM(b.total_in_base_currency) as total_revenue
      FROM bookings b
      WHERE ${whereClause}
      GROUP BY DATE(b.created_at)
      ORDER BY date
    `, params);

    // Day of week analysis
    const [dayOfWeekStats] = await pool.query(`
      SELECT
        DAYNAME(b.created_at) as day_name,
        DAYOFWEEK(b.created_at) as day_number,
        COUNT(*) as booking_count,
        AVG(b.total_in_base_currency) as avg_value
      FROM bookings b
      WHERE ${whereClause}
      GROUP BY DAYNAME(b.created_at), DAYOFWEEK(b.created_at)
      ORDER BY day_number
    `, params);

    const totalBookings = bookingsData.length;
    const totalRevenue = bookingsData.reduce((sum, row) => sum + parseFloat(row.total_amount || 0), 0);
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    const confirmedCount = bookingsData.filter(row => row.status === 'confirmed').length;
    const conversionRate = totalBookings > 0 ? (confirmedCount / totalBookings) * 100 : 0;

    res.json({
      summary: {
        total_bookings: totalBookings,
        total_revenue: totalRevenue,
        average_booking_value: averageBookingValue,
        conversion_rate: conversionRate
      },
      data: bookingsData,
      daily_stats: dailyStats,
      day_of_week_stats: dayOfWeekStats
    });

  } catch (error) {
    console.error('Bookings by Date Report Error:', error);
    res.status(500).json({ error: 'Failed to generate bookings by date report', details: error.message });
  }
};

/**
 * 7. Bookings by Status
 * GET /api/reports/bookings-by-status
 */
exports.getBookingsByStatusReport = async (req, res) => {
  try {
    const operatorId = getOperatorId(req);
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const [statusStats] = await pool.query(`
      SELECT
        b.status,
        COUNT(*) as count,
        SUM(b.total_in_base_currency) as total_amount,
        AVG(b.total_in_base_currency) as average_value
      FROM bookings b
      WHERE b.operator_id = ? AND b.created_at BETWEEN ? AND ?
      GROUP BY b.status
      ORDER BY count DESC
    `, [operatorId, start_date, end_date]);

    // Monthly status trends
    const [monthlyTrends] = await pool.query(`
      SELECT
        DATE_FORMAT(b.created_at, '%Y-%m') as month,
        b.status,
        COUNT(*) as count
      FROM bookings b
      WHERE b.operator_id = ? AND b.created_at BETWEEN ? AND ?
      GROUP BY DATE_FORMAT(b.created_at, '%Y-%m'), b.status
      ORDER BY month, b.status
    `, [operatorId, start_date, end_date]);

    const totalBookings = statusStats.reduce((sum, row) => sum + parseInt(row.count), 0);

    const statusData = statusStats.map(row => ({
      status: row.status,
      count: parseInt(row.count),
      percentage: totalBookings > 0 ? (parseInt(row.count) / totalBookings) * 100 : 0,
      total_amount: parseFloat(row.total_amount || 0),
      average_value: parseFloat(row.average_value || 0)
    }));

    const pendingBookings = statusData.find(s => s.status === 'pending')?.count || 0;
    const confirmedBookings = statusData.find(s => s.status === 'confirmed')?.count || 0;
    const completedBookings = statusData.find(s => s.status === 'completed')?.count || 0;
    const cancelledBookings = statusData.find(s => s.status === 'cancelled')?.count || 0;

    res.json({
      summary: {
        pending_bookings: pendingBookings,
        confirmed_bookings: confirmedBookings,
        completed_bookings: completedBookings,
        cancelled_bookings: cancelledBookings
      },
      data: statusData,
      monthly_trends: monthlyTrends
    });

  } catch (error) {
    console.error('Bookings by Status Report Error:', error);
    res.status(500).json({ error: 'Failed to generate bookings by status report', details: error.message });
  }
};

/**
 * 8. Bookings by Destination
 * GET /api/reports/bookings-by-destination
 */
exports.getBookingsByDestinationReport = async (req, res) => {
  try {
    const operatorId = getOperatorId(req);
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    // Destinations from hotels in booking services
    const [destinationStats] = await pool.query(`
      SELECT
        h.city,
        COUNT(DISTINCT bs.booking_id) as booking_count,
        SUM(b.total_in_base_currency) as total_revenue,
        AVG(b.total_in_base_currency) as average_value
      FROM booking_services bs
      INNER JOIN bookings b ON bs.booking_id = b.id
      LEFT JOIN hotels h ON bs.hotel_id = h.id
      WHERE b.operator_id = ?
        AND b.created_at BETWEEN ? AND ?
        AND h.city IS NOT NULL
      GROUP BY h.city
      ORDER BY booking_count DESC
    `, [operatorId, start_date, end_date]);

    const totalBookings = destinationStats.reduce((sum, row) => sum + parseInt(row.booking_count), 0);
    const totalRevenue = destinationStats.reduce((sum, row) => sum + parseFloat(row.total_revenue || 0), 0);

    const destinationData = destinationStats.map(row => ({
      destination: row.city,
      booking_count: parseInt(row.booking_count),
      total_revenue: parseFloat(row.total_revenue || 0),
      average_value: parseFloat(row.average_value || 0),
      percentage: totalBookings > 0 ? (parseInt(row.booking_count) / totalBookings) * 100 : 0
    }));

    const topDestination = destinationData[0]?.destination || 'N/A';
    const totalDestinations = destinationData.length;

    // Calculate average stay duration
    const [stayDuration] = await pool.query(`
      SELECT AVG(DATEDIFF(end_date, start_date)) as avg_duration
      FROM bookings
      WHERE operator_id = ? AND created_at BETWEEN ? AND ?
    `, [operatorId, start_date, end_date]);

    res.json({
      summary: {
        total_destinations: totalDestinations,
        top_destination: topDestination,
        total_bookings: totalBookings,
        average_stay_duration: parseFloat(stayDuration[0]?.avg_duration || 0)
      },
      data: destinationData
    });

  } catch (error) {
    console.error('Bookings by Destination Report Error:', error);
    res.status(500).json({ error: 'Failed to generate bookings by destination report', details: error.message });
  }
};

/**
 * 9. Cancellation Report
 * GET /api/reports/cancellations
 */
exports.getCancellationReport = async (req, res) => {
  try {
    const operatorId = getOperatorId(req);
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const [cancellationsData] = await pool.query(`
      SELECT
        b.booking_code,
        CASE
          WHEN b.client_type = 'b2c' THEN c.full_name
          WHEN b.client_type = 'b2b' THEN oc.full_name
        END as client_name,
        b.created_at as booking_date,
        b.cancelled_at as cancelled_date,
        b.start_date,
        DATEDIFF(b.start_date, b.cancelled_at) as days_before_trip,
        b.cancellation_reason,
        COALESCE(r.refund_amount_in_base_currency, 0) as refund_amount,
        COALESCE(r.refund_status, 'none') as refund_status
      FROM bookings b
      LEFT JOIN clients c ON b.client_id = c.id AND b.client_type = 'b2c'
      LEFT JOIN operators_clients oc ON b.client_id = oc.id AND b.client_type = 'b2b'
      LEFT JOIN refunds r ON b.id = r.booking_id
      WHERE b.operator_id = ?
        AND b.status = 'cancelled'
        AND b.cancelled_at BETWEEN ? AND ?
      ORDER BY b.cancelled_at DESC
    `, [operatorId, start_date, end_date]);

    // Total bookings in period for cancellation rate
    const [totalBookingsData] = await pool.query(`
      SELECT COUNT(*) as total
      FROM bookings
      WHERE operator_id = ? AND created_at BETWEEN ? AND ?
    `, [operatorId, start_date, end_date]);

    const totalCancellations = cancellationsData.length;
    const totalBookings = parseInt(totalBookingsData[0]?.total || 0);
    const cancellationRate = totalBookings > 0 ? (totalCancellations / totalBookings) * 100 : 0;

    const totalRefunds = cancellationsData.reduce((sum, row) => sum + parseFloat(row.refund_amount || 0), 0);
    const avgDaysBeforeTrip = cancellationsData.length > 0
      ? cancellationsData.reduce((sum, row) => sum + parseInt(row.days_before_trip || 0), 0) / cancellationsData.length
      : 0;

    // Cancellation reasons breakdown
    const reasonsBreakdown = {};
    cancellationsData.forEach(row => {
      const reason = row.cancellation_reason || 'Not specified';
      if (!reasonsBreakdown[reason]) {
        reasonsBreakdown[reason] = 0;
      }
      reasonsBreakdown[reason]++;
    });

    const reasonsData = Object.keys(reasonsBreakdown).map(reason => ({
      reason,
      count: reasonsBreakdown[reason],
      percentage: totalCancellations > 0 ? (reasonsBreakdown[reason] / totalCancellations) * 100 : 0
    }));

    // Monthly cancellation trend
    const [monthlyTrend] = await pool.query(`
      SELECT
        DATE_FORMAT(b.cancelled_at, '%Y-%m') as month,
        COUNT(*) as cancellation_count
      FROM bookings b
      WHERE b.operator_id = ?
        AND b.status = 'cancelled'
        AND b.cancelled_at BETWEEN ? AND ?
      GROUP BY DATE_FORMAT(b.cancelled_at, '%Y-%m')
      ORDER BY month
    `, [operatorId, start_date, end_date]);

    res.json({
      summary: {
        total_cancellations: totalCancellations,
        cancellation_rate: cancellationRate,
        total_refunds_processed: totalRefunds,
        average_days_before_trip: avgDaysBeforeTrip
      },
      data: cancellationsData,
      reasons_breakdown: reasonsData,
      monthly_trend: monthlyTrend
    });

  } catch (error) {
    console.error('Cancellation Report Error:', error);
    res.status(500).json({ error: 'Failed to generate cancellation report', details: error.message });
  }
};

/**
 * 10. Booking Source Analysis (B2B vs B2C)
 * GET /api/reports/booking-sources
 */
exports.getBookingSourcesReport = async (req, res) => {
  try {
    const operatorId = getOperatorId(req);
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const [sourceStats] = await pool.query(`
      SELECT
        b.client_type,
        COUNT(*) as booking_count,
        SUM(b.total_in_base_currency) as total_revenue,
        AVG(b.total_in_base_currency) as average_value
      FROM bookings b
      WHERE b.operator_id = ? AND b.created_at BETWEEN ? AND ?
      GROUP BY b.client_type
    `, [operatorId, start_date, end_date]);

    // Monthly trend
    const [monthlyTrend] = await pool.query(`
      SELECT
        DATE_FORMAT(b.created_at, '%Y-%m') as month,
        b.client_type,
        COUNT(*) as booking_count,
        SUM(b.total_in_base_currency) as revenue
      FROM bookings b
      WHERE b.operator_id = ? AND b.created_at BETWEEN ? AND ?
      GROUP BY DATE_FORMAT(b.created_at, '%Y-%m'), b.client_type
      ORDER BY month, b.client_type
    `, [operatorId, start_date, end_date]);

    // Top B2B clients
    const [topB2BClients] = await pool.query(`
      SELECT
        oc.full_name as client_name,
        COUNT(*) as booking_count,
        SUM(b.total_in_base_currency) as total_revenue,
        AVG(b.total_in_base_currency) as average_value
      FROM bookings b
      INNER JOIN operators_clients oc ON b.client_id = oc.id
      WHERE b.operator_id = ?
        AND b.client_type = 'b2b'
        AND b.created_at BETWEEN ? AND ?
      GROUP BY oc.id, oc.full_name
      ORDER BY total_revenue DESC
      LIMIT 10
    `, [operatorId, start_date, end_date]);

    const b2bData = sourceStats.find(s => s.client_type === 'b2b') || { booking_count: 0, total_revenue: 0, average_value: 0 };
    const b2cData = sourceStats.find(s => s.client_type === 'b2c') || { booking_count: 0, total_revenue: 0, average_value: 0 };

    const totalBookings = parseInt(b2bData.booking_count) + parseInt(b2cData.booking_count);
    const totalRevenue = parseFloat(b2bData.total_revenue || 0) + parseFloat(b2cData.total_revenue || 0);

    res.json({
      summary: {
        b2b_bookings: parseInt(b2bData.booking_count),
        b2b_revenue: parseFloat(b2bData.total_revenue || 0),
        b2b_average_value: parseFloat(b2bData.average_value || 0),
        b2c_bookings: parseInt(b2cData.booking_count),
        b2c_revenue: parseFloat(b2cData.total_revenue || 0),
        b2c_average_value: parseFloat(b2cData.average_value || 0)
      },
      source_breakdown: sourceStats.map(row => ({
        source: row.client_type,
        booking_count: parseInt(row.booking_count),
        total_revenue: parseFloat(row.total_revenue || 0),
        average_value: parseFloat(row.average_value || 0),
        percentage_of_total: totalRevenue > 0 ? (parseFloat(row.total_revenue || 0) / totalRevenue) * 100 : 0
      })),
      monthly_trend: monthlyTrend,
      top_b2b_clients: topB2BClients
    });

  } catch (error) {
    console.error('Booking Sources Report Error:', error);
    res.status(500).json({ error: 'Failed to generate booking sources report', details: error.message });
  }
};

// ============================================
// OPERATIONS REPORTS
// ============================================

/**
 * 11. Service Utilization Report
 * GET /api/reports/service-utilization
 */
exports.getServiceUtilizationReport = async (req, res) => {
  try {
    const operatorId = getOperatorId(req);
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const [serviceStats] = await pool.query(`
      SELECT
        bs.service_type,
        COUNT(*) as booking_count,
        SUM(bs.selling_price_in_base_currency) as total_revenue,
        AVG(bs.selling_price_in_base_currency) as average_price
      FROM booking_services bs
      INNER JOIN bookings b ON bs.booking_id = b.id
      WHERE b.operator_id = ? AND b.created_at BETWEEN ? AND ?
      GROUP BY bs.service_type
      ORDER BY booking_count DESC
    `, [operatorId, start_date, end_date]);

    // Monthly service trends
    const [monthlyTrend] = await pool.query(`
      SELECT
        DATE_FORMAT(b.created_at, '%Y-%m') as month,
        bs.service_type,
        COUNT(*) as booking_count
      FROM booking_services bs
      INNER JOIN bookings b ON bs.booking_id = b.id
      WHERE b.operator_id = ? AND b.created_at BETWEEN ? AND ?
      GROUP BY DATE_FORMAT(b.created_at, '%Y-%m'), bs.service_type
      ORDER BY month, bs.service_type
    `, [operatorId, start_date, end_date]);

    // Services per booking average
    const [servicesPerBooking] = await pool.query(`
      SELECT AVG(service_count) as avg_services
      FROM (
        SELECT booking_id, COUNT(*) as service_count
        FROM booking_services bs
        INNER JOIN bookings b ON bs.booking_id = b.id
        WHERE b.operator_id = ? AND b.created_at BETWEEN ? AND ?
        GROUP BY booking_id
      ) as subquery
    `, [operatorId, start_date, end_date]);

    const totalServicesBooked = serviceStats.reduce((sum, row) => sum + parseInt(row.booking_count), 0);
    const totalRevenue = serviceStats.reduce((sum, row) => sum + parseFloat(row.total_revenue || 0), 0);
    const mostPopularService = serviceStats[0]?.service_type || 'N/A';
    const avgServicesPerBooking = parseFloat(servicesPerBooking[0]?.avg_services || 0);

    res.json({
      summary: {
        total_services_booked: totalServicesBooked,
        most_popular_service: mostPopularService,
        total_service_revenue: totalRevenue,
        average_services_per_booking: avgServicesPerBooking
      },
      data: serviceStats.map(row => ({
        service_type: row.service_type,
        booking_count: parseInt(row.booking_count),
        total_revenue: parseFloat(row.total_revenue || 0),
        average_price: parseFloat(row.average_price || 0),
        utilization_rate: totalServicesBooked > 0 ? (parseInt(row.booking_count) / totalServicesBooked) * 100 : 0
      })),
      monthly_trend: monthlyTrend
    });

  } catch (error) {
    console.error('Service Utilization Report Error:', error);
    res.status(500).json({ error: 'Failed to generate service utilization report', details: error.message });
  }
};

/**
 * 12. Guide Performance Report
 * GET /api/reports/guide-performance
 */
exports.getGuidePerformanceReport = async (req, res) => {
  try {
    const operatorId = getOperatorId(req);
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const [guideStats] = await pool.query(`
      SELECT
        g.id as guide_id,
        g.name as guide_name,
        g.languages,
        COUNT(DISTINCT bs.booking_id) as booking_count,
        SUM(bs.selling_price_in_base_currency) as total_revenue,
        AVG(bs.selling_price_in_base_currency) as average_revenue,
        COUNT(DISTINCT DATE(bs.service_date)) as utilization_days
      FROM booking_services bs
      INNER JOIN bookings b ON bs.booking_id = b.id
      INNER JOIN guides g ON bs.guide_id = g.id
      WHERE b.operator_id = ?
        AND bs.service_type = 'guide'
        AND b.created_at BETWEEN ? AND ?
      GROUP BY g.id, g.name, g.languages
      ORDER BY total_revenue DESC
    `, [operatorId, start_date, end_date]);

    const activeGuidesCount = guideStats.length;
    const totalBookings = guideStats.reduce((sum, row) => sum + parseInt(row.booking_count), 0);
    const totalRevenue = guideStats.reduce((sum, row) => sum + parseFloat(row.total_revenue || 0), 0);
    const avgRevenuePerGuide = activeGuidesCount > 0 ? totalRevenue / activeGuidesCount : 0;

    res.json({
      summary: {
        active_guides_count: activeGuidesCount,
        total_guide_bookings: totalBookings,
        total_guide_revenue: totalRevenue,
        average_revenue_per_guide: avgRevenuePerGuide
      },
      data: guideStats.map(row => ({
        guide_id: row.guide_id,
        guide_name: row.guide_name,
        languages: row.languages,
        booking_count: parseInt(row.booking_count),
        total_revenue: parseFloat(row.total_revenue || 0),
        average_revenue: parseFloat(row.average_revenue || 0),
        utilization_days: parseInt(row.utilization_days)
      }))
    });

  } catch (error) {
    console.error('Guide Performance Report Error:', error);
    res.status(500).json({ error: 'Failed to generate guide performance report', details: error.message });
  }
};

/**
 * 13. Hotel Occupancy Report
 * GET /api/reports/hotel-occupancy
 */
exports.getHotelOccupancyReport = async (req, res) => {
  try {
    const operatorId = getOperatorId(req);
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const [hotelStats] = await pool.query(`
      SELECT
        h.id as hotel_id,
        h.name as hotel_name,
        h.city,
        h.star_rating,
        COUNT(DISTINCT bs.booking_id) as booking_count,
        SUM(bs.number_of_nights) as total_room_nights,
        SUM(bs.selling_price_in_base_currency) as total_revenue,
        AVG(bs.selling_price_in_base_currency / NULLIF(bs.number_of_nights, 0)) as average_rate_per_night
      FROM booking_services bs
      INNER JOIN bookings b ON bs.booking_id = b.id
      INNER JOIN hotels h ON bs.hotel_id = h.id
      WHERE b.operator_id = ?
        AND bs.service_type = 'hotel'
        AND b.created_at BETWEEN ? AND ?
      GROUP BY h.id, h.name, h.city, h.star_rating
      ORDER BY total_revenue DESC
    `, [operatorId, start_date, end_date]);

    // Hotels by city
    const [cityStats] = await pool.query(`
      SELECT
        h.city,
        COUNT(DISTINCT bs.booking_id) as booking_count,
        SUM(bs.selling_price_in_base_currency) as total_revenue
      FROM booking_services bs
      INNER JOIN bookings b ON bs.booking_id = b.id
      INNER JOIN hotels h ON bs.hotel_id = h.id
      WHERE b.operator_id = ?
        AND bs.service_type = 'hotel'
        AND b.created_at BETWEEN ? AND ?
      GROUP BY h.city
      ORDER BY booking_count DESC
    `, [operatorId, start_date, end_date]);

    const totalHotelsUsed = hotelStats.length;
    const totalRoomNights = hotelStats.reduce((sum, row) => sum + parseInt(row.total_room_nights || 0), 0);
    const totalRevenue = hotelStats.reduce((sum, row) => sum + parseFloat(row.total_revenue || 0), 0);
    const avgRatePerNight = totalRoomNights > 0 ? totalRevenue / totalRoomNights : 0;

    res.json({
      summary: {
        total_hotels_used: totalHotelsUsed,
        total_room_nights: totalRoomNights,
        total_hotel_revenue: totalRevenue,
        average_rate_per_night: avgRatePerNight
      },
      data: hotelStats.map(row => ({
        hotel_id: row.hotel_id,
        hotel_name: row.hotel_name,
        city: row.city,
        star_rating: row.star_rating,
        booking_count: parseInt(row.booking_count),
        total_room_nights: parseInt(row.total_room_nights || 0),
        total_revenue: parseFloat(row.total_revenue || 0),
        average_rate: parseFloat(row.average_rate_per_night || 0)
      })),
      city_breakdown: cityStats
    });

  } catch (error) {
    console.error('Hotel Occupancy Report Error:', error);
    res.status(500).json({ error: 'Failed to generate hotel occupancy report', details: error.message });
  }
};

/**
 * 14. Vehicle Utilization Report
 * GET /api/reports/vehicle-utilization
 */
exports.getVehicleUtilizationReport = async (req, res) => {
  try {
    const operatorId = getOperatorId(req);
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const [vehicleStats] = await pool.query(`
      SELECT
        vr.vehicle_type,
        s.name as vehicle_company,
        COUNT(DISTINCT bs.booking_id) as rental_count,
        SUM(DATEDIFF(bs.dropoff_date, bs.pickup_date)) as total_days_rented,
        SUM(bs.selling_price_in_base_currency) as total_revenue,
        AVG(bs.selling_price_in_base_currency / NULLIF(DATEDIFF(bs.dropoff_date, bs.pickup_date), 0)) as average_daily_rate
      FROM booking_services bs
      INNER JOIN bookings b ON bs.booking_id = b.id
      INNER JOIN vehicle_rentals vr ON bs.vehicle_rental_id = vr.id
      LEFT JOIN suppliers s ON vr.supplier_id = s.id
      WHERE b.operator_id = ?
        AND bs.service_type = 'vehicle_rental'
        AND b.created_at BETWEEN ? AND ?
      GROUP BY vr.vehicle_type, s.name
      ORDER BY total_revenue DESC
    `, [operatorId, start_date, end_date]);

    // Vehicle type breakdown
    const [typeBreakdown] = await pool.query(`
      SELECT
        vr.vehicle_type,
        COUNT(DISTINCT bs.booking_id) as rental_count,
        SUM(bs.selling_price_in_base_currency) as total_revenue
      FROM booking_services bs
      INNER JOIN bookings b ON bs.booking_id = b.id
      INNER JOIN vehicle_rentals vr ON bs.vehicle_rental_id = vr.id
      WHERE b.operator_id = ?
        AND bs.service_type = 'vehicle_rental'
        AND b.created_at BETWEEN ? AND ?
      GROUP BY vr.vehicle_type
      ORDER BY rental_count DESC
    `, [operatorId, start_date, end_date]);

    const totalRentals = vehicleStats.reduce((sum, row) => sum + parseInt(row.rental_count), 0);
    const totalRevenue = vehicleStats.reduce((sum, row) => sum + parseFloat(row.total_revenue || 0), 0);
    const mostPopularType = typeBreakdown[0]?.vehicle_type || 'N/A';
    const totalDaysRented = vehicleStats.reduce((sum, row) => sum + parseInt(row.total_days_rented || 0), 0);
    const avgRentalDuration = totalRentals > 0 ? totalDaysRented / totalRentals : 0;

    res.json({
      summary: {
        total_vehicle_rentals: totalRentals,
        total_revenue: totalRevenue,
        most_popular_vehicle_type: mostPopularType,
        average_rental_duration: avgRentalDuration
      },
      data: vehicleStats.map(row => ({
        vehicle_type: row.vehicle_type,
        vehicle_company: row.vehicle_company,
        rental_count: parseInt(row.rental_count),
        total_days_rented: parseInt(row.total_days_rented || 0),
        total_revenue: parseFloat(row.total_revenue || 0),
        average_daily_rate: parseFloat(row.average_daily_rate || 0)
      })),
      type_breakdown: typeBreakdown
    });

  } catch (error) {
    console.error('Vehicle Utilization Report Error:', error);
    res.status(500).json({ error: 'Failed to generate vehicle utilization report', details: error.message });
  }
};

// ============================================
// CLIENT REPORTS
// ============================================

/**
 * 15. Client Revenue Analysis
 * GET /api/reports/client-revenue
 */
exports.getClientRevenueReport = async (req, res) => {
  try {
    const operatorId = getOperatorId(req);
    const { start_date, end_date, client_type } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    // Combined query for both B2B and B2C clients
    let clientStats = [];

    if (!client_type || client_type === 'all' || client_type === 'b2c') {
      const [b2cStats] = await pool.query(`
        SELECT
          c.id as client_id,
          c.full_name as client_name,
          'b2c' as client_type,
          COUNT(b.id) as booking_count,
          SUM(b.total_in_base_currency) as total_revenue,
          AVG(b.total_in_base_currency) as average_booking_value,
          MAX(b.created_at) as last_booking_date
        FROM clients c
        INNER JOIN bookings b ON c.id = b.client_id AND b.client_type = 'b2c'
        WHERE b.operator_id = ? AND b.created_at BETWEEN ? AND ?
        GROUP BY c.id, c.full_name
        ORDER BY total_revenue DESC
        LIMIT 50
      `, [operatorId, start_date, end_date]);
      clientStats = [...clientStats, ...b2cStats];
    }

    if (!client_type || client_type === 'all' || client_type === 'b2b') {
      const [b2bStats] = await pool.query(`
        SELECT
          oc.id as client_id,
          oc.full_name as client_name,
          'b2b' as client_type,
          COUNT(b.id) as booking_count,
          SUM(b.total_in_base_currency) as total_revenue,
          AVG(b.total_in_base_currency) as average_booking_value,
          MAX(b.created_at) as last_booking_date
        FROM operators_clients oc
        INNER JOIN bookings b ON oc.id = b.client_id AND b.client_type = 'b2b'
        WHERE b.operator_id = ? AND b.created_at BETWEEN ? AND ?
        GROUP BY oc.id, oc.full_name
        ORDER BY total_revenue DESC
        LIMIT 50
      `, [operatorId, start_date, end_date]);
      clientStats = [...clientStats, ...b2bStats];
    }

    // Sort combined results by revenue
    clientStats.sort((a, b) => parseFloat(b.total_revenue) - parseFloat(a.total_revenue));

    const totalActiveClients = clientStats.length;
    const topClient = clientStats[0]?.client_name || 'N/A';
    const totalRevenue = clientStats.reduce((sum, row) => sum + parseFloat(row.total_revenue || 0), 0);
    const avgRevenuePerClient = totalActiveClients > 0 ? totalRevenue / totalActiveClients : 0;

    // Calculate repeat customer rate
    const repeatCustomers = clientStats.filter(row => parseInt(row.booking_count) > 1).length;
    const repeatCustomerRate = totalActiveClients > 0 ? (repeatCustomers / totalActiveClients) * 100 : 0;

    // Revenue by client type
    const b2bRevenue = clientStats
      .filter(row => row.client_type === 'b2b')
      .reduce((sum, row) => sum + parseFloat(row.total_revenue || 0), 0);
    const b2cRevenue = clientStats
      .filter(row => row.client_type === 'b2c')
      .reduce((sum, row) => sum + parseFloat(row.total_revenue || 0), 0);

    res.json({
      summary: {
        total_active_clients: totalActiveClients,
        top_client_by_revenue: topClient,
        average_revenue_per_client: avgRevenuePerClient,
        repeat_customer_rate: repeatCustomerRate
      },
      data: clientStats.map(row => ({
        client_id: row.client_id,
        client_name: row.client_name,
        client_type: row.client_type,
        booking_count: parseInt(row.booking_count),
        total_revenue: parseFloat(row.total_revenue || 0),
        average_booking_value: parseFloat(row.average_booking_value || 0),
        last_booking_date: row.last_booking_date
      })),
      client_type_breakdown: [
        { client_type: 'b2b', revenue: b2bRevenue },
        { client_type: 'b2c', revenue: b2cRevenue }
      ]
    });

  } catch (error) {
    console.error('Client Revenue Report Error:', error);
    res.status(500).json({ error: 'Failed to generate client revenue report', details: error.message });
  }
};

/**
 * 16. Client Booking History
 * GET /api/reports/client-history
 */
exports.getClientBookingHistoryReport = async (req, res) => {
  try {
    const operatorId = getOperatorId(req);
    const { client_id, client_type, start_date, end_date } = req.query;

    if (!client_id || !client_type) {
      return res.status(400).json({ error: 'client_id and client_type are required' });
    }

    // Get client info
    let clientInfo = {};
    if (client_type === 'b2c') {
      const [clientData] = await pool.query(`SELECT full_name, email, phone FROM clients WHERE id = ?`, [client_id]);
      clientInfo = clientData[0] || {};
    } else if (client_type === 'b2b') {
      const [clientData] = await pool.query(`SELECT full_name, email, phone FROM operators_clients WHERE id = ?`, [client_id]);
      clientInfo = clientData[0] || {};
    }

    // Build query conditions
    let whereConditions = ['b.operator_id = ?', 'b.client_id = ?', 'b.client_type = ?'];
    let params = [operatorId, client_id, client_type];

    if (start_date && end_date) {
      whereConditions.push('b.created_at BETWEEN ? AND ?');
      params.push(start_date, end_date);
    }

    const whereClause = whereConditions.join(' AND ');

    const [bookingHistory] = await pool.query(`
      SELECT
        b.id,
        DATE(b.created_at) as booking_date,
        b.booking_code,
        b.start_date,
        b.destination,
        GROUP_CONCAT(DISTINCT bs.service_type) as services_used,
        b.total_in_base_currency as total_amount,
        b.payment_status,
        b.status as booking_status
      FROM bookings b
      LEFT JOIN booking_services bs ON b.id = bs.booking_id
      WHERE ${whereClause}
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `, params);

    const totalBookings = bookingHistory.length;
    const totalSpent = bookingHistory.reduce((sum, row) => sum + parseFloat(row.total_amount || 0), 0);
    const avgBookingValue = totalBookings > 0 ? totalSpent / totalBookings : 0;
    const lastBookingDate = bookingHistory[0]?.booking_date || null;

    // Service type breakdown
    const serviceBreakdown = {};
    bookingHistory.forEach(row => {
      const services = row.services_used ? row.services_used.split(',') : [];
      services.forEach(service => {
        if (!serviceBreakdown[service]) {
          serviceBreakdown[service] = 0;
        }
        serviceBreakdown[service]++;
      });
    });

    res.json({
      client_info: clientInfo,
      summary: {
        total_bookings: totalBookings,
        total_spent: totalSpent,
        average_booking_value: avgBookingValue,
        last_booking_date: lastBookingDate
      },
      data: bookingHistory,
      service_breakdown: Object.keys(serviceBreakdown).map(service => ({
        service_type: service,
        count: serviceBreakdown[service]
      }))
    });

  } catch (error) {
    console.error('Client Booking History Report Error:', error);
    res.status(500).json({ error: 'Failed to generate client booking history report', details: error.message });
  }
};

/**
 * 17. Outstanding Balances Report
 * GET /api/reports/outstanding-balances
 */
exports.getOutstandingBalancesReport = async (req, res) => {
  try {
    const operatorId = getOperatorId(req);
    const { client_type } = req.query;

    let outstandingData = [];

    // Get B2C clients with outstanding balances
    if (!client_type || client_type === 'all' || client_type === 'b2c') {
      const [b2cData] = await pool.query(`
        SELECT
          c.id as client_id,
          c.full_name as client_name,
          'b2c' as client_type,
          b.booking_code,
          b.created_at as invoice_date,
          b.start_date as due_date,
          DATEDIFF(NOW(), b.start_date) as days_outstanding,
          b.total_in_base_currency as total_amount,
          COALESCE(SUM(cp.amount_in_base_currency), 0) as paid_amount,
          (b.total_in_base_currency - COALESCE(SUM(cp.amount_in_base_currency), 0)) as amount_due
        FROM bookings b
        INNER JOIN clients c ON b.client_id = c.id
        LEFT JOIN client_payments cp ON b.id = cp.booking_id AND cp.status = 'completed'
        WHERE b.operator_id = ?
          AND b.client_type = 'b2c'
          AND b.payment_status != 'fully_paid'
          AND b.status != 'cancelled'
        GROUP BY b.id
        HAVING amount_due > 0
        ORDER BY amount_due DESC
      `, [operatorId]);
      outstandingData = [...outstandingData, ...b2cData];
    }

    // Get B2B clients with outstanding balances
    if (!client_type || client_type === 'all' || client_type === 'b2b') {
      const [b2bData] = await pool.query(`
        SELECT
          oc.id as client_id,
          oc.full_name as client_name,
          'b2b' as client_type,
          b.booking_code,
          b.created_at as invoice_date,
          b.start_date as due_date,
          DATEDIFF(NOW(), b.start_date) as days_outstanding,
          b.total_in_base_currency as total_amount,
          COALESCE(SUM(cp.amount_in_base_currency), 0) as paid_amount,
          (b.total_in_base_currency - COALESCE(SUM(cp.amount_in_base_currency), 0)) as amount_due
        FROM bookings b
        INNER JOIN operators_clients oc ON b.client_id = oc.id
        LEFT JOIN client_payments cp ON b.id = cp.booking_id AND cp.status = 'completed'
        WHERE b.operator_id = ?
          AND b.client_type = 'b2b'
          AND b.payment_status != 'fully_paid'
          AND b.status != 'cancelled'
        GROUP BY b.id
        HAVING amount_due > 0
        ORDER BY amount_due DESC
      `, [operatorId]);
      outstandingData = [...outstandingData, ...b2bData];
    }

    // Calculate aging buckets
    const agingBuckets = {
      current: { count: 0, amount: 0 },
      '31-60': { count: 0, amount: 0 },
      '61-90': { count: 0, amount: 0 },
      '90+': { count: 0, amount: 0 }
    };

    const detailedData = outstandingData.map(row => {
      const daysOutstanding = parseInt(row.days_outstanding);
      let bucket = 'current';

      if (daysOutstanding > 90) bucket = '90+';
      else if (daysOutstanding > 60) bucket = '61-90';
      else if (daysOutstanding > 30) bucket = '31-60';

      const amountDue = parseFloat(row.amount_due);
      agingBuckets[bucket].count++;
      agingBuckets[bucket].amount += amountDue;

      return {
        client_id: row.client_id,
        client_name: row.client_name,
        client_type: row.client_type,
        booking_code: row.booking_code,
        invoice_date: row.invoice_date,
        due_date: row.due_date,
        days_outstanding: daysOutstanding,
        amount_due: amountDue,
        aging_bucket: bucket
      };
    });

    // Sort by amount due descending
    detailedData.sort((a, b) => b.amount_due - a.amount_due);

    const totalOutstanding = detailedData.reduce((sum, row) => sum + row.amount_due, 0);
    const clientsWithBalance = new Set(detailedData.map(row => row.client_id)).size;
    const largestBalance = detailedData[0]?.amount_due || 0;
    const avgDaysOutstanding = detailedData.length > 0
      ? detailedData.reduce((sum, row) => sum + row.days_outstanding, 0) / detailedData.length
      : 0;

    res.json({
      summary: {
        total_outstanding_amount: totalOutstanding,
        number_of_clients_with_balance: clientsWithBalance,
        largest_outstanding_balance: largestBalance,
        average_days_outstanding: avgDaysOutstanding
      },
      aging_buckets: agingBuckets,
      data: detailedData
    });

  } catch (error) {
    console.error('Outstanding Balances Report Error:', error);
    res.status(500).json({ error: 'Failed to generate outstanding balances report', details: error.message });
  }
};

module.exports = exports;

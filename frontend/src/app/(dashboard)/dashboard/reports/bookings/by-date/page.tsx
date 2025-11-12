'use client';
//ft

import React, { useState } from 'react';
import { Calendar, FileText, DollarSign, TrendingUp } from 'lucide-react';
import { ReportHeader } from '@/components/features/reports/ReportHeader';
import { ReportFilters } from '@/components/features/reports/ReportFilters';
import { ReportSummaryCards } from '@/components/features/reports/ReportSummaryCards';
import { ReportTable, ReportTableColumn } from '@/components/features/reports/ReportTable';
import { ReportChart } from '@/components/features/reports/ReportChart';
import { useBookingsByDateReport } from '@/lib/hooks/use-reports';
import type { ReportFilters as ReportFiltersType } from '@/types/reports';

export default function BookingsByDatePage() {
  const [filters, setFilters] = useState<ReportFiltersType>({
    start_date: '',
    end_date: '',
    status: 'all',
  });

  const { data, isLoading, refetch } = useBookingsByDateReport(filters);

  const tableColumns: ReportTableColumn[] = [
    { key: 'booking_date', header: 'Booking Date', format: 'date', sortable: true },
    { key: 'booking_reference', header: 'Reference', sortable: true },
    { key: 'client_name', header: 'Client', sortable: true },
    { key: 'start_date', header: 'Start Date', format: 'date', sortable: true },
    { key: 'total_amount', header: 'Amount', format: 'currency', align: 'right', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
  ];

  return (
    <div className="container mx-auto py-6">
      <ReportHeader
        title="Bookings by Date Range"
        description="Analyze booking volume and trends"
      />

      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        onGenerate={() => refetch()}
        showStatus
        isLoading={isLoading}
      />

      {data && (
        <>
          <ReportSummaryCards
            cards={[
              {
                title: 'Total Bookings',
                value: data.summary.total_bookings,
                format: 'number',
                icon: FileText,
              },
              {
                title: 'Total Revenue',
                value: data.summary.total_revenue,
                format: 'currency',
                icon: DollarSign,
              },
              {
                title: 'Average Booking Value',
                value: data.summary.average_booking_value,
                format: 'currency',
                icon: TrendingUp,
              },
              {
                title: 'Conversion Rate',
                value: data.summary.conversion_rate,
                format: 'percentage',
                icon: TrendingUp,
              },
            ]}
          />

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <ReportChart
              title="Bookings Over Time"
              type="line"
              data={data.daily_stats}
              dataKey="booking_count"
              xAxisKey="date"
            />

            <ReportChart
              title="Bookings by Day of Week"
              type="bar"
              data={data.day_of_week_stats}
              dataKey="booking_count"
              xAxisKey="day_name"
            />
          </div>

          <ReportTable title="Booking Details" data={data.data} columns={tableColumns} />
        </>
      )}
    </div>
  );
}

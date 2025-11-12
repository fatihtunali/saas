'use client';
//ft

import React, { useState } from 'react';
import { GitBranch, DollarSign, FileText, TrendingUp } from 'lucide-react';
import { ReportHeader } from '@/components/features/reports/ReportHeader';
import { ReportFilters } from '@/components/features/reports/ReportFilters';
import { ReportSummaryCards } from '@/components/features/reports/ReportSummaryCards';
import { ReportTable, ReportTableColumn } from '@/components/features/reports/ReportTable';
import { ReportChart } from '@/components/features/reports/ReportChart';
import { useBookingSourcesReport } from '@/lib/hooks/use-reports';
import type { ReportFilters as ReportFiltersType } from '@/types/reports';

export default function BookingSourcesPage() {
  const [filters, setFilters] = useState<ReportFiltersType>({
    start_date: '',
    end_date: '',
  });

  const { data, isLoading, refetch } = useBookingSourcesReport(filters);

  const tableColumns: ReportTableColumn[] = [
    { key: 'client_name', header: 'Client', sortable: true },
    { key: 'booking_count', header: 'Bookings', format: 'number', align: 'right', sortable: true },
    { key: 'total_revenue', header: 'Revenue', format: 'currency', align: 'right', sortable: true },
    {
      key: 'average_value',
      header: 'Avg Value',
      format: 'currency',
      align: 'right',
      sortable: true,
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <ReportHeader title="Booking Source Analysis" description="Compare B2B vs B2C performance" />

      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        onGenerate={() => refetch()}
        isLoading={isLoading}
      />

      {data && (
        <>
          <ReportSummaryCards
            cards={[
              {
                title: 'B2B Bookings',
                value: data.summary.b2b_bookings,
                format: 'number',
                icon: FileText,
              },
              {
                title: 'B2B Revenue',
                value: data.summary.b2b_revenue,
                format: 'currency',
                icon: DollarSign,
              },
              {
                title: 'B2C Bookings',
                value: data.summary.b2c_bookings,
                format: 'number',
                icon: FileText,
              },
              {
                title: 'B2C Revenue',
                value: data.summary.b2c_revenue,
                format: 'currency',
                icon: DollarSign,
              },
            ]}
          />

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <ReportChart
              title="Revenue by Source"
              type="pie"
              data={data.source_breakdown}
              dataKey="total_revenue"
              xAxisKey="source"
              format="currency"
            />

            <ReportChart
              title="Monthly Trend"
              type="bar"
              data={data.monthly_trend}
              dataKey={['booking_count']}
              xAxisKey="month"
            />
          </div>

          <ReportTable title="Top B2B Clients" data={data.top_b2b_clients} columns={tableColumns} />
        </>
      )}
    </div>
  );
}

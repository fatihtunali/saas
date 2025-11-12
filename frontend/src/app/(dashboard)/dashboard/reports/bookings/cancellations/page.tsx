'use client';
//ft

import React, { useState } from 'react';
import { XCircle, Percent, DollarSign, Clock } from 'lucide-react';
import { ReportHeader } from '@/components/features/reports/ReportHeader';
import { ReportFilters } from '@/components/features/reports/ReportFilters';
import { ReportSummaryCards } from '@/components/features/reports/ReportSummaryCards';
import { ReportTable, ReportTableColumn } from '@/components/features/reports/ReportTable';
import { ReportChart } from '@/components/features/reports/ReportChart';
import { useCancellationReport } from '@/lib/hooks/use-reports';
import type { ReportFilters as ReportFiltersType } from '@/types/reports';

export default function CancellationsPage() {
  const [filters, setFilters] = useState<ReportFiltersType>({
    start_date: '',
    end_date: '',
  });

  const { data, isLoading, refetch } = useCancellationReport(filters);

  const tableColumns: ReportTableColumn[] = [
    { key: 'booking_reference', header: 'Reference', sortable: true },
    { key: 'client_name', header: 'Client', sortable: true },
    { key: 'cancelled_date', header: 'Cancelled', format: 'date', sortable: true },
    {
      key: 'days_before_trip',
      header: 'Days Before',
      format: 'number',
      align: 'right',
      sortable: true,
    },
    { key: 'cancellation_reason', header: 'Reason', sortable: true },
    { key: 'refund_amount', header: 'Refund', format: 'currency', align: 'right', sortable: true },
  ];

  return (
    <div className="container mx-auto py-6">
      <ReportHeader
        title="Cancellation Report"
        description="Analyze cancellation patterns and reasons"
      />

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
                title: 'Total Cancellations',
                value: data.summary.total_cancellations,
                format: 'number',
                icon: XCircle,
              },
              {
                title: 'Cancellation Rate',
                value: data.summary.cancellation_rate,
                format: 'percentage',
                icon: Percent,
              },
              {
                title: 'Total Refunds',
                value: data.summary.total_refunds_processed,
                format: 'currency',
                icon: DollarSign,
              },
              {
                title: 'Avg Days Before Trip',
                value: data.summary.average_days_before_trip,
                format: 'number',
                icon: Clock,
              },
            ]}
          />

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <ReportChart
              title="Cancellation Reasons"
              type="pie"
              data={data.reasons_breakdown}
              dataKey="count"
              xAxisKey="reason"
            />

            <ReportChart
              title="Cancellations by Month"
              type="line"
              data={data.monthly_trend}
              dataKey="cancellation_count"
              xAxisKey="month"
            />
          </div>

          <ReportTable title="Cancellation Details" data={data.data} columns={tableColumns} />
        </>
      )}
    </div>
  );
}

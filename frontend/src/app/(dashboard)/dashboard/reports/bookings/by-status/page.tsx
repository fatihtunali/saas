'use client';
//ft

import React, { useState } from 'react';
import { CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import { ReportHeader } from '@/components/features/reports/ReportHeader';
import { ReportFilters } from '@/components/features/reports/ReportFilters';
import { ReportSummaryCards } from '@/components/features/reports/ReportSummaryCards';
import { ReportTable, ReportTableColumn } from '@/components/features/reports/ReportTable';
import { ReportChart } from '@/components/features/reports/ReportChart';
import { useBookingsByStatusReport } from '@/lib/hooks/use-reports';
import type { ReportFilters as ReportFiltersType } from '@/types/reports';

export default function BookingsByStatusPage() {
  const [filters, setFilters] = useState<ReportFiltersType>({
    start_date: '',
    end_date: '',
  });

  const { data, isLoading, refetch } = useBookingsByStatusReport(filters);

  const tableColumns: ReportTableColumn[] = [
    { key: 'status', header: 'Status', sortable: true },
    { key: 'count', header: 'Count', format: 'number', align: 'right', sortable: true },
    {
      key: 'percentage',
      header: 'Percentage',
      format: 'percentage',
      align: 'right',
      sortable: true,
    },
    {
      key: 'total_amount',
      header: 'Total Amount',
      format: 'currency',
      align: 'right',
      sortable: true,
    },
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
      <ReportHeader title="Bookings by Status" description="Track booking status distribution" />

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
                title: 'Pending',
                value: data.summary.pending_bookings,
                format: 'number',
                icon: Clock,
              },
              {
                title: 'Confirmed',
                value: data.summary.confirmed_bookings,
                format: 'number',
                icon: CheckCircle,
              },
              {
                title: 'Completed',
                value: data.summary.completed_bookings,
                format: 'number',
                icon: FileText,
              },
              {
                title: 'Cancelled',
                value: data.summary.cancelled_bookings,
                format: 'number',
                icon: XCircle,
              },
            ]}
          />

          <div className="mb-6">
            <ReportChart
              title="Status Distribution"
              type="pie"
              data={data.data}
              dataKey="count"
              xAxisKey="status"
            />
          </div>

          <ReportTable title="Status Details" data={data.data} columns={tableColumns} />
        </>
      )}
    </div>
  );
}

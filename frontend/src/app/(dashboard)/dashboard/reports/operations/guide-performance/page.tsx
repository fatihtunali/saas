'use client';
//ft

import React, { useState } from 'react';
import { User, FileText, DollarSign, Calendar } from 'lucide-react';
import { ReportHeader } from '@/components/features/reports/ReportHeader';
import { ReportFilters } from '@/components/features/reports/ReportFilters';
import { ReportSummaryCards } from '@/components/features/reports/ReportSummaryCards';
import { ReportTable, ReportTableColumn } from '@/components/features/reports/ReportTable';
import { ReportChart } from '@/components/features/reports/ReportChart';
import { useGuidePerformanceReport } from '@/lib/hooks/use-reports';
import type { ReportFilters as ReportFiltersType } from '@/types/reports';

export default function GuidePerformancePage() {
  const [filters, setFilters] = useState<ReportFiltersType>({
    start_date: '',
    end_date: '',
  });

  const { data, isLoading, refetch } = useGuidePerformanceReport(filters);

  const tableColumns: ReportTableColumn[] = [
    { key: 'guide_name', header: 'Guide Name', sortable: true },
    { key: 'languages', header: 'Languages', sortable: true },
    { key: 'booking_count', header: 'Bookings', format: 'number', align: 'right', sortable: true },
    { key: 'total_revenue', header: 'Revenue', format: 'currency', align: 'right', sortable: true },
    {
      key: 'utilization_days',
      header: 'Days Worked',
      format: 'number',
      align: 'right',
      sortable: true,
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <ReportHeader
        title="Guide Performance Report"
        description="Track guide bookings and revenue"
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
                title: 'Active Guides',
                value: data.summary.active_guides_count,
                format: 'number',
                icon: User,
              },
              {
                title: 'Total Bookings',
                value: data.summary.total_guide_bookings,
                format: 'number',
                icon: FileText,
              },
              {
                title: 'Total Revenue',
                value: data.summary.total_guide_revenue,
                format: 'currency',
                icon: DollarSign,
              },
              {
                title: 'Avg Revenue/Guide',
                value: data.summary.average_revenue_per_guide,
                format: 'currency',
                icon: DollarSign,
              },
            ]}
          />

          <div className="mb-6">
            <ReportChart
              title="Top 10 Guides by Revenue"
              type="bar"
              data={data.data.slice(0, 10)}
              dataKey="total_revenue"
              xAxisKey="guide_name"
              format="currency"
            />
          </div>

          <ReportTable title="Guide Details" data={data.data} columns={tableColumns} />
        </>
      )}
    </div>
  );
}

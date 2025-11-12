'use client';
//ft

import React, { useState } from 'react';
import { Activity, TrendingUp, DollarSign } from 'lucide-react';
import { ReportHeader } from '@/components/features/reports/ReportHeader';
import { ReportFilters } from '@/components/features/reports/ReportFilters';
import { ReportSummaryCards } from '@/components/features/reports/ReportSummaryCards';
import { ReportTable, ReportTableColumn } from '@/components/features/reports/ReportTable';
import { ReportChart } from '@/components/features/reports/ReportChart';
import { useServiceUtilizationReport } from '@/lib/hooks/use-reports';
import type { ReportFilters as ReportFiltersType } from '@/types/reports';

export default function ServiceUtilizationPage() {
  const [filters, setFilters] = useState<ReportFiltersType>({
    start_date: '',
    end_date: '',
  });

  const { data, isLoading, refetch } = useServiceUtilizationReport(filters);

  const tableColumns: ReportTableColumn[] = [
    { key: 'service_type', header: 'Service Type', sortable: true },
    { key: 'booking_count', header: 'Bookings', format: 'number', align: 'right', sortable: true },
    { key: 'total_revenue', header: 'Revenue', format: 'currency', align: 'right', sortable: true },
    {
      key: 'average_price',
      header: 'Avg Price',
      format: 'currency',
      align: 'right',
      sortable: true,
    },
    {
      key: 'utilization_rate',
      header: 'Utilization %',
      format: 'percentage',
      align: 'right',
      sortable: true,
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <ReportHeader
        title="Service Utilization Report"
        description="Track which services are most frequently booked"
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
                title: 'Total Services Booked',
                value: data.summary.total_services_booked,
                format: 'number',
                icon: Activity,
              },
              {
                title: 'Most Popular Service',
                value: data.summary.most_popular_service,
                format: 'text',
                icon: TrendingUp,
              },
              {
                title: 'Total Revenue',
                value: data.summary.total_service_revenue,
                format: 'currency',
                icon: DollarSign,
              },
              {
                title: 'Avg Services/Booking',
                value: data.summary.average_services_per_booking,
                format: 'number',
                icon: Activity,
              },
            ]}
          />

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <ReportChart
              title="Services by Booking Count"
              type="bar"
              data={data.data}
              dataKey="booking_count"
              xAxisKey="service_type"
            />

            <ReportChart
              title="Revenue by Service Type"
              type="pie"
              data={data.data}
              dataKey="total_revenue"
              xAxisKey="service_type"
              format="currency"
            />
          </div>

          <ReportTable title="Service Details" data={data.data} columns={tableColumns} />
        </>
      )}
    </div>
  );
}

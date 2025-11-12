'use client';
//ft

import React, { useState } from 'react';
import { Users, DollarSign, FileText, Percent } from 'lucide-react';
import { ReportHeader } from '@/components/features/reports/ReportHeader';
import { ReportFilters } from '@/components/features/reports/ReportFilters';
import { ReportSummaryCards } from '@/components/features/reports/ReportSummaryCards';
import { ReportTable, ReportTableColumn } from '@/components/features/reports/ReportTable';
import { ReportChart } from '@/components/features/reports/ReportChart';
import { useClientRevenueReport } from '@/lib/hooks/use-reports';
import type { ReportFilters as ReportFiltersType } from '@/types/reports';

export default function ClientRevenueAnalysisPage() {
  const [filters, setFilters] = useState<ReportFiltersType>({
    start_date: '',
    end_date: '',
    client_type: 'all',
  });

  const { data, isLoading, refetch } = useClientRevenueReport(filters);

  const tableColumns: ReportTableColumn[] = [
    { key: 'client_name', header: 'Client Name', sortable: true },
    { key: 'client_type', header: 'Type', sortable: true },
    { key: 'booking_count', header: 'Bookings', format: 'number', align: 'right', sortable: true },
    { key: 'total_revenue', header: 'Revenue', format: 'currency', align: 'right', sortable: true },
    {
      key: 'average_booking_value',
      header: 'Avg Value',
      format: 'currency',
      align: 'right',
      sortable: true,
    },
    { key: 'last_booking_date', header: 'Last Booking', format: 'date', sortable: true },
  ];

  return (
    <div className="container mx-auto py-6">
      <ReportHeader title="Client Revenue Analysis" description="Identify top clients by revenue" />

      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        onGenerate={() => refetch()}
        showClientType
        isLoading={isLoading}
      />

      {data && (
        <>
          <ReportSummaryCards
            cards={[
              {
                title: 'Total Clients',
                value: data.summary.total_active_clients,
                format: 'number',
                icon: Users,
              },
              {
                title: 'Top Client',
                value: data.summary.top_client_by_revenue,
                format: 'text',
                icon: DollarSign,
              },
              {
                title: 'Avg Revenue/Client',
                value: data.summary.average_revenue_per_client,
                format: 'currency',
                icon: DollarSign,
              },
              {
                title: 'Repeat Customer Rate',
                value: data.summary.repeat_customer_rate,
                format: 'percentage',
                icon: Percent,
              },
            ]}
          />

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <ReportChart
              title="Top 20 Clients by Revenue"
              type="bar"
              data={data.data.slice(0, 20)}
              dataKey="total_revenue"
              xAxisKey="client_name"
              format="currency"
            />

            <ReportChart
              title="B2B vs B2C Revenue"
              type="pie"
              data={data.client_type_breakdown}
              dataKey="revenue"
              xAxisKey="client_type"
              format="currency"
            />
          </div>

          <ReportTable title="Client Details" data={data.data} columns={tableColumns} />
        </>
      )}
    </div>
  );
}

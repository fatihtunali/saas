'use client';
//ft

import React, { useState } from 'react';
import { Percent, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { ReportHeader } from '@/components/features/reports/ReportHeader';
import { ReportFilters } from '@/components/features/reports/ReportFilters';
import { ReportSummaryCards } from '@/components/features/reports/ReportSummaryCards';
import { ReportTable, ReportTableColumn } from '@/components/features/reports/ReportTable';
import { ReportChart } from '@/components/features/reports/ReportChart';
import { useCommissionReport } from '@/lib/hooks/use-reports';
import type { ReportFilters as ReportFiltersType } from '@/types/reports';

export default function CommissionsReportPage() {
  const [filters, setFilters] = useState<ReportFiltersType>({
    start_date: '',
    end_date: '',
    commission_type: 'all',
    status: 'all',
  });

  const { data, isLoading, refetch } = useCommissionReport(filters);

  const tableColumns: ReportTableColumn[] = [
    { key: 'booking_reference', header: 'Booking Reference', sortable: true },
    { key: 'commission_type', header: 'Type', sortable: true },
    { key: 'recipient_name', header: 'Recipient', sortable: true },
    {
      key: 'base_amount',
      header: 'Base Amount',
      format: 'currency',
      align: 'right',
      sortable: true,
    },
    {
      key: 'commission_percentage',
      header: 'Rate %',
      format: 'percentage',
      align: 'right',
      sortable: true,
    },
    {
      key: 'commission_amount',
      header: 'Commission',
      format: 'currency',
      align: 'right',
      sortable: true,
    },
    { key: 'status', header: 'Status', sortable: true },
  ];

  return (
    <div className="container mx-auto py-6">
      <ReportHeader
        title="Commission Report"
        description="Track commission earnings and payments"
      />

      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        onGenerate={() => refetch()}
        additionalFilters={<>{/* Commission Type and Status filters are standard */}</>}
        isLoading={isLoading}
      />

      {data && (
        <>
          <ReportSummaryCards
            cards={[
              {
                title: 'Total Earned',
                value: data.summary.total_commissions_earned,
                format: 'currency',
                icon: DollarSign,
              },
              {
                title: 'Total Paid',
                value: data.summary.total_commissions_paid,
                format: 'currency',
                icon: CheckCircle,
              },
              {
                title: 'Pending',
                value: data.summary.pending_commissions,
                format: 'currency',
                icon: Clock,
              },
              {
                title: 'Commission Count',
                value: data.summary.commission_count,
                format: 'number',
                icon: Percent,
              },
            ]}
          />

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <ReportChart
              title="Commissions by Type"
              type="bar"
              data={data.type_breakdown}
              dataKey="total_amount"
              xAxisKey="commission_type"
              format="currency"
            />

            <ReportChart
              title="Commissions by Status"
              type="pie"
              data={data.status_breakdown}
              dataKey="total_amount"
              xAxisKey="status"
              format="currency"
            />
          </div>

          <ReportTable title="Commission Details" data={data.data} columns={tableColumns} />
        </>
      )}
    </div>
  );
}

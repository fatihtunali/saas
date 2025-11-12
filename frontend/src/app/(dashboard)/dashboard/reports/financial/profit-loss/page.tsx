'use client';
//ft

import React, { useState } from 'react';
import { DollarSign, TrendingDown, TrendingUp, Percent } from 'lucide-react';
import { ReportHeader } from '@/components/features/reports/ReportHeader';
import { ReportFilters } from '@/components/features/reports/ReportFilters';
import { ReportSummaryCards } from '@/components/features/reports/ReportSummaryCards';
import { ReportTable, ReportTableColumn } from '@/components/features/reports/ReportTable';
import { ReportChart } from '@/components/features/reports/ReportChart';
import { useProfitLossReport } from '@/lib/hooks/use-reports';
import { exportToExcel } from '@/lib/utils/excel-export';
import { exportToPDF } from '@/lib/utils/pdf-export';
import type { ReportFilters as ReportFiltersType } from '@/types/reports';

export default function ProfitLossReportPage() {
  const [filters, setFilters] = useState<ReportFiltersType>({
    start_date: '',
    end_date: '',
  });

  const { data, isLoading, refetch } = useProfitLossReport(filters);

  const tableColumns: ReportTableColumn[] = [
    { key: 'service_type', header: 'Service Type', sortable: true },
    { key: 'revenue', header: 'Revenue', format: 'currency', align: 'right', sortable: true },
    { key: 'cost', header: 'Cost', format: 'currency', align: 'right', sortable: true },
    { key: 'profit', header: 'Profit', format: 'currency', align: 'right', sortable: true },
    { key: 'margin', header: 'Margin %', format: 'percentage', align: 'right', sortable: true },
  ];

  return (
    <div className="container mx-auto py-6">
      <ReportHeader
        title="Profit & Loss Statement"
        description="Calculate profit margins by comparing revenue to costs"
      />

      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        onGenerate={() => refetch()}
        onExportExcel={() =>
          data &&
          exportToExcel({
            filename: 'profit_loss_report',
            format: 'excel',
            data: data.service_breakdown,
            columns: tableColumns.map(c => ({ ...c, format: c.format || 'text' })),
            title: 'Profit & Loss Statement',
            summary: data.summary,
          })
        }
        onExportPDF={() =>
          data &&
          exportToPDF({
            filename: 'profit_loss_report',
            format: 'pdf',
            data: data.service_breakdown,
            columns: tableColumns.map(c => ({ ...c, format: c.format || 'text' })),
            title: 'Profit & Loss Statement',
            summary: data.summary,
          })
        }
        isLoading={isLoading}
      />

      {data && (
        <>
          <ReportSummaryCards
            cards={[
              {
                title: 'Total Revenue',
                value: data.summary.total_revenue,
                format: 'currency',
                icon: DollarSign,
              },
              {
                title: 'Total Cost',
                value: data.summary.total_cost,
                format: 'currency',
                icon: TrendingDown,
              },
              {
                title: 'Gross Profit',
                value: data.summary.gross_profit,
                format: 'currency',
                icon: TrendingUp,
              },
              {
                title: 'Profit Margin',
                value: data.summary.profit_margin,
                format: 'percentage',
                icon: Percent,
              },
            ]}
          />

          <div className="mb-6">
            <ReportChart
              title="Revenue vs Cost by Month"
              type="bar"
              data={data.monthly_data}
              dataKey={['revenue', 'cost']}
              xAxisKey="month"
              format="currency"
              height={300}
            />
          </div>

          <ReportTable
            title="Profit by Service Type"
            data={data.service_breakdown}
            columns={tableColumns}
          />
        </>
      )}
    </div>
  );
}

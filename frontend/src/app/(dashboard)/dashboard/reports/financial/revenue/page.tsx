'use client';
//ft

import React, { useState } from 'react';
import { DollarSign, TrendingUp, FileText, Users } from 'lucide-react';
import { ReportHeader } from '@/components/features/reports/ReportHeader';
import { ReportFilters } from '@/components/features/reports/ReportFilters';
import { ReportSummaryCards } from '@/components/features/reports/ReportSummaryCards';
import { ReportTable, ReportTableColumn } from '@/components/features/reports/ReportTable';
import { ReportChart } from '@/components/features/reports/ReportChart';
import { useRevenueReport, formatCurrency } from '@/lib/hooks/use-reports';
import { exportToExcel } from '@/lib/utils/excel-export';
import { exportToPDF } from '@/lib/utils/pdf-export';
import type { ReportFilters as ReportFiltersType } from '@/types/reports';

export default function RevenueReportPage() {
  const [filters, setFilters] = useState<ReportFiltersType>({
    start_date: '',
    end_date: '',
    currency: 'TRY',
    client_type: 'all',
    service_type: 'all',
    payment_status: 'all',
  });

  const { data, isLoading, refetch } = useRevenueReport(filters);

  const handleGenerate = () => {
    refetch();
  };

  const handleExportExcel = () => {
    if (!data) return;

    const columns = [
      { header: 'Date', key: 'date', format: 'date' as const },
      { header: 'Booking Reference', key: 'booking_reference', format: 'text' as const },
      { header: 'Client Name', key: 'client_name', format: 'text' as const },
      { header: 'Client Type', key: 'client_type', format: 'text' as const },
      { header: 'Amount', key: 'total_in_base_currency', format: 'currency' as const },
      { header: 'Payment Status', key: 'payment_status', format: 'text' as const },
    ];

    exportToExcel({
      filename: 'revenue_report',
      format: 'excel',
      data: data.data,
      columns,
      title: 'Revenue Report',
      summary: data.summary,
    });
  };

  const handleExportPDF = () => {
    if (!data) return;

    const columns = [
      { header: 'Date', key: 'date', format: 'date' as const },
      { header: 'Booking Ref', key: 'booking_reference', format: 'text' as const },
      { header: 'Client', key: 'client_name', format: 'text' as const },
      { header: 'Amount', key: 'total_in_base_currency', format: 'currency' as const },
      { header: 'Status', key: 'payment_status', format: 'text' as const },
    ];

    exportToPDF({
      filename: 'revenue_report',
      format: 'pdf',
      data: data.data,
      columns,
      title: 'Revenue Report',
      summary: data.summary,
    });
  };

  const tableColumns: ReportTableColumn[] = [
    { key: 'date', header: 'Date', format: 'date', sortable: true },
    { key: 'booking_reference', header: 'Booking Reference', sortable: true },
    { key: 'client_name', header: 'Client Name', sortable: true },
    { key: 'client_type', header: 'Type', sortable: true },
    {
      key: 'total_in_base_currency',
      header: 'Amount',
      format: 'currency',
      align: 'right',
      sortable: true,
    },
    { key: 'payment_status', header: 'Payment Status', sortable: true },
  ];

  return (
    <div className="container mx-auto py-6">
      <ReportHeader
        title="Revenue Report"
        description="Track total revenue by date range, service type, and client type"
        helpText="This report shows all revenue generated within the selected date range. Use filters to analyze revenue by client type, service type, and payment status."
      />

      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        onGenerate={handleGenerate}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
        showCurrency
        showClientType
        showServiceType
        showPaymentStatus
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
                title: 'Total Bookings',
                value: data.summary.total_bookings,
                format: 'number',
                icon: FileText,
              },
              {
                title: 'Average Booking Value',
                value: data.summary.average_booking_value,
                format: 'currency',
                icon: TrendingUp,
              },
              {
                title: 'Growth',
                value: data.summary.growth_percentage,
                format: 'percentage',
                icon: TrendingUp,
                change: data.summary.growth_percentage,
                changeLabel: 'vs previous period',
              },
            ]}
          />

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <ReportChart
              title="Revenue Over Time"
              type="line"
              data={data.chart_data}
              dataKey="revenue"
              xAxisKey="date"
              format="currency"
              height={300}
            />

            <ReportChart
              title="Revenue by Service Type"
              type="bar"
              data={data.service_breakdown}
              dataKey="total_revenue"
              xAxisKey="service_type"
              format="currency"
              height={300}
            />
          </div>

          <div className="mb-6">
            <ReportChart
              title="Revenue by Client Type"
              type="pie"
              data={data.client_type_breakdown}
              dataKey="revenue"
              xAxisKey="client_type"
              format="currency"
              height={300}
            />
          </div>

          <ReportTable title="Revenue Details" data={data.data} columns={tableColumns} />
        </>
      )}

      {!data && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          Select date range and click Generate Report to view data
        </div>
      )}
    </div>
  );
}

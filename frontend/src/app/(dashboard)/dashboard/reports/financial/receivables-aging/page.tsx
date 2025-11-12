'use client';
//ft

import React from 'react';
import { AlertCircle, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { ReportHeader } from '@/components/features/reports/ReportHeader';
import { ReportSummaryCards } from '@/components/features/reports/ReportSummaryCards';
import { ReportTable, ReportTableColumn } from '@/components/features/reports/ReportTable';
import { ReportChart } from '@/components/features/reports/ReportChart';
import { useReceivablesAgingReport } from '@/lib/hooks/use-reports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { exportToExcel } from '@/lib/utils/excel-export';

export default function ReceivablesAgingReportPage() {
  const { data, isLoading } = useReceivablesAgingReport();

  const tableColumns: ReportTableColumn[] = [
    { key: 'booking_reference', header: 'Booking Reference', sortable: true },
    { key: 'client_name', header: 'Client Name', sortable: true },
    { key: 'client_type', header: 'Type', sortable: true },
    { key: 'invoice_date', header: 'Invoice Date', format: 'date', sortable: true },
    {
      key: 'days_outstanding',
      header: 'Days Outstanding',
      format: 'number',
      align: 'right',
      sortable: true,
    },
    { key: 'amount_due', header: 'Amount Due', format: 'currency', align: 'right', sortable: true },
    { key: 'aging_bucket', header: 'Aging Bucket', sortable: true },
  ];

  const pieData = data
    ? [
        { name: 'Current (0-30)', value: data.summary.current },
        { name: '31-60 Days', value: data.summary.days_31_60 },
        { name: '61-90 Days', value: data.summary.days_61_90 },
        { name: '90+ Days', value: data.summary.days_90_plus },
      ]
    : [];

  return (
    <div className="container mx-auto py-6">
      <ReportHeader
        title="Receivables Aging Report"
        description="Track outstanding client payments by age"
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Report Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() =>
              data &&
              exportToExcel({
                filename: 'receivables_aging',
                format: 'excel',
                data: data.data,
                columns: tableColumns.map(c => ({ ...c, format: c.format || 'text' })),
                title: 'Receivables Aging Report',
              })
            }
            disabled={!data}
          >
            Export to Excel
          </Button>
        </CardContent>
      </Card>

      {data && (
        <>
          <ReportSummaryCards
            cards={[
              {
                title: 'Total Outstanding',
                value: data.summary.total_outstanding,
                format: 'currency',
                icon: DollarSign,
              },
              {
                title: 'Current (0-30 days)',
                value: data.summary.current,
                format: 'currency',
                icon: Clock,
              },
              {
                title: '31-60 Days',
                value: data.summary.days_31_60,
                format: 'currency',
                icon: AlertCircle,
              },
              {
                title: '90+ Days',
                value: data.summary.days_90_plus,
                format: 'currency',
                icon: AlertTriangle,
              },
            ]}
          />

          <div className="mb-6">
            <ReportChart
              title="Outstanding Balances by Aging"
              type="pie"
              data={pieData}
              dataKey="value"
              xAxisKey="name"
              format="currency"
              height={300}
            />
          </div>

          <ReportTable title="Receivables Details" data={data.data} columns={tableColumns} />
        </>
      )}
    </div>
  );
}

'use client';
//ft

import React from 'react';
import { CreditCard, Clock, AlertCircle, AlertTriangle } from 'lucide-react';
import { ReportHeader } from '@/components/features/reports/ReportHeader';
import { ReportSummaryCards } from '@/components/features/reports/ReportSummaryCards';
import { ReportTable, ReportTableColumn } from '@/components/features/reports/ReportTable';
import { ReportChart } from '@/components/features/reports/ReportChart';
import { usePayablesAgingReport } from '@/lib/hooks/use-reports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { exportToExcel } from '@/lib/utils/excel-export';

export default function PayablesAgingReportPage() {
  const { data, isLoading } = usePayablesAgingReport();

  const tableColumns: ReportTableColumn[] = [
    { key: 'booking_reference', header: 'Booking Reference', sortable: true },
    { key: 'supplier_name', header: 'Supplier Name', sortable: true },
    { key: 'due_date', header: 'Due Date', format: 'date', sortable: true },
    {
      key: 'days_until_due',
      header: 'Days Until Due',
      format: 'number',
      align: 'right',
      sortable: true,
    },
    {
      key: 'amount_owed',
      header: 'Amount Owed',
      format: 'currency',
      align: 'right',
      sortable: true,
    },
    { key: 'payment_status', header: 'Status', sortable: true },
  ];

  return (
    <div className="container mx-auto py-6">
      <ReportHeader
        title="Payables Aging Report"
        description="Track outstanding supplier payments"
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
                filename: 'payables_aging',
                format: 'excel',
                data: data.data,
                columns: tableColumns.map(c => ({ ...c, format: c.format || 'text' })),
                title: 'Payables Aging Report',
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
                title: 'Total Payables',
                value: data.summary.total_payables,
                format: 'currency',
                icon: CreditCard,
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
                title: 'Overdue',
                value: data.summary.overdue,
                format: 'currency',
                icon: AlertTriangle,
              },
            ]}
          />

          <ReportTable title="Payables Details" data={data.data} columns={tableColumns} />
        </>
      )}
    </div>
  );
}

'use client';
//ft

import React from 'react';
import { AlertTriangle, DollarSign, Users, Clock } from 'lucide-react';
import { ReportHeader } from '@/components/features/reports/ReportHeader';
import { ReportSummaryCards } from '@/components/features/reports/ReportSummaryCards';
import { ReportTable, ReportTableColumn } from '@/components/features/reports/ReportTable';
import { ReportChart } from '@/components/features/reports/ReportChart';
import { useOutstandingBalancesReport } from '@/lib/hooks/use-reports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { exportToExcel } from '@/lib/utils/excel-export';

export default function OutstandingBalancesPage() {
  const { data, isLoading } = useOutstandingBalancesReport();

  const tableColumns: ReportTableColumn[] = [
    { key: 'client_name', header: 'Client Name', sortable: true },
    { key: 'client_type', header: 'Type', sortable: true },
    { key: 'booking_reference', header: 'Booking', sortable: true },
    { key: 'due_date', header: 'Due Date', format: 'date', sortable: true },
    {
      key: 'days_outstanding',
      header: 'Days Outstanding',
      format: 'number',
      align: 'right',
      sortable: true,
    },
    { key: 'amount_due', header: 'Amount Due', format: 'currency', align: 'right', sortable: true },
    { key: 'aging_bucket', header: 'Aging', sortable: true },
  ];

  const pieData = data
    ? [
        { name: 'Current (0-30)', value: data.summary.total_outstanding_amount },
        { name: '31-60 Days', value: 0 },
        { name: '61-90 Days', value: 0 },
        { name: '90+ Days', value: 0 },
      ]
    : [];

  return (
    <div className="container mx-auto py-6">
      <ReportHeader
        title="Outstanding Balances Report"
        description="Track clients with pending payments"
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
                filename: 'outstanding_balances',
                format: 'excel',
                data: data.data,
                columns: tableColumns.map(c => ({ ...c, format: c.format || 'text' })),
                title: 'Outstanding Balances Report',
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
                value: data.summary.total_outstanding_amount,
                format: 'currency',
                icon: DollarSign,
              },
              {
                title: 'Clients with Balance',
                value: data.summary.number_of_clients_with_balance,
                format: 'number',
                icon: Users,
              },
              {
                title: 'Largest Balance',
                value: data.summary.largest_outstanding_balance,
                format: 'currency',
                icon: AlertTriangle,
              },
              {
                title: 'Avg Days Outstanding',
                value: data.summary.average_days_outstanding,
                format: 'number',
                icon: Clock,
              },
            ]}
          />

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <ReportChart
              title="Top Clients by Outstanding Balance"
              type="bar"
              data={data.data.slice(0, 10)}
              dataKey="amount_due"
              xAxisKey="client_name"
              format="currency"
            />

            <ReportChart
              title="Outstanding by Aging"
              type="pie"
              data={[
                { name: 'Current', value: data.aging_buckets.current.amount },
                { name: '31-60', value: data.aging_buckets['31-60'].amount },
                { name: '61-90', value: data.aging_buckets['61-90'].amount },
                { name: '90+', value: data.aging_buckets['90+'].amount },
              ]}
              dataKey="value"
              xAxisKey="name"
              format="currency"
            />
          </div>

          <ReportTable
            title="Outstanding Balances Details"
            data={data.data}
            columns={tableColumns}
          />
        </>
      )}
    </div>
  );
}

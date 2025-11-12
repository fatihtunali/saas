'use client';
//ft

import React, { useState } from 'react';
import { History, FileText, DollarSign, Calendar } from 'lucide-react';
import { ReportHeader } from '@/components/features/reports/ReportHeader';
import { ReportSummaryCards } from '@/components/features/reports/ReportSummaryCards';
import { ReportTable, ReportTableColumn } from '@/components/features/reports/ReportTable';
import { ReportChart } from '@/components/features/reports/ReportChart';
import { useClientBookingHistoryReport } from '@/lib/hooks/use-reports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { ReportFilters as ReportFiltersType } from '@/types/reports';

export default function ClientBookingHistoryPage() {
  const [filters, setFilters] = useState<ReportFiltersType>({
    client_id: undefined,
    client_type: undefined,
    start_date: '',
    end_date: '',
  });

  const { data, isLoading, refetch } = useClientBookingHistoryReport(filters);

  const tableColumns: ReportTableColumn[] = [
    { key: 'booking_date', header: 'Booking Date', format: 'date', sortable: true },
    { key: 'booking_reference', header: 'Reference', sortable: true },
    { key: 'start_date', header: 'Start Date', format: 'date', sortable: true },
    { key: 'destination', header: 'Destination', sortable: true },
    { key: 'total_amount', header: 'Amount', format: 'currency', align: 'right', sortable: true },
    { key: 'booking_status', header: 'Status', sortable: true },
  ];

  return (
    <div className="container mx-auto py-6">
      <ReportHeader
        title="Client Booking History"
        description="Detailed client activity tracking"
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Client Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Client ID</Label>
              <Input
                id="client_id"
                type="number"
                placeholder="Enter client ID"
                value={filters.client_id || ''}
                onChange={e => setFilters({ ...filters, client_id: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_type">Client Type</Label>
              <Select
                value={filters.client_type || 'b2c'}
                onValueChange={value => setFilters({ ...filters, client_type: value as any })}
              >
                <SelectTrigger id="client_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="b2c">B2C Client</SelectItem>
                  <SelectItem value="b2b">B2B Client</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => refetch()}
                disabled={!filters.client_id || !filters.client_type}
              >
                View History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {data && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <strong>Name:</strong> {data.client_info.full_name}
                </div>
                <div>
                  <strong>Email:</strong> {data.client_info.email}
                </div>
                <div>
                  <strong>Phone:</strong> {data.client_info.phone}
                </div>
              </div>
            </CardContent>
          </Card>

          <ReportSummaryCards
            cards={[
              {
                title: 'Total Bookings',
                value: data.summary.total_bookings,
                format: 'number',
                icon: FileText,
              },
              {
                title: 'Total Spent',
                value: data.summary.total_spent,
                format: 'currency',
                icon: DollarSign,
              },
              {
                title: 'Avg Booking Value',
                value: data.summary.average_booking_value,
                format: 'currency',
                icon: DollarSign,
              },
              {
                title: 'Last Booking',
                value: data.summary.last_booking_date || 'N/A',
                format: 'text',
                icon: Calendar,
              },
            ]}
          />

          <div className="mb-6">
            <ReportChart
              title="Spending by Service Type"
              type="pie"
              data={data.service_breakdown}
              dataKey="count"
              xAxisKey="service_type"
            />
          </div>

          <ReportTable title="Booking History" data={data.data} columns={tableColumns} />
        </>
      )}
    </div>
  );
}

'use client';
//ft

import React, { useState } from 'react';
import { MapPin, TrendingUp, FileText } from 'lucide-react';
import { ReportHeader } from '@/components/features/reports/ReportHeader';
import { ReportFilters } from '@/components/features/reports/ReportFilters';
import { ReportSummaryCards } from '@/components/features/reports/ReportSummaryCards';
import { ReportTable, ReportTableColumn } from '@/components/features/reports/ReportTable';
import { ReportChart } from '@/components/features/reports/ReportChart';
import { useBookingsByDestinationReport } from '@/lib/hooks/use-reports';
import type { ReportFilters as ReportFiltersType } from '@/types/reports';

export default function BookingsByDestinationPage() {
  const [filters, setFilters] = useState<ReportFiltersType>({
    start_date: '',
    end_date: '',
  });

  const { data, isLoading, refetch } = useBookingsByDestinationReport(filters);

  const tableColumns: ReportTableColumn[] = [
    { key: 'destination', header: 'Destination', sortable: true },
    { key: 'booking_count', header: 'Bookings', format: 'number', align: 'right', sortable: true },
    { key: 'total_revenue', header: 'Revenue', format: 'currency', align: 'right', sortable: true },
    {
      key: 'average_value',
      header: 'Avg Value',
      format: 'currency',
      align: 'right',
      sortable: true,
    },
    {
      key: 'percentage',
      header: 'Percentage',
      format: 'percentage',
      align: 'right',
      sortable: true,
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <ReportHeader title="Bookings by Destination" description="Identify popular destinations" />

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
                title: 'Total Destinations',
                value: data.summary.total_destinations,
                format: 'number',
                icon: MapPin,
              },
              {
                title: 'Top Destination',
                value: data.summary.top_destination,
                format: 'text',
                icon: TrendingUp,
              },
              {
                title: 'Total Bookings',
                value: data.summary.total_bookings,
                format: 'number',
                icon: FileText,
              },
              {
                title: 'Avg Stay Duration',
                value: data.summary.average_stay_duration,
                format: 'number',
                icon: MapPin,
              },
            ]}
          />

          <div className="mb-6">
            <ReportChart
              title="Top 10 Destinations"
              type="bar"
              data={data.data.slice(0, 10)}
              dataKey="booking_count"
              xAxisKey="destination"
            />
          </div>

          <ReportTable title="Destination Details" data={data.data} columns={tableColumns} />
        </>
      )}
    </div>
  );
}

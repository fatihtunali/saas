'use client';
//ft

import React, { useState } from 'react';
import { Building, FileText, Calendar, DollarSign } from 'lucide-react';
import { ReportHeader } from '@/components/features/reports/ReportHeader';
import { ReportFilters } from '@/components/features/reports/ReportFilters';
import { ReportSummaryCards } from '@/components/features/reports/ReportSummaryCards';
import { ReportTable, ReportTableColumn } from '@/components/features/reports/ReportTable';
import { ReportChart } from '@/components/features/reports/ReportChart';
import { useHotelOccupancyReport } from '@/lib/hooks/use-reports';
import type { ReportFilters as ReportFiltersType } from '@/types/reports';

export default function HotelOccupancyPage() {
  const [filters, setFilters] = useState<ReportFiltersType>({
    start_date: '',
    end_date: '',
  });

  const { data, isLoading, refetch } = useHotelOccupancyReport(filters);

  const tableColumns: ReportTableColumn[] = [
    { key: 'hotel_name', header: 'Hotel Name', sortable: true },
    { key: 'city', header: 'City', sortable: true },
    { key: 'star_rating', header: 'Stars', format: 'number', align: 'center', sortable: true },
    { key: 'booking_count', header: 'Bookings', format: 'number', align: 'right', sortable: true },
    {
      key: 'total_room_nights',
      header: 'Room Nights',
      format: 'number',
      align: 'right',
      sortable: true,
    },
    { key: 'total_revenue', header: 'Revenue', format: 'currency', align: 'right', sortable: true },
  ];

  return (
    <div className="container mx-auto py-6">
      <ReportHeader title="Hotel Occupancy Report" description="Track hotel usage statistics" />

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
                title: 'Hotels Used',
                value: data.summary.total_hotels_used,
                format: 'number',
                icon: Building,
              },
              {
                title: 'Total Room Nights',
                value: data.summary.total_room_nights,
                format: 'number',
                icon: Calendar,
              },
              {
                title: 'Total Revenue',
                value: data.summary.total_hotel_revenue,
                format: 'currency',
                icon: DollarSign,
              },
              {
                title: 'Avg Rate/Night',
                value: data.summary.average_rate_per_night,
                format: 'currency',
                icon: DollarSign,
              },
            ]}
          />

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <ReportChart
              title="Top 10 Hotels"
              type="bar"
              data={data.data.slice(0, 10)}
              dataKey="booking_count"
              xAxisKey="hotel_name"
            />

            <ReportChart
              title="Bookings by City"
              type="pie"
              data={data.city_breakdown}
              dataKey="booking_count"
              xAxisKey="city"
            />
          </div>

          <ReportTable title="Hotel Details" data={data.data} columns={tableColumns} />
        </>
      )}
    </div>
  );
}

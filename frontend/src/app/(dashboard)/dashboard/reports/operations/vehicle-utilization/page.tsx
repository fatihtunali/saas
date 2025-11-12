'use client';
//ft

import React, { useState } from 'react';
import { Car, FileText, DollarSign, Calendar } from 'lucide-react';
import { ReportHeader } from '@/components/features/reports/ReportHeader';
import { ReportFilters } from '@/components/features/reports/ReportFilters';
import { ReportSummaryCards } from '@/components/features/reports/ReportSummaryCards';
import { ReportTable, ReportTableColumn } from '@/components/features/reports/ReportTable';
import { ReportChart } from '@/components/features/reports/ReportChart';
import { useVehicleUtilizationReport } from '@/lib/hooks/use-reports';
import type { ReportFilters as ReportFiltersType } from '@/types/reports';

export default function VehicleUtilizationPage() {
  const [filters, setFilters] = useState<ReportFiltersType>({
    start_date: '',
    end_date: '',
  });

  const { data, isLoading, refetch } = useVehicleUtilizationReport(filters);

  const tableColumns: ReportTableColumn[] = [
    { key: 'vehicle_type', header: 'Vehicle Type', sortable: true },
    { key: 'vehicle_company', header: 'Company', sortable: true },
    { key: 'rental_count', header: 'Rentals', format: 'number', align: 'right', sortable: true },
    {
      key: 'total_days_rented',
      header: 'Days Rented',
      format: 'number',
      align: 'right',
      sortable: true,
    },
    { key: 'total_revenue', header: 'Revenue', format: 'currency', align: 'right', sortable: true },
  ];

  return (
    <div className="container mx-auto py-6">
      <ReportHeader
        title="Vehicle Utilization Report"
        description="Track vehicle rental frequency"
      />

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
                title: 'Total Rentals',
                value: data.summary.total_vehicle_rentals,
                format: 'number',
                icon: FileText,
              },
              {
                title: 'Total Revenue',
                value: data.summary.total_revenue,
                format: 'currency',
                icon: DollarSign,
              },
              {
                title: 'Most Popular Type',
                value: data.summary.most_popular_vehicle_type,
                format: 'text',
                icon: Car,
              },
              {
                title: 'Avg Rental Duration',
                value: data.summary.average_rental_duration,
                format: 'number',
                icon: Calendar,
              },
            ]}
          />

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <ReportChart
              title="Rentals by Vehicle Type"
              type="bar"
              data={data.type_breakdown}
              dataKey="rental_count"
              xAxisKey="vehicle_type"
            />

            <ReportChart
              title="Revenue by Vehicle Type"
              type="pie"
              data={data.type_breakdown}
              dataKey="total_revenue"
              xAxisKey="vehicle_type"
              format="currency"
            />
          </div>

          <ReportTable title="Vehicle Details" data={data.data} columns={tableColumns} />
        </>
      )}
    </div>
  );
}

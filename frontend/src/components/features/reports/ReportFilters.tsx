'use client';

import React, { useState } from 'react';
import { Calendar, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getDatePresets, formatDateForAPI } from '@/lib/hooks/use-reports';
import type { ReportFilters as ReportFiltersType } from '@/types/reports';

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onFiltersChange: (filters: ReportFiltersType) => void;
  onGenerate: () => void;
  onExportExcel?: () => void;
  onExportPDF?: () => void;
  showCurrency?: boolean;
  showClientType?: boolean;
  showStatus?: boolean;
  showServiceType?: boolean;
  showPaymentStatus?: boolean;
  additionalFilters?: React.ReactNode;
  isLoading?: boolean;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFiltersChange,
  onGenerate,
  onExportExcel,
  onExportPDF,
  showCurrency = false,
  showClientType = false,
  showStatus = false,
  showServiceType = false,
  showPaymentStatus = false,
  additionalFilters,
  isLoading = false,
}) => {
  const datePresets = getDatePresets();
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const handlePresetChange = (presetValue: string) => {
    setSelectedPreset(presetValue);
    const preset = datePresets.find(p => p.value === presetValue);
    if (preset) {
      onFiltersChange({
        ...filters,
        start_date: formatDateForAPI(preset.start_date),
        end_date: formatDateForAPI(preset.end_date),
      });
    }
  };

  const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
    setSelectedPreset('');
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range Preset */}
          <div className="space-y-2">
            <Label htmlFor="preset">Date Range Preset</Label>
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
              <SelectTrigger id="preset">
                <SelectValue placeholder="Select preset..." />
              </SelectTrigger>
              <SelectContent>
                {datePresets.map(preset => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <div className="relative">
              <Input
                id="start_date"
                type="date"
                value={filters.start_date || ''}
                onChange={e => handleDateChange('start_date', e.target.value)}
                className="pr-10"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <div className="relative">
              <Input
                id="end_date"
                type="date"
                value={filters.end_date || ''}
                onChange={e => handleDateChange('end_date', e.target.value)}
                className="pr-10"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Currency Selector */}
          {showCurrency && (
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={filters.currency || 'TRY'}
                onValueChange={value => onFiltersChange({ ...filters, currency: value })}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRY">TRY (Turkish Lira)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Client Type Filter */}
          {showClientType && (
            <div className="space-y-2">
              <Label htmlFor="client_type">Client Type</Label>
              <Select
                value={filters.client_type || 'all'}
                onValueChange={value => onFiltersChange({ ...filters, client_type: value as any })}
              >
                <SelectTrigger id="client_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="b2b">B2B Only</SelectItem>
                  <SelectItem value="b2c">B2C Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Status Filter */}
          {showStatus && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={value => onFiltersChange({ ...filters, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Service Type Filter */}
          {showServiceType && (
            <div className="space-y-2">
              <Label htmlFor="service_type">Service Type</Label>
              <Select
                value={filters.service_type || 'all'}
                onValueChange={value => onFiltersChange({ ...filters, service_type: value })}
              >
                <SelectTrigger id="service_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="hotel">Hotels</SelectItem>
                  <SelectItem value="guide">Guides</SelectItem>
                  <SelectItem value="tour">Tours</SelectItem>
                  <SelectItem value="transfer">Transfers</SelectItem>
                  <SelectItem value="vehicle_rental">Vehicle Rentals</SelectItem>
                  <SelectItem value="entrance_fee">Entrance Fees</SelectItem>
                  <SelectItem value="restaurant">Restaurants</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Payment Status Filter */}
          {showPaymentStatus && (
            <div className="space-y-2">
              <Label htmlFor="payment_status">Payment Status</Label>
              <Select
                value={filters.payment_status || 'all'}
                onValueChange={value => onFiltersChange({ ...filters, payment_status: value })}
              >
                <SelectTrigger id="payment_status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="fully_paid">Fully Paid</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  <SelectItem value="not_paid">Not Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Additional Filters */}
          {additionalFilters}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-6">
          <Button
            onClick={onGenerate}
            disabled={isLoading || !filters.start_date || !filters.end_date}
            className="flex-1 sm:flex-none"
          >
            {isLoading ? 'Generating...' : 'Generate Report'}
          </Button>

          {onExportExcel && (
            <Button
              variant="outline"
              onClick={onExportExcel}
              disabled={isLoading}
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
            </Button>
          )}

          {onExportPDF && (
            <Button variant="outline" onClick={onExportPDF} disabled={isLoading} className="gap-2">
              <FileText className="h-4 w-4" />
              Export PDF
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

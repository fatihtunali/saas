'use client';

/**
 * VoucherGenerator Component
 *
 * Main component for generating and downloading vouchers for booking services.
 * Allows selection of multiple services and bulk voucher generation.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Download, Mail, Eye, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Booking, BookingService, BookingPassenger } from '@/types/bookings';
import {
  createVoucherFromService,
  downloadVoucherPDF,
  previewVoucherHTML,
  validateVoucherData,
} from '@/lib/vouchers';

interface VoucherGeneratorProps {
  booking: Booking;
  services: BookingService[];
  passengers?: BookingPassenger[];
  onVoucherGenerated?: (serviceId: string) => void;
}

interface ServiceSelection {
  serviceId: string;
  selected: boolean;
  generating: boolean;
  generated: boolean;
  error?: string;
}

export function VoucherGenerator({
  booking,
  services,
  passengers = [],
  onVoucherGenerated,
}: VoucherGeneratorProps) {
  const [selections, setSelections] = useState<Record<string, ServiceSelection>>(
    services.reduce(
      (acc, service) => {
        acc[service.id] = {
          serviceId: service.id,
          selected: false,
          generating: false,
          generated: service.voucherSent || false,
          error: undefined,
        };
        return acc;
      },
      {} as Record<string, ServiceSelection>
    )
  );

  const [isGenerating, setIsGenerating] = useState(false);

  // Filter services that support voucher generation
  const supportedServices = services.filter(service =>
    ['hotel', 'transfer', 'tour', 'guide', 'restaurant'].includes(service.serviceType)
  );

  const selectedServices = supportedServices.filter(service => selections[service.id]?.selected);

  const allSelected = supportedServices.every(service => selections[service.id]?.selected);
  const someSelected = supportedServices.some(service => selections[service.id]?.selected);

  /**
   * Toggle individual service selection
   */
  const toggleService = (serviceId: string) => {
    setSelections(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        selected: !prev[serviceId].selected,
      },
    }));
  };

  /**
   * Toggle all services selection
   */
  const toggleAll = () => {
    const newSelected = !allSelected;
    setSelections(prev => {
      const updated = { ...prev };
      supportedServices.forEach(service => {
        updated[service.id] = {
          ...updated[service.id],
          selected: newSelected,
        };
      });
      return updated;
    });
  };

  /**
   * Generate and download vouchers for selected services
   */
  const handleGenerate = async () => {
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    setIsGenerating(true);

    try {
      let successCount = 0;
      let errorCount = 0;

      // Generate vouchers sequentially to avoid overwhelming the browser
      for (const service of selectedServices) {
        // Mark as generating
        setSelections(prev => ({
          ...prev,
          [service.id]: {
            ...prev[service.id],
            generating: true,
            error: undefined,
          },
        }));

        try {
          // Create voucher data
          const voucherData = createVoucherFromService(booking, service, passengers);

          // Validate voucher data
          const validation = validateVoucherData(voucherData);
          if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
          }

          // Generate and download PDF
          await downloadVoucherPDF(voucherData);

          // Mark as generated
          setSelections(prev => ({
            ...prev,
            [service.id]: {
              ...prev[service.id],
              generating: false,
              generated: true,
              selected: false,
            },
          }));

          successCount++;

          // Callback
          if (onVoucherGenerated) {
            onVoucherGenerated(service.id);
          }

          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error generating voucher for service ${service.id}:`, error);
          setSelections(prev => ({
            ...prev,
            [service.id]: {
              ...prev[service.id],
              generating: false,
              error: error instanceof Error ? error.message : 'Failed to generate',
            },
          }));
          errorCount++;
        }
      }

      // Show summary toast
      if (successCount > 0) {
        toast.success(
          `Successfully generated ${successCount} voucher${successCount > 1 ? 's' : ''}`
        );
      }
      if (errorCount > 0) {
        toast.error(`Failed to generate ${errorCount} voucher${errorCount > 1 ? 's' : ''}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Preview a single voucher
   */
  const handlePreview = (service: BookingService) => {
    try {
      const voucherData = createVoucherFromService(booking, service, passengers);
      previewVoucherHTML(voucherData);
    } catch (error) {
      console.error('Error previewing voucher:', error);
      toast.error('Failed to preview voucher');
    }
  };

  /**
   * Email vouchers (placeholder)
   */
  const handleEmail = async () => {
    // TODO: Implement email functionality
    toast.info('Email functionality coming soon');
  };

  if (supportedServices.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No services available for voucher generation</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Generate Vouchers</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Select services to generate vouchers for
            </p>
          </div>
          <Badge variant="secondary">{selectedServices.length} selected</Badge>
        </div>

        {/* Select All */}
        <div className="flex items-center space-x-2 pb-3 border-b">
          <Checkbox
            id="select-all"
            checked={allSelected}
            onCheckedChange={toggleAll}
            className={someSelected && !allSelected ? 'data-[state=checked]:bg-primary/50' : ''}
          />
          <label htmlFor="select-all" className="text-sm font-medium leading-none cursor-pointer">
            Select All Services
          </label>
        </div>

        {/* Service List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {supportedServices.map(service => {
            const selection = selections[service.id];
            const isProcessing = selection.generating;
            const hasError = !!selection.error;

            return (
              <div
                key={service.id}
                className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                  selection.selected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                } ${hasError ? 'border-destructive bg-destructive/5' : ''}`}
              >
                <Checkbox
                  id={service.id}
                  checked={selection.selected}
                  onCheckedChange={() => toggleService(service.id)}
                  disabled={isProcessing}
                  className="mt-1"
                />

                <div className="flex-1 min-w-0">
                  <label htmlFor={service.id} className="block cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {service.serviceName || 'Unnamed Service'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {service.serviceType}
                      </Badge>
                      {selection.generated && !hasError && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      {hasError && <AlertCircle className="h-4 w-4 text-destructive" />}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>
                        Date: {new Date(service.serviceDate).toLocaleDateString()}
                        {service.pickupTime && ` at ${service.pickupTime}`}
                      </div>
                      {service.supplierName && <div>Provider: {service.supplierName}</div>}
                      {service.pickupLocation && <div>Location: {service.pickupLocation}</div>}
                    </div>
                    {hasError && (
                      <div className="text-xs text-destructive mt-2">Error: {selection.error}</div>
                    )}
                  </label>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreview(service)}
                    disabled={isProcessing}
                    title="Preview voucher"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-3 border-t">
          <Button
            onClick={handleGenerate}
            disabled={selectedServices.length === 0 || isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate {selectedServices.length > 0 && `(${selectedServices.length})`}
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleEmail}
            disabled={selectedServices.length === 0 || isGenerating}
          >
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
          <strong>Note:</strong> Vouchers will be downloaded as PDF files. Make sure pop-ups are
          enabled in your browser. Each voucher will download separately.
        </div>
      </div>
    </Card>
  );
}

'use client';

/**
 * VoucherQuickActions Component
 *
 * Quick action buttons for voucher operations that can be embedded in any page.
 * Provides shortcuts for common voucher tasks.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText, Download, Eye, Mail, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import type { Booking, BookingService, BookingPassenger } from '@/types/bookings';
import {
  createVoucherFromService,
  downloadVoucherPDF,
  previewVoucherHTML,
  createVouchersFromBooking,
  downloadMultipleVouchers,
} from '@/lib/vouchers';

interface VoucherQuickActionsProps {
  booking: Booking;
  service?: BookingService; // Optional: for single service actions
  services?: BookingService[]; // Optional: for bulk actions
  passengers?: BookingPassenger[];
  variant?: 'button' | 'dropdown';
  onVoucherGenerated?: () => void;
}

export function VoucherQuickActions({
  booking,
  service,
  services,
  passengers = [],
  variant = 'dropdown',
  onVoucherGenerated,
}: VoucherQuickActionsProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Generate and download single voucher
   */
  const handleGenerateSingle = async () => {
    if (!service) return;

    setIsGenerating(true);
    try {
      const voucherData = createVoucherFromService(booking, service, passengers);
      await downloadVoucherPDF(voucherData);
      toast.success('Voucher downloaded successfully');
      if (onVoucherGenerated) {
        onVoucherGenerated();
      }
    } catch (error) {
      console.error('Error generating voucher:', error);
      toast.error('Failed to generate voucher');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Generate all vouchers for booking
   */
  const handleGenerateAll = async () => {
    if (!services || services.length === 0) return;

    setIsGenerating(true);
    try {
      const vouchers = createVouchersFromBooking(booking, services, passengers);
      if (vouchers.length === 0) {
        toast.info('No vouchers available for this booking');
        return;
      }

      await downloadMultipleVouchers(vouchers);
      toast.success(`Generated ${vouchers.length} voucher(s) successfully`);
      if (onVoucherGenerated) {
        onVoucherGenerated();
      }
    } catch (error) {
      console.error('Error generating vouchers:', error);
      toast.error('Failed to generate vouchers');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Preview single voucher
   */
  const handlePreview = () => {
    if (!service) return;

    try {
      const voucherData = createVoucherFromService(booking, service, passengers);
      previewVoucherHTML(voucherData);
    } catch (error) {
      console.error('Error previewing voucher:', error);
      toast.error('Failed to preview voucher');
    }
  };

  /**
   * Email voucher (placeholder)
   */
  const handleEmail = () => {
    toast.info('Email functionality coming soon');
  };

  // Single button variant
  if (variant === 'button' && service) {
    return (
      <Button onClick={handleGenerateSingle} disabled={isGenerating} size="sm" variant="outline">
        <FileText className="mr-2 h-4 w-4" />
        {isGenerating ? 'Generating...' : 'Generate Voucher'}
      </Button>
    );
  }

  // Dropdown menu variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isGenerating}>
          <FileText className="mr-2 h-4 w-4" />
          Vouchers
          <MoreVertical className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Voucher Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Single Service Actions */}
        {service && (
          <>
            <DropdownMenuItem onClick={handlePreview}>
              <Eye className="mr-2 h-4 w-4" />
              Preview Voucher
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleGenerateSingle}>
              <Download className="mr-2 h-4 w-4" />
              Download Voucher
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Email Voucher
            </DropdownMenuItem>
          </>
        )}

        {/* Bulk Actions */}
        {services && services.length > 0 && (
          <>
            {service && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={handleGenerateAll}>
              <Download className="mr-2 h-4 w-4" />
              Generate All Vouchers
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Email All Vouchers
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

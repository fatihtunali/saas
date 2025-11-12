'use client';

/**
 * VoucherPreview Component
 *
 * Component for previewing vouchers in a modal/dialog before generating PDF.
 * Shows the voucher HTML content in an iframe.
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Download, Printer, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Voucher } from '@/lib/vouchers/types';
import {
  generateHotelVoucherHTML,
  generateTransferVoucherHTML,
  generateTourVoucherHTML,
  generateGuideVoucherHTML,
  generateRestaurantVoucherHTML,
} from '@/lib/vouchers/templates';
import { downloadVoucherPDF } from '@/lib/vouchers/generator';

interface VoucherPreviewProps {
  voucher: Voucher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload?: () => void;
}

/**
 * Get HTML for voucher based on type
 */
function getVoucherHTML(voucher: Voucher): string {
  switch (voucher.type) {
    case 'hotel':
      return generateHotelVoucherHTML(voucher);
    case 'transfer':
      return generateTransferVoucherHTML(voucher);
    case 'tour':
      return generateTourVoucherHTML(voucher);
    case 'guide':
      return generateGuideVoucherHTML(voucher);
    case 'restaurant':
      return generateRestaurantVoucherHTML(voucher);
    default:
      return '<p>Unknown voucher type</p>';
  }
}

export function VoucherPreview({ voucher, open, onOpenChange, onDownload }: VoucherPreviewProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (voucher && open) {
      try {
        const html = getVoucherHTML(voucher);
        setHtmlContent(html);
      } catch (error) {
        console.error('Error generating voucher HTML:', error);
        toast.error('Failed to preview voucher');
        setHtmlContent('<p>Error generating voucher preview</p>');
      }
    }
  }, [voucher, open]);

  const handleDownload = async () => {
    if (!voucher) return;

    setIsDownloading(true);
    try {
      await downloadVoucherPDF(voucher);
      toast.success('Voucher downloaded successfully');
      if (onDownload) {
        onDownload();
      }
      // Close preview after download
      onOpenChange(false);
    } catch (error) {
      console.error('Error downloading voucher:', error);
      toast.error('Failed to download voucher');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!voucher) return;

    // Open in new window and print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  if (!voucher) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Voucher Preview</DialogTitle>
          <DialogDescription>
            {voucher.type.charAt(0).toUpperCase() + voucher.type.slice(1)} Voucher -{' '}
            {voucher.voucherNumber}
          </DialogDescription>
        </DialogHeader>

        {/* Preview Area */}
        <div className="flex-1 overflow-hidden border rounded-lg bg-white">
          <iframe
            srcDoc={htmlContent}
            className="w-full h-full"
            title="Voucher Preview"
            sandbox="allow-same-origin"
          />
        </div>

        {/* Actions */}
        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={handlePrint} disabled={!htmlContent}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
            <Button type="button" onClick={handleDownload} disabled={isDownloading || !htmlContent}>
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

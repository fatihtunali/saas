/**
 * Voucher PDF Generator
 *
 * This file contains the main logic for generating PDF vouchers from HTML templates.
 * Uses jsPDF and html2canvas for PDF generation.
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Voucher,
  VoucherGenerationOptions,
  VoucherTemplateConfig,
  HotelVoucher,
  TransferVoucher,
  TourVoucher,
  GuideVoucher,
  RestaurantVoucher,
} from './types';
import {
  generateHotelVoucherHTML,
  generateTransferVoucherHTML,
  generateTourVoucherHTML,
  generateGuideVoucherHTML,
  generateRestaurantVoucherHTML,
} from './templates';

/**
 * Generate a voucher PDF from voucher data
 */
export async function generateVoucherPDF(
  voucherData: Voucher,
  options: VoucherGenerationOptions = {},
  config?: VoucherTemplateConfig
): Promise<Blob> {
  try {
    // Generate HTML based on voucher type
    const html = getVoucherTemplate(voucherData, config);

    // If HTML output is requested
    if (options.format === 'html') {
      return new Blob([html], { type: 'text/html' });
    }

    // Generate PDF
    const pdfBlob = await convertHTMLToPDF(html, voucherData.voucherNumber);
    return pdfBlob;
  } catch (error) {
    console.error('Error generating voucher:', error);
    throw new Error('Failed to generate voucher PDF');
  }
}

/**
 * Get the appropriate HTML template based on voucher type
 */
function getVoucherTemplate(data: Voucher, config?: VoucherTemplateConfig): string {
  switch (data.type) {
    case 'hotel':
      return generateHotelVoucherHTML(data as HotelVoucher, config);
    case 'transfer':
      return generateTransferVoucherHTML(data as TransferVoucher, config);
    case 'tour':
      return generateTourVoucherHTML(data as TourVoucher, config);
    case 'guide':
      return generateGuideVoucherHTML(data as GuideVoucher, config);
    case 'restaurant':
      return generateRestaurantVoucherHTML(data as RestaurantVoucher, config);
    default:
      throw new Error(`Unknown voucher type: ${(data as any).type}`);
  }
}

/**
 * Convert HTML string to PDF blob using html2canvas and jsPDF
 */
async function convertHTMLToPDF(html: string, voucherNumber: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary container for the HTML
      const container = document.createElement('div');
      container.innerHTML = html;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '800px'; // Fixed width for consistent rendering
      document.body.appendChild(container);

      // Wait for fonts and images to load
      setTimeout(async () => {
        try {
          // Convert HTML to canvas
          const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
          });

          // Calculate PDF dimensions
          const imgWidth = 210; // A4 width in mm
          const pageHeight = 297; // A4 height in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Create PDF
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          });

          let heightLeft = imgHeight;
          let position = 0;

          // Add image to PDF (handle multiple pages if needed)
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          // Convert to blob
          const pdfBlob = pdf.output('blob');

          // Clean up
          document.body.removeChild(container);

          resolve(pdfBlob);
        } catch (error) {
          document.body.removeChild(container);
          reject(error);
        }
      }, 500); // Wait for rendering
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Download a voucher PDF
 */
export async function downloadVoucherPDF(
  voucherData: Voucher,
  options: VoucherGenerationOptions = {},
  config?: VoucherTemplateConfig
): Promise<void> {
  const blob = await generateVoucherPDF(voucherData, options, config);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `voucher-${voucherData.type}-${voucherData.voucherNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate multiple vouchers at once
 */
export async function generateMultipleVouchersPDF(
  vouchers: Voucher[],
  options: VoucherGenerationOptions = {},
  config?: VoucherTemplateConfig
): Promise<Blob[]> {
  const promises = vouchers.map(voucher => generateVoucherPDF(voucher, options, config));
  return Promise.all(promises);
}

/**
 * Download multiple vouchers as separate PDFs
 */
export async function downloadMultipleVouchers(
  vouchers: Voucher[],
  options: VoucherGenerationOptions = {},
  config?: VoucherTemplateConfig
): Promise<void> {
  for (const voucher of vouchers) {
    await downloadVoucherPDF(voucher, options, config);
    // Small delay between downloads to avoid browser blocking
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

/**
 * Preview voucher HTML in a new window
 */
export function previewVoucherHTML(voucherData: Voucher, config?: VoucherTemplateConfig): void {
  const html = getVoucherTemplate(voucherData, config);
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(html);
    newWindow.document.close();
  }
}

/**
 * Get voucher as base64 encoded string
 */
export async function getVoucherAsBase64(
  voucherData: Voucher,
  options: VoucherGenerationOptions = {},
  config?: VoucherTemplateConfig
): Promise<string> {
  const blob = await generateVoucherPDF(voucherData, options, config);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]); // Remove data:application/pdf;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

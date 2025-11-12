import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ExportOptions, ExportColumn } from '@/types/reports';

/**
 * Export data to PDF file using jsPDF + autoTable
 */
export const exportToPDF = (options: ExportOptions): void => {
  const { filename, data, columns, title, summary } = options;

  // Create new PDF document
  const doc = new jsPDF({
    orientation: columns.length > 6 ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let yPosition = 20;

  // Add company header (optional - can add logo here)
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Tour Operations CRM', 15, yPosition);
  yPosition += 10;

  // Add title
  if (title) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 15, yPosition);
    yPosition += 10;
  }

  // Add generation date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString('tr-TR')}`, 15, yPosition);
  yPosition += 10;

  // Add summary if provided
  if (summary) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 15, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    Object.entries(summary).forEach(([key, value]) => {
      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const formattedValue = formatValue(value, 'text');
      doc.text(`${formattedKey}: ${formattedValue}`, 20, yPosition);
      yPosition += 5;
    });

    yPosition += 5;
  }

  // Prepare table headers
  const headers = columns.map(col => col.header);

  // Prepare table data
  const tableData = data.map(row => {
    return columns.map(col => {
      const value = row[col.key];
      return formatValue(value, col.format || 'text');
    });
  });

  // Add table using autoTable
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: yPosition,
    theme: 'striped',
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [68, 114, 196], // Blue header
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: columns.reduce((acc, col, index) => {
      acc[index] = {
        halign:
          col.format === 'currency' || col.format === 'number' || col.format === 'percentage'
            ? 'right'
            : 'left',
      };
      return acc;
    }, {} as any),
    didDrawPage: data => {
      // Add footer with page numbers
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    },
  });

  // Generate file name with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `${filename}_${timestamp}.pdf`;

  // Save PDF
  doc.save(fileName);
};

/**
 * Format value based on format type
 */
const formatValue = (value: any, format: string): string => {
  if (value === null || value === undefined) return '';

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(typeof value === 'number' ? value : parseFloat(value || '0'));

    case 'number':
      return new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(typeof value === 'number' ? value : parseFloat(value || '0'));

    case 'percentage':
      const numValue = typeof value === 'number' ? value : parseFloat(value || '0');
      return `${numValue.toFixed(1)}%`;

    case 'date':
      return value ? new Date(value).toLocaleDateString('tr-TR') : '';

    default:
      return String(value);
  }
};

/**
 * Export chart data to PDF
 */
export const exportChartToPDF = (
  filename: string,
  chartElement: HTMLElement,
  title: string,
  summary?: Record<string, any>
): void => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  let yPosition = 20;

  // Add header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Tour Operations CRM', 15, yPosition);
  yPosition += 10;

  // Add title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 15, yPosition);
  yPosition += 10;

  // Add date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString('tr-TR')}`, 15, yPosition);
  yPosition += 10;

  // Add summary if provided
  if (summary) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 15, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    Object.entries(summary).forEach(([key, value]) => {
      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      doc.text(`${formattedKey}: ${value}`, 20, yPosition);
      yPosition += 5;
    });
  }

  // Note: To capture chart as image, you would need html2canvas
  // For now, we'll just add a note
  doc.setFontSize(10);
  doc.text('Chart visualization included in the report', 15, yPosition + 10);

  // Generate file name with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `${filename}_chart_${timestamp}.pdf`;

  // Save PDF
  doc.save(fileName);
};

/**
 * Create PDF with multiple sections
 */
export const exportMultiSectionPDF = (
  filename: string,
  sections: Array<{
    title: string;
    data: any[];
    columns: ExportColumn[];
    summary?: Record<string, any>;
  }>
): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let yPosition = 20;

  // Add main header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Tour Operations CRM', 15, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString('tr-TR')}`, 15, yPosition);
  yPosition += 10;

  // Add each section
  sections.forEach((section, index) => {
    if (index > 0) {
      doc.addPage();
      yPosition = 20;
    }

    // Section title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, 15, yPosition);
    yPosition += 10;

    // Section summary
    if (section.summary) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      Object.entries(section.summary).forEach(([key, value]) => {
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        doc.text(`${formattedKey}: ${value}`, 20, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
    }

    // Section table
    const headers = section.columns.map(col => col.header);
    const tableData = section.data.map(row => {
      return section.columns.map(col => {
        const value = row[col.key];
        return formatValue(value, col.format || 'text');
      });
    });

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: yPosition,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [68, 114, 196],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      didDrawPage: data => {
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  });

  // Generate file name with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `${filename}_${timestamp}.pdf`;

  // Save PDF
  doc.save(fileName);
};

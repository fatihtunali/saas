import * as XLSX from 'xlsx';
import type { ExportOptions, ExportColumn } from '@/types/reports';

/**
 * Export data to Excel file using SheetJS (xlsx library)
 */
export const exportToExcel = (options: ExportOptions): void => {
  const { filename, data, columns, title, summary } = options;

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Prepare headers
  const headers = columns.map(col => col.header);

  // Prepare data rows
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col.key];

      // Format based on column format
      if (value === null || value === undefined) return '';

      switch (col.format) {
        case 'currency':
          return typeof value === 'number' ? value : parseFloat(value || '0');
        case 'number':
          return typeof value === 'number' ? value : parseFloat(value || '0');
        case 'percentage':
          return typeof value === 'number' ? value / 100 : parseFloat(value || '0') / 100;
        case 'date':
          return value ? new Date(value).toLocaleDateString('tr-TR') : '';
        default:
          return value;
      }
    });
  });

  // Create worksheet data
  let worksheetData: any[][] = [];

  // Add title if provided
  if (title) {
    worksheetData.push([title]);
    worksheetData.push([]); // Empty row
  }

  // Add summary if provided
  if (summary) {
    worksheetData.push(['Summary']);
    Object.entries(summary).forEach(([key, value]) => {
      worksheetData.push([key, value]);
    });
    worksheetData.push([]); // Empty row
  }

  // Add headers
  worksheetData.push(headers);

  // Add data rows
  worksheetData = [...worksheetData, ...rows];

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Auto-size columns
  const columnWidths = columns.map((col, index) => {
    const headerLength = col.header.length;
    const maxDataLength = Math.max(
      ...rows.map(row => {
        const cellValue = row[index];
        return cellValue ? String(cellValue).length : 0;
      })
    );
    const width = Math.max(headerLength, maxDataLength, col.width || 10);
    return { wch: Math.min(width + 2, 50) }; // Cap at 50 characters
  });

  worksheet['!cols'] = columnWidths;

  // Apply formatting to cells
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

  // Style header row
  const headerRowIndex = title
    ? summary
      ? Object.keys(summary).length + 3
      : 2
    : summary
      ? Object.keys(summary).length + 1
      : 0;
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
    if (!worksheet[cellAddress]) continue;

    worksheet[cellAddress].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '4472C4' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }

  // Format data cells based on column format
  for (let row = headerRowIndex + 1; row <= range.e.r; row++) {
    columns.forEach((col, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: colIndex });
      if (!worksheet[cellAddress]) return;

      switch (col.format) {
        case 'currency':
          worksheet[cellAddress].z = '#,##0.00';
          worksheet[cellAddress].t = 'n';
          break;
        case 'number':
          worksheet[cellAddress].z = '#,##0';
          worksheet[cellAddress].t = 'n';
          break;
        case 'percentage':
          worksheet[cellAddress].z = '0.0%';
          worksheet[cellAddress].t = 'n';
          break;
        case 'date':
          worksheet[cellAddress].z = 'dd/mm/yyyy';
          break;
      }
    });
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

  // Generate file name with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `${filename}_${timestamp}.xlsx`;

  // Write file
  XLSX.writeFile(workbook, fileName);
};

/**
 * Export multiple sheets to Excel
 */
export const exportMultipleSheetsToExcel = (
  filename: string,
  sheets: Array<{
    name: string;
    data: any[];
    columns: ExportColumn[];
    title?: string;
    summary?: Record<string, any>;
  }>
): void => {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(sheet => {
    const { name, data, columns, title, summary } = sheet;

    // Prepare headers
    const headers = columns.map(col => col.header);

    // Prepare data rows
    const rows = data.map(row => {
      return columns.map(col => {
        const value = row[col.key];
        if (value === null || value === undefined) return '';

        switch (col.format) {
          case 'currency':
          case 'number':
            return typeof value === 'number' ? value : parseFloat(value || '0');
          case 'percentage':
            return typeof value === 'number' ? value / 100 : parseFloat(value || '0') / 100;
          case 'date':
            return value ? new Date(value).toLocaleDateString('tr-TR') : '';
          default:
            return value;
        }
      });
    });

    // Create worksheet data
    let worksheetData: any[][] = [];

    if (title) {
      worksheetData.push([title]);
      worksheetData.push([]);
    }

    if (summary) {
      worksheetData.push(['Summary']);
      Object.entries(summary).forEach(([key, value]) => {
        worksheetData.push([key, value]);
      });
      worksheetData.push([]);
    }

    worksheetData.push(headers);
    worksheetData = [...worksheetData, ...rows];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Auto-size columns
    const columnWidths = columns.map((col, index) => {
      const headerLength = col.header.length;
      const maxDataLength = Math.max(
        ...rows.map(row => {
          const cellValue = row[index];
          return cellValue ? String(cellValue).length : 0;
        })
      );
      const width = Math.max(headerLength, maxDataLength, col.width || 10);
      return { wch: Math.min(width + 2, 50) };
    });

    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, name.substring(0, 31)); // Excel sheet name limit
  });

  // Generate file name with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `${filename}_${timestamp}.xlsx`;

  // Write file
  XLSX.writeFile(workbook, fileName);
};

/**
 * Convert data to CSV format
 */
export const exportToCSV = (filename: string, data: any[], columns: ExportColumn[]): void => {
  // Prepare headers
  const headers = columns.map(col => col.header);

  // Prepare data rows
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col.key];
      if (value === null || value === undefined) return '';

      // Escape commas and quotes in CSV
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');

  // Create blob and download
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `${filename}_${timestamp}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export interface ReportTableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  format?: 'currency' | 'date' | 'number' | 'percentage' | 'text';
  align?: 'left' | 'center' | 'right';
}

interface ReportTableProps {
  title?: string;
  data: any[];
  columns: ReportTableColumn[];
  showTotal?: boolean;
  totalRow?: Record<string, any>;
  emptyMessage?: string;
}

export const ReportTable: React.FC<ReportTableProps> = ({
  title,
  data,
  columns,
  showTotal = false,
  totalRow,
  emptyMessage = 'No data available',
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const formatValue = (value: any, format?: string): string => {
    if (value === null || value === undefined) return '-';

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
        return `${(typeof value === 'number' ? value : parseFloat(value || '0')).toFixed(1)}%`;

      case 'date':
        return value ? new Date(value).toLocaleDateString('tr-TR') : '-';

      default:
        return String(value);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr, 'tr-TR');
      }
      return bStr.localeCompare(aStr, 'tr-TR');
    });
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  const sortedData = getSortedData();

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(column => (
                  <TableHead
                    key={column.key}
                    className={
                      column.align === 'right'
                        ? 'text-right'
                        : column.align === 'center'
                          ? 'text-center'
                          : ''
                    }
                  >
                    {column.sortable !== false ? (
                      <Button
                        variant="ghost"
                        onClick={() => handleSort(column.key)}
                        className="h-auto p-0 hover:bg-transparent font-medium"
                      >
                        {column.header}
                        {getSortIcon(column.key)}
                      </Button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {sortedData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map(column => (
                        <TableCell
                          key={column.key}
                          className={
                            column.align === 'right'
                              ? 'text-right'
                              : column.align === 'center'
                                ? 'text-center'
                                : ''
                          }
                        >
                          {formatValue(row[column.key], column.format)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {showTotal && totalRow && (
                    <TableRow className="font-bold bg-muted/50">
                      {columns.map((column, index) => (
                        <TableCell
                          key={column.key}
                          className={
                            column.align === 'right'
                              ? 'text-right'
                              : column.align === 'center'
                                ? 'text-center'
                                : ''
                          }
                        >
                          {index === 0 && !totalRow[column.key]
                            ? 'Total'
                            : formatValue(totalRow[column.key], column.format)}
                        </TableCell>
                      ))}
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

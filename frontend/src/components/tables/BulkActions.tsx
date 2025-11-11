'use client';

import * as React from 'react';
import { Trash2, Download, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';

/**
 * BulkActions Component
 *
 * Bulk action controls for selected table rows.
 *
 * Features:
 * - Shows selected count
 * - Action buttons (delete, export, etc.)
 * - Deselect all button
 * - Appears when rows are selected
 *
 * @example
 * ```tsx
 * <BulkActions
 *   selectedCount={5}
 *   onDelete={handleDelete}
 *   onExport={handleExport}
 *   onDeselectAll={handleDeselectAll}
 * />
 * ```
 */

export interface BulkActionsProps {
  /** Number of selected items */
  selectedCount: number;
  /** Delete action handler */
  onDelete?: () => void;
  /** Export action handler */
  onExport?: () => void;
  /** Email action handler */
  onEmail?: () => void;
  /** Deselect all handler */
  onDeselectAll?: () => void;
  /** Custom actions */
  customActions?: React.ReactNode;
  /** Custom class name */
  className?: string;
}

export function BulkActions({
  selectedCount,
  onDelete,
  onExport,
  onEmail,
  onDeselectAll,
  customActions,
  className,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className={`flex items-center gap-2 p-2 bg-muted/50 rounded-lg ${className || ''}`}>
      <div className="flex-1 text-sm font-medium">
        {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
      </div>

      <div className="flex items-center gap-2">
        {customActions}

        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}

        {onEmail && (
          <Button variant="outline" size="sm" onClick={onEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        )}

        {onDelete && (
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}

        {onDeselectAll && (
          <Button variant="ghost" size="sm" onClick={onDeselectAll}>
            Clear selection
          </Button>
        )}
      </div>
    </div>
  );
}

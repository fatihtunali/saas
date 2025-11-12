'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PaymentStatusBadgeProps {
  status: string;
  type?: 'client' | 'supplier' | 'refund' | 'commission';
}

const statusColorMap = {
  // Client Payment Statuses
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',

  // Supplier Payment Statuses
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',

  // Refund Statuses
  requested: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  approved: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  processed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

const statusLabelMap: Record<string, string> = {
  pending: 'Pending',
  completed: 'Completed',
  failed: 'Failed',
  refunded: 'Refunded',
  scheduled: 'Scheduled',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
  requested: 'Requested',
  approved: 'Approved',
  rejected: 'Rejected',
  processed: 'Processed',
};

export function PaymentStatusBadge({ status, type = 'client' }: PaymentStatusBadgeProps) {
  const colorClass =
    statusColorMap[status as keyof typeof statusColorMap] || statusColorMap.pending;
  const label = statusLabelMap[status] || status;

  return (
    <Badge className={cn('font-medium', colorClass)} variant="outline">
      {label}
    </Badge>
  );
}

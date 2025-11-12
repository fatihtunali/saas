'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, DollarSign, Edit, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRecentActivity } from '@/lib/hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type {
  ActivityItem,
  BookingActivityItem,
  PaymentActivityItem,
  ModificationActivityItem,
} from '@/types/dashboard';

/**
 * Type guard to check if activity is a booking activity
 */
function isBookingActivity(item: ActivityItem): item is BookingActivityItem {
  return item.type === 'bookings';
}

/**
 * Type guard to check if activity is a payment activity
 */
function isPaymentActivity(item: ActivityItem): item is PaymentActivityItem {
  return item.type === 'payments';
}

/**
 * Type guard to check if activity is a modification activity
 */
function isModificationActivity(item: ActivityItem): item is ModificationActivityItem {
  return item.type === 'modifications';
}

/**
 * Get badge variant based on status
 */
function getStatusBadgeVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === 'confirmed' || lowerStatus === 'completed' || lowerStatus === 'paid') {
    return 'default';
  }
  if (lowerStatus === 'pending') {
    return 'secondary';
  }
  if (lowerStatus === 'cancelled' || lowerStatus === 'failed') {
    return 'destructive';
  }
  return 'outline';
}

/**
 * ActivityItem component props
 */
interface ActivityItemProps {
  item: ActivityItem;
  onClick: () => void;
}

/**
 * Single activity item display component
 */
function ActivityItemDisplay({ item, onClick }: ActivityItemProps) {
  const icon = React.useMemo(() => {
    if (isBookingActivity(item)) {
      return <Calendar className="h-5 w-5 text-primary" />;
    }
    if (isPaymentActivity(item)) {
      return <DollarSign className="h-5 w-5 text-green-600" />;
    }
    if (isModificationActivity(item)) {
      return <Edit className="h-5 w-5 text-blue-600" />;
    }
    return null;
  }, [item]);

  const primaryText = React.useMemo(() => {
    if (isBookingActivity(item)) {
      const statusMap = {
        confirmed: 'Booking confirmed',
        pending: 'New booking created',
        cancelled: 'Booking cancelled',
        completed: 'Booking completed',
      };
      return statusMap[item.status] || 'Booking updated';
    }
    if (isPaymentActivity(item)) {
      return item.status === 'completed' ? 'Payment received' : 'Payment processed';
    }
    if (isModificationActivity(item)) {
      return item.changeType;
    }
    return 'Activity';
  }, [item]);

  const secondaryText = React.useMemo(() => {
    if (isBookingActivity(item)) {
      return `${item.customerName} • ${item.tourName}`;
    }
    if (isPaymentActivity(item)) {
      return `${item.customerName} • $${item.amount.toLocaleString()} • ${item.method}`;
    }
    if (isModificationActivity(item)) {
      return `${item.customerName} • ${item.description}`;
    }
    return '';
  }, [item]);

  const badge = React.useMemo(() => {
    if (isBookingActivity(item)) {
      return (
        <Badge variant={getStatusBadgeVariant(item.status)} className="ml-2 capitalize">
          {item.status}
        </Badge>
      );
    }
    if (isPaymentActivity(item)) {
      return (
        <Badge variant={getStatusBadgeVariant(item.status)} className="ml-2 capitalize">
          {item.status}
        </Badge>
      );
    }
    return null;
  }, [item]);

  const timestamp = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(item.timestamp), { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  }, [item.timestamp]);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-start gap-4 pb-4 border-b last:border-0 hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors text-left"
    >
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center">
          <p className="text-sm font-medium">{primaryText}</p>
          {badge}
        </div>
        <p className="text-xs text-muted-foreground">{secondaryText}</p>
        <p className="text-xs text-muted-foreground">{timestamp}</p>
      </div>
    </button>
  );
}

/**
 * Loading skeleton for activity items
 */
function ActivityLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <AlertCircle className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * Error state component with retry
 */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="text-sm text-primary hover:underline font-medium"
      >
        Try again
      </button>
    </div>
  );
}

/**
 * Activity tab content component
 */
interface ActivityTabContentProps {
  type: 'bookings' | 'payments' | 'modifications';
  limit?: number;
  onViewAll: () => void;
}

function ActivityTabContent({ type, limit = 10, onViewAll }: ActivityTabContentProps) {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useRecentActivity(type, limit);

  const handleItemClick = React.useCallback(
    (item: ActivityItem) => {
      if (isBookingActivity(item)) {
        router.push(`/dashboard/bookings/${item.bookingId}`);
      } else if (isPaymentActivity(item)) {
        router.push(`/dashboard/payments/${item.paymentId}`);
      } else if (isModificationActivity(item)) {
        router.push(`/dashboard/bookings/${item.bookingId}`);
      }
    },
    [router]
  );

  if (isLoading) {
    return <ActivityLoadingSkeleton />;
  }

  if (error) {
    return (
      <ErrorState message={error.message || 'Failed to load activity'} onRetry={() => refetch()} />
    );
  }

  if (!data || data.items.length === 0) {
    return <EmptyState message="No recent activity" />;
  }

  return (
    <div className="space-y-4">
      <div className="max-h-[400px] overflow-y-auto space-y-2">
        {data.items.map(item => (
          <ActivityItemDisplay key={item.id} item={item} onClick={() => handleItemClick(item)} />
        ))}
      </div>
      <div className="pt-4 border-t">
        <button
          type="button"
          onClick={onViewAll}
          className="text-sm text-primary hover:underline font-medium"
        >
          View all {type}
        </button>
      </div>
    </div>
  );
}

/**
 * RecentActivity component props
 */
export interface RecentActivityProps {
  /**
   * Number of items to display per tab
   * @default 10
   */
  limit?: number;
  /**
   * Default active tab
   * @default 'bookings'
   */
  defaultTab?: 'bookings' | 'payments' | 'modifications';
}

/**
 * RecentActivity Component
 *
 * Displays recent activity across bookings, payments, and modifications
 * in a tabbed interface with real-time data from the dashboard API.
 *
 * Features:
 * - Three tabs: Bookings, Payments, Modifications
 * - Real-time data updates using React Query
 * - Loading skeletons for better UX
 * - Error handling with retry capability
 * - Empty states for no activity
 * - Click to navigate to detail pages
 * - Relative timestamps using date-fns
 * - Status badges for activity items
 * - Scrollable container with max height
 *
 * @example
 * ```tsx
 * <RecentActivity limit={10} defaultTab="bookings" />
 * ```
 */
export function RecentActivity({ limit = 10, defaultTab = 'bookings' }: RecentActivityProps) {
  const router = useRouter();

  const handleViewAll = React.useCallback(
    (type: string) => {
      if (type === 'bookings') {
        router.push('/dashboard/bookings');
      } else if (type === 'payments') {
        router.push('/dashboard/payments');
      } else {
        router.push('/dashboard/bookings');
      }
    },
    [router]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="modifications">Modifications</TabsTrigger>
          </TabsList>
          <TabsContent value="bookings">
            <ActivityTabContent
              type="bookings"
              limit={limit}
              onViewAll={() => handleViewAll('bookings')}
            />
          </TabsContent>
          <TabsContent value="payments">
            <ActivityTabContent
              type="payments"
              limit={limit}
              onViewAll={() => handleViewAll('payments')}
            />
          </TabsContent>
          <TabsContent value="modifications">
            <ActivityTabContent
              type="modifications"
              limit={limit}
              onViewAll={() => handleViewAll('modifications')}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { CalendarPlus, UserPlus, DollarSign, FileText, BarChart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Quick Actions Component
 *
 * Provides quick access to common actions from the dashboard sidebar.
 * Features 5 action buttons for navigation to key operations:
 * - New Booking
 * - New Client
 * - Record Payment
 * - New Quotation
 * - View Reports
 *
 * @example
 * ```tsx
 * <QuickActions />
 * ```
 */
export function QuickActions() {
  const router = useRouter();

  /**
   * Action button configuration
   */
  const actions = [
    {
      icon: CalendarPlus,
      label: 'New Booking',
      variant: 'default' as const,
      onClick: () => router.push('/dashboard/bookings/new'),
    },
    {
      icon: UserPlus,
      label: 'New Client',
      variant: 'outline' as const,
      onClick: () => router.push('/dashboard/clients/new'),
    },
    {
      icon: DollarSign,
      label: 'Record Payment',
      variant: 'outline' as const,
      onClick: () => router.push('/dashboard/payments/new'),
    },
    {
      icon: FileText,
      label: 'New Quotation',
      variant: 'outline' as const,
      onClick: () => router.push('/dashboard/quotations/new'),
    },
    {
      icon: BarChart,
      label: 'View Reports',
      variant: 'outline' as const,
      onClick: () => router.push('/dashboard/reports'),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {actions.map(action => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                type="button"
                variant={action.variant}
                className="w-full justify-start"
                onClick={action.onClick}
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

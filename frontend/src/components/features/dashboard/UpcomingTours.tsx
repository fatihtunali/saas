'use client';

import { useRouter } from 'next/navigation';
import { format, differenceInDays } from 'date-fns';
import { MapPin, Calendar } from 'lucide-react';
import { useUpcomingTours } from '@/lib/hooks/useDashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Upcoming Tours Component
 *
 * Displays the next 5 upcoming tours with booking information.
 * Shows tour destination, start date, passenger count, countdown, and status.
 * Includes loading states, error handling, and empty states.
 *
 * @example
 * ```tsx
 * <UpcomingTours />
 * ```
 */
export function UpcomingTours() {
  const router = useRouter();
  const { data, isLoading, error } = useUpcomingTours(5);

  /**
   * Calculate days until tour starts
   */
  const getDaysUntilStart = (startDate: string): number => {
    const start = new Date(startDate);
    const today = new Date();
    return differenceInDays(start, today);
  };

  /**
   * Format countdown badge text
   */
  const getCountdownText = (days: number): string => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 0) return 'In Progress';
    return `In ${days} days`;
  };

  /**
   * Get status badge variant based on tour status
   */
  const getStatusVariant = (
    status: 'confirmed' | 'pending' | 'full'
  ): 'default' | 'secondary' | 'outline' => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'full':
        return 'default';
      default:
        return 'outline';
    }
  };

  /**
   * Get status display text
   */
  const getStatusText = (status: 'confirmed' | 'pending' | 'full'): string => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'full':
        return 'Full';
      default:
        return status;
    }
  };

  /**
   * Navigate to booking details
   */
  const handleTourClick = (tourId: number) => {
    router.push(`/dashboard/bookings/${tourId}`);
  };

  /**
   * Loading skeleton
   */
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="flex gap-2">
                  <div className="h-5 bg-muted rounded w-16"></div>
                  <div className="h-5 bg-muted rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  /**
   * Error state
   */
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-sm text-destructive">Failed to load upcoming tours</p>
            <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  /**
   * Empty state
   */
  if (!data || data.tours.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <MapPin className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming tours</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  /**
   * Tours list
   */
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Tours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {data.tours.map(tour => {
            const daysUntil = getDaysUntilStart(tour.startDate);
            const countdownText = getCountdownText(daysUntil);
            const formattedDate = format(new Date(tour.startDate), 'MMM dd, yyyy');

            return (
              <div
                key={tour.id}
                className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleTourClick(tour.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleTourClick(tour.id);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    {/* Destination */}
                    <p className="text-sm font-semibold text-foreground leading-tight">
                      {tour.destination}
                    </p>

                    {/* Date and passengers */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span>
                        {tour.bookingsCount} passenger{tour.bookingsCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Countdown and status badges */}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          daysUntil <= 3 && daysUntil >= 0 && 'border-orange-500 text-orange-700',
                          daysUntil < 0 && 'border-blue-500 text-blue-700'
                        )}
                      >
                        {countdownText}
                      </Badge>
                      <Badge
                        variant={getStatusVariant(tour.status)}
                        className={cn(
                          'text-xs',
                          tour.status === 'confirmed' && 'bg-green-500 hover:bg-green-600',
                          tour.status === 'pending' && 'bg-yellow-500 hover:bg-yellow-600'
                        )}
                      >
                        {getStatusText(tour.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

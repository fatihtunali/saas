'use client';

import * as React from 'react';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * ListCard Component
 *
 * Card component for displaying a list of items.
 *
 * Features:
 * - List of items with avatar/icon
 * - Metadata display
 * - Click/hover states
 * - Dividers between items
 *
 * @example
 * ```tsx
 * <ListCard
 *   title="Recent Bookings"
 *   items={[
 *     {
 *       id: '1',
 *       title: 'Booking #12345',
 *       subtitle: 'John Doe',
 *       metadata: '2 days ago',
 *       onClick: () => router.push('/bookings/1')
 *     }
 *   ]}
 * />
 * ```
 */

export interface ListCardItem {
  id: string;
  title: string;
  subtitle?: string;
  metadata?: string;
  avatar?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export interface ListCardProps {
  /** Card title */
  title?: string;
  /** List items */
  items: ListCardItem[];
  /** Show dividers between items */
  showDividers?: boolean;
  /** Show chevron on items */
  showChevron?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Custom class name */
  className?: string;
}

export function ListCard({
  title,
  items,
  showDividers = true,
  showChevron = true,
  emptyMessage = 'No items to display',
  className,
}: ListCardProps) {
  return (
    <Card className={cn('', className)}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? '' : 'pt-6'}>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>
        ) : (
          <div className="space-y-0">
            {items.map((item, index) => (
              <div key={item.id}>
                <div
                  className={cn(
                    'flex items-center gap-3 py-3',
                    item.onClick &&
                      'cursor-pointer hover:bg-accent -mx-3 px-3 rounded-md transition-colors'
                  )}
                  onClick={item.onClick}
                >
                  {item.avatar && (
                    <img
                      src={item.avatar}
                      alt={item.title}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  )}
                  {item.icon && (
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-muted">
                      {item.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                    )}
                  </div>
                  {item.metadata && (
                    <span className="text-xs text-muted-foreground">{item.metadata}</span>
                  )}
                  {showChevron && item.onClick && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                {showDividers && index < items.length - 1 && <div className="border-b" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

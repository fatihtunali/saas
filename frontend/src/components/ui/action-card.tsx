'use client';

import * as React from 'react';
import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * ActionCard Component
 *
 * Call-to-action card for prompting user actions.
 *
 * Features:
 * - Icon, title, description
 * - Primary action button
 * - Used for empty states, onboarding
 * - Hover effects
 *
 * @example
 * ```tsx
 * <ActionCard
 *   icon={Plus}
 *   title="Create Your First Booking"
 *   description="Get started by creating a new booking for your clients"
 *   actionLabel="Create Booking"
 *   onAction={() => router.push('/bookings/new')}
 * />
 * ```
 */

export interface ActionCardProps {
  /** Icon component */
  icon: LucideIcon;
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Action button label */
  actionLabel: string;
  /** Action button handler */
  onAction: () => void;
  /** Action button variant */
  actionVariant?: 'default' | 'outline' | 'secondary';
  /** Custom class name */
  className?: string;
}

export function ActionCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = 'default',
  className,
}: ActionCardProps) {
  return (
    <Card
      className={cn(
        'border-dashed hover:border-solid hover:border-primary transition-colors',
        className
      )}
    >
      <CardContent className="flex flex-col items-center justify-center text-center p-8 space-y-4">
        <div className="rounded-full bg-primary/10 p-4">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-md">{description}</p>
        </div>
        <Button variant={actionVariant} onClick={onAction}>
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

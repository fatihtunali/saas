'use client';

import * as React from 'react';
import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * InfoCard Component
 *
 * Information display card with optional image, icon, and actions.
 *
 * Features:
 * - Title, description, metadata
 * - Optional image or icon
 * - Action buttons
 * - Hover effects
 *
 * @example
 * ```tsx
 * <InfoCard
 *   title="Client Name"
 *   description="Client details and information"
 *   metadata="Last contact: 2 days ago"
 *   icon={User}
 *   actions={[
 *     { label: 'View', onClick: handleView },
 *     { label: 'Edit', onClick: handleEdit }
 *   ]}
 * />
 * ```
 */

export interface InfoCardProps {
  /** Card title */
  title: string;
  /** Card description */
  description?: string;
  /** Additional metadata */
  metadata?: string;
  /** Icon component */
  icon?: LucideIcon;
  /** Image URL */
  image?: string;
  /** Action buttons */
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  }>;
  /** Click handler for entire card */
  onClick?: () => void;
  /** Custom class name */
  className?: string;
}

export function InfoCard({
  title,
  description,
  metadata,
  icon: Icon,
  image,
  actions,
  onClick,
  className,
}: InfoCardProps) {
  return (
    <Card
      className={cn(onClick && 'cursor-pointer hover:bg-accent transition-colors', className)}
      onClick={onClick}
    >
      {image && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img src={image} alt={title} className="h-full w-full object-cover" />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="rounded-full bg-primary/10 p-2">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
          <div className="flex-1 space-y-1">
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <CardDescription className="text-sm">{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      {metadata && (
        <CardContent className="pb-3">
          <p className="text-xs text-muted-foreground">{metadata}</p>
        </CardContent>
      )}
      {actions && actions.length > 0 && (
        <CardFooter className="flex gap-2 pt-3 border-t">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={e => {
                e.stopPropagation();
                action.onClick();
              }}
            >
              {action.label}
            </Button>
          ))}
        </CardFooter>
      )}
    </Card>
  );
}

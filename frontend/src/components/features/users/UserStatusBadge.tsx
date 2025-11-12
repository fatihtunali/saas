/**
 * User Status Badge Component
 * Phase 9: User Management & Permissions
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle } from 'lucide-react';

interface UserStatusBadgeProps {
  isActive: boolean;
  className?: string;
  showIcon?: boolean;
}

export function UserStatusBadge({ isActive, className, showIcon = false }: UserStatusBadgeProps) {
  if (isActive) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'text-xs font-medium bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200',
          className
        )}
      >
        {showIcon && <CheckCircle className="w-3 h-3 mr-1" />}
        Active
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-medium bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200',
        className
      )}
    >
      {showIcon && <XCircle className="w-3 h-3 mr-1" />}
      Inactive
    </Badge>
  );
}

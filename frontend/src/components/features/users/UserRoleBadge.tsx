/**
 * User Role Badge Component
 * Phase 9: User Management & Permissions
 */

import { Badge } from '@/components/ui/badge';
import { UserRole, getRoleConfig } from '@/types/users';
import { cn } from '@/lib/utils';

interface UserRoleBadgeProps {
  role: UserRole;
  className?: string;
}

const colorClasses = {
  purple: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200',
};

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const config = getRoleConfig(role);

  if (!config) {
    return (
      <Badge variant="outline" className={cn('text-xs', className)}>
        Unknown
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-medium', colorClasses[config.color], className)}
    >
      {config.label}
    </Badge>
  );
}

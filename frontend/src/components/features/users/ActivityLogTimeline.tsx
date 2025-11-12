/**
 * Activity Log Timeline Component
 * Phase 9: User Management & Permissions
 */

'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ActivityLog } from '@/types/users';
import { formatDistanceToNow, format } from 'date-fns';
import {
  LogIn,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Key,
  ShieldAlert,
  UserCheck,
  UserX,
  FileText,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityLogTimelineProps {
  activities: ActivityLog[];
  className?: string;
  maxHeight?: string;
  showDetails?: boolean;
}

const actionIcons = {
  login: LogIn,
  logout: LogOut,
  create: Plus,
  update: Edit,
  delete: Trash2,
  view: Eye,
  export: Download,
  password_change: Key,
  password_reset: ShieldAlert,
  status_change: UserCheck,
  role_change: UserX,
};

const actionColors = {
  login: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  logout: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20',
  create: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  update: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
  delete: 'text-red-600 bg-red-100 dark:bg-red-900/20',
  view: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
  export: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20',
  password_change: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
  password_reset: 'text-red-600 bg-red-100 dark:bg-red-900/20',
  status_change: 'text-teal-600 bg-teal-100 dark:bg-teal-900/20',
  role_change: 'text-pink-600 bg-pink-100 dark:bg-pink-900/20',
};

const actionLabels = {
  login: 'Logged In',
  logout: 'Logged Out',
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  view: 'Viewed',
  export: 'Exported',
  password_change: 'Changed Password',
  password_reset: 'Reset Password',
  status_change: 'Changed Status',
  role_change: 'Changed Role',
};

export function ActivityLogTimeline({
  activities,
  className,
  maxHeight = '600px',
  showDetails = false,
}: ActivityLogTimelineProps) {
  if (activities.length === 0) {
    return (
      <Card className={cn('p-8 text-center', className)}>
        <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No activity recorded yet</p>
      </Card>
    );
  }

  return (
    <ScrollArea className={cn('pr-4', className)} style={{ maxHeight }}>
      <div className="relative space-y-4">
        {/* Timeline Line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

        {activities.map((activity, index) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            isLast={index === activities.length - 1}
            showDetails={showDetails}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

interface ActivityItemProps {
  activity: ActivityLog;
  isLast: boolean;
  showDetails: boolean;
}

function ActivityItem({ activity, isLast, showDetails }: ActivityItemProps) {
  const Icon = actionIcons[activity.action as keyof typeof actionIcons] || FileText;
  const colorClass =
    actionColors[activity.action as keyof typeof actionColors] || 'text-gray-600 bg-gray-100';
  const actionLabel = actionLabels[activity.action as keyof typeof actionLabels] || activity.action;

  const timestamp = new Date(activity.created_at);
  const relativeTime = formatDistanceToNow(timestamp, { addSuffix: true });
  const absoluteTime = format(timestamp, 'MMM d, yyyy HH:mm:ss');

  return (
    <div className="relative flex gap-4 group">
      {/* Icon */}
      <div
        className={cn(
          'relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 border-background',
          colorClass
        )}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-1">
                {actionLabel}
                {activity.entity_type && (
                  <span className="text-muted-foreground font-normal">
                    {' '}
                    {activity.entity_type}
                    {activity.entity_id && ` #${activity.entity_id}`}
                  </span>
                )}
              </h4>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{activity.user_name}</span>
                <span>•</span>
                <Badge variant="outline" className="text-xs">
                  {activity.module}
                </Badge>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-muted-foreground" title={absoluteTime}>
                {relativeTime}
              </p>
            </div>
          </div>

          {/* Details */}
          {showDetails && activity.details && Object.keys(activity.details).length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-2">Details:</p>
              <div className="space-y-1">
                {Object.entries(activity.details).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2 text-xs">
                    <span className="text-muted-foreground font-medium min-w-[100px]">
                      {formatKey(key)}:
                    </span>
                    <span className="text-foreground">{formatValue(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          {showDetails && (activity.ip_address || activity.user_agent) && (
            <div className="mt-3 pt-3 border-t space-y-1">
              {activity.ip_address && (
                <p className="text-xs text-muted-foreground">IP: {activity.ip_address}</p>
              )}
              {activity.user_agent && (
                <p className="text-xs text-muted-foreground truncate" title={activity.user_agent}>
                  {formatUserAgent(activity.user_agent)}
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Helper functions
function formatKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function formatUserAgent(userAgent: string): string {
  // Simple user agent parsing
  if (userAgent.includes('Chrome')) return 'Chrome Browser';
  if (userAgent.includes('Firefox')) return 'Firefox Browser';
  if (userAgent.includes('Safari')) return 'Safari Browser';
  if (userAgent.includes('Edge')) return 'Edge Browser';
  return 'Unknown Browser';
}

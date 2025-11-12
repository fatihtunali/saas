/**
 * Permissions Display Component
 * Phase 9: User Management & Permissions
 */

'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { UserPermissions } from '@/types/users';
import { Check, X, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PermissionsDisplayProps {
  permissions: UserPermissions;
  className?: string;
  variant?: 'grid' | 'table';
}

const moduleLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  bookings: 'Bookings',
  services: 'Services',
  clients: 'Clients',
  payments: 'Payments',
  reports: 'Reports',
  operations: 'Operations',
  users: 'User Management',
  settings: 'Settings',
};

const actionLabels: Record<string, string> = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  export: 'Export',
};

export function PermissionsDisplay({
  permissions,
  className,
  variant = 'grid',
}: PermissionsDisplayProps) {
  if (!permissions || Object.keys(permissions).length === 0) {
    return (
      <Card className={cn('p-8 text-center', className)}>
        <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No permissions available</p>
      </Card>
    );
  }

  if (variant === 'table') {
    return <TableView permissions={permissions} className={className} />;
  }

  return <GridView permissions={permissions} className={className} />;
}

interface ViewProps {
  permissions: UserPermissions;
  className?: string;
}

function GridView({ permissions, className }: ViewProps) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {Object.entries(permissions).map(([module, perms]) => (
        <ModuleCard key={module} module={module} permissions={perms} />
      ))}
    </div>
  );
}

function TableView({ permissions, className }: ViewProps) {
  const actions = ['view', 'create', 'edit', 'delete', 'export'];

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4 font-medium">Module</th>
              {actions.map(action => (
                <th key={action} className="text-center p-4 font-medium">
                  {actionLabels[action]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(permissions).map(([module, perms]) => (
              <tr key={module} className="border-b last:border-0 hover:bg-muted/50">
                <td className="p-4 font-medium">{moduleLabels[module] || module}</td>
                {actions.map(action => (
                  <td key={action} className="text-center p-4">
                    <PermissionIcon allowed={perms[action as keyof typeof perms]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

interface ModuleCardProps {
  module: string;
  permissions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    export: boolean;
  };
}

function ModuleCard({ module, permissions }: ModuleCardProps) {
  const allowedActions = Object.entries(permissions)
    .filter(([_, allowed]) => allowed)
    .map(([action]) => action);

  const deniedActions = Object.entries(permissions)
    .filter(([_, allowed]) => !allowed)
    .map(([action]) => action);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="mb-3">
        <h3 className="font-semibold text-sm mb-1">{moduleLabels[module] || module}</h3>
        <Badge variant="outline" className="text-xs">
          {allowedActions.length} / {Object.keys(permissions).length} permissions
        </Badge>
      </div>

      <div className="space-y-2">
        {Object.entries(permissions).map(([action, allowed]) => (
          <div key={action} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{actionLabels[action] || action}</span>
            <PermissionIcon allowed={allowed} />
          </div>
        ))}
      </div>
    </Card>
  );
}

interface PermissionIconProps {
  allowed: boolean;
}

function PermissionIcon({ allowed }: PermissionIconProps) {
  if (allowed) {
    return (
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/20">
        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-900/20">
      <X className="w-4 h-4 text-gray-400" />
    </div>
  );
}

// Summary variant for compact display
export function PermissionsSummary({
  permissions,
  className,
}: {
  permissions: UserPermissions;
  className?: string;
}) {
  const totalModules = Object.keys(permissions).length;
  const totalPermissions = Object.values(permissions).reduce(
    (sum, perms) => sum + Object.keys(perms).length,
    0
  );
  const allowedPermissions = Object.values(permissions).reduce(
    (sum, perms) => sum + Object.values(perms).filter(Boolean).length,
    0
  );

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">
            {allowedPermissions} / {totalPermissions}
          </p>
          <p className="text-sm text-muted-foreground">Permissions across {totalModules} modules</p>
        </div>
      </div>
    </Card>
  );
}

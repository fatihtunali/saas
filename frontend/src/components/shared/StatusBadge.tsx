import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

type Status = 'Active' | 'Inactive' | 'Pending' | 'Warning';

interface StatusBadgeProps {
  status: Status | string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<Status, { icon: React.ReactNode; variant: string; label: string }> = {
  Active: {
    icon: <CheckCircle2 className="h-3 w-3" />,
    variant: 'default',
    label: 'Active',
  },
  Inactive: {
    icon: <XCircle className="h-3 w-3" />,
    variant: 'secondary',
    label: 'Inactive',
  },
  Pending: {
    icon: <Clock className="h-3 w-3" />,
    variant: 'outline',
    label: 'Pending',
  },
  Warning: {
    icon: <AlertTriangle className="h-3 w-3" />,
    variant: 'destructive',
    label: 'Warning',
  },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status as Status] || statusConfig.Inactive;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <Badge className={`${sizeClasses[size]} flex items-center gap-1`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}

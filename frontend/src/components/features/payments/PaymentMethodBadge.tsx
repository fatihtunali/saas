'use client';

import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, Building2, FileText, HelpCircle } from 'lucide-react';

interface PaymentMethodBadgeProps {
  method: string;
  showIcon?: boolean;
}

const paymentMethodConfig = {
  cash: {
    label: 'Cash',
    icon: DollarSign,
    variant: 'default' as const,
  },
  credit_card: {
    label: 'Credit Card',
    icon: CreditCard,
    variant: 'secondary' as const,
  },
  bank_transfer: {
    label: 'Bank Transfer',
    icon: Building2,
    variant: 'outline' as const,
  },
  check: {
    label: 'Check',
    icon: FileText,
    variant: 'outline' as const,
  },
  other: {
    label: 'Other',
    icon: HelpCircle,
    variant: 'outline' as const,
  },
};

export function PaymentMethodBadge({ method, showIcon = true }: PaymentMethodBadgeProps) {
  const config =
    paymentMethodConfig[method as keyof typeof paymentMethodConfig] || paymentMethodConfig.other;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      {showIcon && <Icon className="h-3 w-3" />}
      <span>{config.label}</span>
    </Badge>
  );
}

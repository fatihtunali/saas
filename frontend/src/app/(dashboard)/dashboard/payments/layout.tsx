'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, TrendingUp, TrendingDown, FileText, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const paymentTabs = [
  {
    title: 'Bank Accounts',
    href: '/dashboard/payments/bank-accounts',
    icon: Building2,
  },
  {
    title: 'Receivables',
    href: '/dashboard/payments/receivables',
    icon: TrendingUp,
  },
  {
    title: 'Payables',
    href: '/dashboard/payments/payables',
    icon: TrendingDown,
  },
  {
    title: 'Refunds',
    href: '/dashboard/payments/refunds',
    icon: FileText,
  },
  {
    title: 'Commissions',
    href: '/dashboard/payments/commissions',
    icon: Percent,
  },
];

export default function PaymentsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname.startsWith('/dashboard/payments/bank-accounts'))
      return '/dashboard/payments/bank-accounts';
    if (pathname.startsWith('/dashboard/payments/receivables'))
      return '/dashboard/payments/receivables';
    if (pathname.startsWith('/dashboard/payments/payables')) return '/dashboard/payments/payables';
    if (pathname.startsWith('/dashboard/payments/refunds')) return '/dashboard/payments/refunds';
    if (pathname.startsWith('/dashboard/payments/commissions'))
      return '/dashboard/payments/commissions';
    return '/dashboard/payments';
  };

  const activeTab = getActiveTab();
  const isSubPage =
    pathname !== '/dashboard/payments' && !paymentTabs.some(tab => pathname === tab.href);

  // Don't show tabs on sub-pages (detail, edit, create)
  if (isSubPage) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-6">
      {/* Only show tabs on main module pages */}
      {pathname !== '/dashboard/payments' && (
        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            {paymentTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.href;

              return (
                <Link key={tab.href} href={tab.href}>
                  <TabsTrigger
                    value={tab.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2',
                      isActive &&
                        'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.title}</span>
                  </TabsTrigger>
                </Link>
              );
            })}
          </TabsList>
        </Tabs>
      )}

      {/* Main Content */}
      <div>{children}</div>
    </div>
  );
}

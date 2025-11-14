'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Percent,
  FileEdit,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Quotations',
    href: '/dashboard/quotations',
    icon: FileEdit,
  },
  {
    title: 'Bookings',
    href: '/dashboard/bookings',
    icon: Calendar,
  },
  {
    title: 'Clients',
    href: '/dashboard/clients',
    icon: Users,
  },
  {
    title: 'Services',
    href: '/dashboard/services',
    icon: Building2,
  },
  {
    title: 'Payments',
    href: '/dashboard/payments',
    icon: DollarSign,
    children: [
      { title: 'Dashboard', href: '/dashboard/payments', icon: LayoutDashboard },
      { title: 'Bank Accounts', href: '/dashboard/payments/bank-accounts', icon: Building2 },
      { title: 'Receivables', href: '/dashboard/payments/receivables', icon: TrendingUp },
      { title: 'Payables', href: '/dashboard/payments/payables', icon: TrendingDown },
      { title: 'Refunds', href: '/dashboard/payments/refunds', icon: RefreshCw },
      { title: 'Commissions', href: '/dashboard/payments/commissions', icon: Percent },
    ],
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: FileText,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['/dashboard/payments']);
  const pathname = usePathname();

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href) ? prev.filter(item => item !== href) : [...prev, href]
    );
  };

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.href);
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const isChildActive =
      hasChildren && item.children?.some(child => pathname.startsWith(child.href));

    if (hasChildren) {
      return (
        <div key={item.href}>
          <button
            onClick={() => toggleExpanded(item.href)}
            className={cn(
              'flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isChildActive || isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            )}
            title={collapsed ? item.title : undefined}
          >
            <Icon
              className={cn(
                'h-5 w-5 flex-shrink-0',
                (isChildActive || isActive) && 'text-primary-600'
              )}
            />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.title}</span>
                <ChevronDown
                  className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
                />
              </>
            )}
          </button>
          {!collapsed && isExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-3">
              {item.children?.map(child => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          depth > 0 ? 'text-xs' : 'text-sm',
          isActive
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        )}
        title={collapsed ? item.title : undefined}
      >
        <Icon className={cn('h-4 w-4 flex-shrink-0', isActive && 'text-primary-600')} />
        {!collapsed && <span>{item.title}</span>}
        {!collapsed && item.badge && (
          <span className="ml-auto rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-gray-200 bg-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary-600" />
            <span className="text-lg font-bold text-gray-900">Tour Ops</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto h-[calc(100vh-8rem)]">
        {navigationItems.map(item => renderNavItem(item))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-gray-200 p-4">
          <p className="text-xs text-gray-500">© 2025 Tour Operations</p>
        </div>
      )}
    </aside>
  );
}

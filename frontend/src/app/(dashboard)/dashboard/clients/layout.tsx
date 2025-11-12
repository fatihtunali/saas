'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Building2, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const clientTabs = [
  {
    title: 'B2C Clients',
    href: '/dashboard/clients/b2c',
    icon: UserCircle,
    description: 'Individual customers',
  },
  {
    title: 'B2B Clients',
    href: '/dashboard/clients/b2b',
    icon: Users,
    description: 'Business clients',
  },
  {
    title: 'Operators',
    href: '/dashboard/clients/operators',
    icon: Building2,
    description: 'Tour operator companies',
  },
];

export default function ClientsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Determine active tab based on pathname
  const getActiveTab = () => {
    if (pathname.startsWith('/dashboard/clients/b2c')) return '/dashboard/clients/b2c';
    if (pathname.startsWith('/dashboard/clients/b2b')) return '/dashboard/clients/b2b';
    if (pathname.startsWith('/dashboard/clients/operators')) return '/dashboard/clients/operators';
    return '/dashboard/clients/b2c'; // default
  };

  const activeTab = getActiveTab();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Client Management</h1>
        <p className="text-muted-foreground">
          Manage your B2C clients, B2B partners, and tour operator relationships
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          {clientTabs.map(tab => {
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
                  <span className="sm:hidden">{tab.title.split(' ')[0]}</span>
                </TabsTrigger>
              </Link>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Main Content */}
      <div className="mt-6">{children}</div>
    </div>
  );
}

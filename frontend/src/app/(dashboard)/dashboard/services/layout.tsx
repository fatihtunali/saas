'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Hotel,
  Car,
  User,
  UtensilsCrossed,
  Ticket,
  Package,
  Truck,
  Flag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const servicesNav = [
  {
    title: 'Hotels',
    href: '/dashboard/services/hotels',
    icon: Hotel,
    description: 'Manage accommodation inventory',
  },
  {
    title: 'Guides',
    href: '/dashboard/services/guides',
    icon: User,
    description: 'Tour guide profiles',
  },
  {
    title: 'Restaurants',
    href: '/dashboard/services/restaurants',
    icon: UtensilsCrossed,
    description: 'Dining and catering',
  },
  {
    title: 'Entrance Fees',
    href: '/dashboard/services/entrance-fees',
    icon: Ticket,
    description: 'Museums and attractions',
  },
  {
    title: 'Extra Expenses',
    href: '/dashboard/services/extras',
    icon: Package,
    description: 'Additional costs',
  },
  {
    title: 'Vehicles',
    href: '/dashboard/services/vehicles',
    icon: Car,
    description: 'Fleet and pricing management',
  },
  {
    title: 'Tour Companies',
    href: '/dashboard/services/tour-companies',
    icon: Flag,
    description: 'SIC and private tours',
  },
  {
    title: 'Suppliers',
    href: '/dashboard/services/suppliers',
    icon: Truck,
    description: 'All service suppliers',
  },
];

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Sidebar Navigation */}
      <aside className="lg:w-64 space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Services Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage all service types for your bookings
          </p>
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <nav className="space-y-1">
            {servicesNav.map(item => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-start gap-3 px-3 py-2 rounded-lg transition-colors',
                    isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  )}
                >
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.title}</div>
                    <div
                      className={cn(
                        'text-xs',
                        isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      )}
                    >
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

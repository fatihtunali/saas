//ft
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Hotel,
  Car,
  User,
  UtensilsCrossed,
  Ticket,
  Package,
  Building2,
  Truck,
  KeyRound,
  Route,
  Flag,
  ArrowRight,
} from 'lucide-react';

const services = [
  {
    title: 'Hotels',
    description: 'Manage hotel inventory, room types, and pricing',
    icon: Hotel,
    href: '/dashboard/services/hotels',
    stats: { total: 0, active: 0 },
  },
  {
    title: 'Guides',
    description: 'Manage tour guide profiles and availability',
    icon: User,
    href: '/dashboard/services/guides',
    stats: { total: 0, active: 0 },
  },
  {
    title: 'Restaurants',
    description: 'Manage restaurant reservations and meal plans',
    icon: UtensilsCrossed,
    href: '/dashboard/services/restaurants',
    stats: { total: 0, active: 0 },
  },
  {
    title: 'Entrance Fees',
    description: 'Manage entrance fees for museums and attractions',
    icon: Ticket,
    href: '/dashboard/services/entrance-fees',
    stats: { total: 0, active: 0 },
  },
  {
    title: 'Extra Expenses',
    description: 'Manage additional costs and miscellaneous items',
    icon: Package,
    href: '/dashboard/services/extras',
    stats: { total: 0, active: 0 },
  },
  {
    title: 'Vehicle Companies',
    description: 'Manage vehicle service providers and companies',
    icon: Building2,
    href: '/dashboard/services/vehicle-companies',
    stats: { total: 0, active: 0 },
  },
  {
    title: 'Vehicle Types',
    description: 'Define vehicle categories, capacity, and specifications',
    icon: Car,
    href: '/dashboard/services/vehicle-types',
    stats: { total: 0, active: 0 },
  },
  {
    title: 'Vehicle Rentals',
    description: 'Manage rental pricing and terms for vehicles',
    icon: KeyRound,
    href: '/dashboard/services/vehicle-rentals',
    stats: { total: 0, active: 0 },
  },
  {
    title: 'Transfer Routes',
    description: 'Pre-defined city-to-city transfer routes',
    icon: Route,
    href: '/dashboard/services/transfer-routes',
    stats: { total: 0, active: 0 },
  },
  {
    title: 'Tour Companies',
    description: 'Manage SIC and private tour packages',
    icon: Flag,
    href: '/dashboard/services/tour-companies',
    stats: { total: 0, active: 0 },
  },
  {
    title: 'Suppliers',
    description: 'Manage all third-party service suppliers',
    icon: Truck,
    href: '/dashboard/services/suppliers',
    stats: { total: 0, active: 0 },
  },
];

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Services Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage all service types available for your tour bookings
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map(service => {
          const Icon = service.icon;

          return (
            <Card key={service.href} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Icon className="h-8 w-8 text-primary" />
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={service.href}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold ml-1">{service.stats.total}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Active:</span>
                    <span className="font-semibold ml-1">{service.stats.active}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

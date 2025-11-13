'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
  Hotel,
  Car,
  User,
  UtensilsCrossed,
  Ticket,
  Package,
  Truck,
  Flag,
  ArrowRight,
} from 'lucide-react';
import { useHotels } from '@/hooks/use-hotels';
import { useGuides } from '@/hooks/use-guides';
import { useRestaurants } from '@/hooks/use-restaurants';
import { useEntranceFees } from '@/hooks/use-entrance-fees';
import { useExtras } from '@/hooks/use-extras';
import { useVehicleCompanies } from '@/hooks/use-vehicle-companies';
import { useTourCompanies } from '@/hooks/use-tour-companies';
import { useSuppliers } from '@/hooks/use-suppliers';

export default function ServicesPage() {
  // Fetch data with limit 1 to get pagination info (total count)
  const { pagination: hotelsPagination, isLoading: hotelsLoading } = useHotels({ limit: 1 });
  const { pagination: guidesPagination, isLoading: guidesLoading } = useGuides({ limit: 1 });
  const { pagination: restaurantsPagination, isLoading: restaurantsLoading } = useRestaurants({ limit: 1 });
  const { pagination: feesPagination, isLoading: feesLoading } = useEntranceFees({ limit: 1 });
  const { pagination: extrasPagination, isLoading: extrasLoading } = useExtras({ limit: 1 });
  const { pagination: vehiclesPagination, isLoading: vehiclesLoading } = useVehicleCompanies({ limit: 1 });
  const { pagination: toursPagination, isLoading: toursLoading } = useTourCompanies({ limit: 1 });
  const { pagination: suppliersPagination, isLoading: suppliersLoading } = useSuppliers({ limit: 1 });

  const services = [
    {
      title: 'Hotels',
      description: 'Manage hotel inventory, room types, and pricing',
      icon: Hotel,
      href: '/dashboard/services/hotels',
      stats: {
        total: hotelsPagination?.total || 0,
        active: hotelsPagination?.total || 0, // API doesn't return active count separately
      },
      isLoading: hotelsLoading,
    },
    {
      title: 'Guides',
      description: 'Manage tour guide profiles and availability',
      icon: User,
      href: '/dashboard/services/guides',
      stats: {
        total: guidesPagination?.total || 0,
        active: guidesPagination?.total || 0,
      },
      isLoading: guidesLoading,
    },
    {
      title: 'Restaurants',
      description: 'Manage restaurant reservations and meal plans',
      icon: UtensilsCrossed,
      href: '/dashboard/services/restaurants',
      stats: {
        total: restaurantsPagination?.total || 0,
        active: restaurantsPagination?.total || 0,
      },
      isLoading: restaurantsLoading,
    },
    {
      title: 'Entrance Fees',
      description: 'Manage entrance fees for museums and attractions',
      icon: Ticket,
      href: '/dashboard/services/entrance-fees',
      stats: {
        total: feesPagination?.total || 0,
        active: feesPagination?.total || 0,
      },
      isLoading: feesLoading,
    },
    {
      title: 'Extra Expenses',
      description: 'Manage additional costs and miscellaneous items',
      icon: Package,
      href: '/dashboard/services/extras',
      stats: {
        total: extrasPagination?.total || 0,
        active: extrasPagination?.total || 0,
      },
      isLoading: extrasLoading,
    },
    {
      title: 'Vehicles',
      description: 'Manage vehicle companies, fleet types, rental pricing, and transfer routes',
      icon: Car,
      href: '/dashboard/services/vehicles',
      stats: {
        total: vehiclesPagination?.total || 0,
        active: vehiclesPagination?.total || 0,
      },
      isLoading: vehiclesLoading,
    },
    {
      title: 'Tour Companies',
      description: 'Manage SIC and private tour packages',
      icon: Flag,
      href: '/dashboard/services/tour-companies',
      stats: {
        total: toursPagination?.total || 0,
        active: toursPagination?.total || 0,
      },
      isLoading: toursLoading,
    },
    {
      title: 'Suppliers',
      description: 'Manage all third-party service suppliers',
      icon: Truck,
      href: '/dashboard/services/suppliers',
      stats: {
        total: suppliersPagination?.total || 0,
        active: suppliersPagination?.total || 0,
      },
      isLoading: suppliersLoading,
    },
  ];

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
                    {service.isLoading ? (
                      <Skeleton className="h-5 w-8 inline-block ml-1" />
                    ) : (
                      <span className="font-semibold ml-1">{service.stats.total}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Active:</span>
                    {service.isLoading ? (
                      <Skeleton className="h-5 w-8 inline-block ml-1" />
                    ) : (
                      <span className="font-semibold ml-1">{service.stats.active}</span>
                    )}
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

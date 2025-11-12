'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useBookingServices } from '@/lib/hooks/useBookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Hotel,
  Car,
  MapPin,
  User,
  UtensilsCrossed,
  FileCheck,
  Package,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  DollarSign,
  Filter,
  SortAsc,
  FileText,
  Download,
  Eye,
} from 'lucide-react';
import type { Booking, BookingService, ServiceType } from '@/types/bookings';
import { VoucherQuickActions } from '@/components/features/vouchers';

// Utility Functions
function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

function formatTime(time: string | null): string {
  if (!time) return '';
  try {
    return format(new Date(`2000-01-01T${time}`), 'HH:mm');
  } catch {
    return time;
  }
}

// Service Type Icon Component
function ServiceTypeIcon({
  type,
  className = 'h-5 w-5',
}: {
  type: ServiceType;
  className?: string;
}) {
  const icons: Record<ServiceType, React.ReactNode> = {
    hotel: <Hotel className={className} />,
    transfer: <Car className={className} />,
    vehicle_rental: <Car className={className} />,
    tour: <MapPin className={className} />,
    guide: <User className={className} />,
    restaurant: <UtensilsCrossed className={className} />,
    entrance_fee: <FileCheck className={className} />,
    extra: <Package className={className} />,
  };

  return icons[type] || <Package className={className} />;
}

// Service Type Label
function getServiceTypeLabel(type: ServiceType): string {
  const labels: Record<ServiceType, string> = {
    hotel: 'Hotels',
    transfer: 'Transfers',
    vehicle_rental: 'Vehicle Rentals',
    tour: 'Tours',
    guide: 'Guides',
    restaurant: 'Restaurants',
    entrance_fee: 'Entrance Fees',
    extra: 'Extras',
  };
  return labels[type] || type;
}

// Service Card Component
interface ServiceCardProps {
  service: BookingService;
  booking: Booking;
  onEdit: (service: BookingService) => void;
  onDelete: (service: BookingService) => void;
}

function ServiceCard({ service, booking, onEdit, onDelete }: ServiceCardProps) {
  // Check if service supports vouchers
  const supportsVouchers = ['hotel', 'transfer', 'tour', 'guide', 'restaurant'].includes(
    service.serviceType
  );
  return (
    <Card className="mb-3">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ServiceTypeIcon type={service.serviceType} className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{service.serviceName || 'Unnamed Service'}</h4>
                  {service.voucherSent && (
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 border-green-300"
                    >
                      Voucher Sent
                    </Badge>
                  )}
                </div>

                {service.serviceDescription && (
                  <p className="text-sm text-muted-foreground mb-2">{service.serviceDescription}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm font-medium">{formatDate(service.serviceDate)}</p>
                    </div>
                    {service.pickupTime && (
                      <p className="text-xs text-muted-foreground">
                        {formatTime(service.pickupTime)}
                      </p>
                    )}
                  </div>

                  {service.supplierName && (
                    <div>
                      <p className="text-xs text-muted-foreground">Provider</p>
                      <p className="text-sm font-medium mt-0.5">{service.supplierName}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-muted-foreground">Cost</p>
                    <p className="text-sm font-medium mt-0.5">
                      {formatCurrency(service.costInBaseCurrency)}
                    </p>
                    {service.quantity > 1 && (
                      <p className="text-xs text-muted-foreground">Qty: {service.quantity}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Selling Price</p>
                    <p className="text-sm font-semibold text-primary mt-0.5">
                      {formatCurrency(service.sellingPrice * service.quantity)}
                    </p>
                    <p className="text-xs text-green-600">
                      Profit:{' '}
                      {formatCurrency(
                        (service.sellingPrice - service.costInBaseCurrency) * service.quantity
                      )}
                    </p>
                  </div>
                </div>

                {(service.pickupLocation || service.dropoffLocation) && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      {service.pickupLocation && (
                        <span className="text-muted-foreground">
                          From:{' '}
                          <span className="font-medium text-foreground">
                            {service.pickupLocation}
                          </span>
                        </span>
                      )}
                      {service.pickupLocation && service.dropoffLocation && (
                        <span className="text-muted-foreground">→</span>
                      )}
                      {service.dropoffLocation && (
                        <span className="text-muted-foreground">
                          To:{' '}
                          <span className="font-medium text-foreground">
                            {service.dropoffLocation}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {service.serviceNotes && (
                  <div className="mt-2 p-2 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground">{service.serviceNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {supportsVouchers && (
              <VoucherQuickActions
                booking={booking}
                service={service}
                passengers={booking.passengers}
                variant="dropdown"
              />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(service)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Service
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(service)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Service
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Stat Card Component
interface StatCardProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  amount?: number;
}

function StatCard({ label, count, icon, amount }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
      <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
      <div>
        <p className="text-2xl font-bold">{count}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {amount !== undefined && (
          <p className="text-xs font-semibold text-primary">{formatCurrency(amount)}</p>
        )}
      </div>
    </div>
  );
}

// Main ServicesTab Component
interface ServicesTabProps {
  bookingId: string;
  booking: Booking;
}

export default function ServicesTab({ bookingId, booking }: ServicesTabProps) {
  const { data: services = [], isLoading } = useBookingServices(bookingId);
  const [selectedType, setSelectedType] = useState<ServiceType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'price'>('date');

  // Group services by type
  const servicesByType = useMemo(() => {
    const grouped: Partial<Record<ServiceType, BookingService[]>> = {};
    services.forEach(service => {
      if (!grouped[service.serviceType]) {
        grouped[service.serviceType] = [];
      }
      grouped[service.serviceType]!.push(service);
    });

    // Sort services within each group by date
    Object.keys(grouped).forEach(type => {
      grouped[type as ServiceType]!.sort(
        (a, b) => new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime()
      );
    });

    return grouped;
  }, [services]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCost = services.reduce((sum, s) => sum + s.costInBaseCurrency * s.quantity, 0);
    const totalSelling = services.reduce((sum, s) => sum + s.sellingPrice * s.quantity, 0);
    const totalProfit = totalSelling - totalCost;

    const typeStats: Partial<Record<ServiceType, { count: number; total: number }>> = {};
    services.forEach(service => {
      if (!typeStats[service.serviceType]) {
        typeStats[service.serviceType] = { count: 0, total: 0 };
      }
      typeStats[service.serviceType]!.count += 1;
      typeStats[service.serviceType]!.total += service.sellingPrice * service.quantity;
    });

    return {
      totalServices: services.length,
      totalCost,
      totalSelling,
      totalProfit,
      typeStats,
    };
  }, [services]);

  // Handlers
  const handleEdit = (service: BookingService) => {
    console.log('Edit service:', service.id);
    // TODO: Implement edit functionality
  };

  const handleDelete = (service: BookingService) => {
    console.log('Delete service:', service.id);
    // TODO: Implement delete functionality
  };

  const handleAddService = () => {
    console.log('Add new service');
    // TODO: Implement add service functionality
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Empty state
  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No services added</p>
          <p className="text-sm text-muted-foreground mb-4">Add services to this booking</p>
          <Button onClick={handleAddService}>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Services</h2>
          <p className="text-sm text-muted-foreground">
            {stats.totalServices} service{stats.totalServices !== 1 ? 's' : ''} | Total:{' '}
            {formatCurrency(stats.totalSelling)}
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedType('all')}>
                All Services
              </DropdownMenuItem>
              {Object.keys(servicesByType).map(type => (
                <DropdownMenuItem key={type} onClick={() => setSelectedType(type as ServiceType)}>
                  {getServiceTypeLabel(type as ServiceType)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SortAsc className="mr-2 h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('date')}>By Date</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('type')}>By Type</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('price')}>By Price</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleAddService}>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Services Summary</CardTitle>
          <CardDescription>Overview of all services in this booking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(servicesByType).map(([type, typeServices]) => (
              <StatCard
                key={type}
                label={getServiceTypeLabel(type as ServiceType)}
                count={stats.typeStats[type as ServiceType]?.count || 0}
                icon={
                  <ServiceTypeIcon type={type as ServiceType} className="h-5 w-5 text-primary" />
                }
                amount={stats.typeStats[type as ServiceType]?.total}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalCost)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Selling</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(stats.totalSelling)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Profit</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalProfit)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services List Grouped by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Services by Type</CardTitle>
          <CardDescription>Organized by service category</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={Object.keys(servicesByType)} className="w-full">
            {Object.entries(servicesByType).map(([type, typeServices]) => {
              const typeTotal = typeServices.reduce(
                (sum, s) => sum + s.sellingPrice * s.quantity,
                0
              );

              return (
                <AccordionItem key={type} value={type}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <ServiceTypeIcon type={type as ServiceType} />
                        <span className="font-semibold">
                          {getServiceTypeLabel(type as ServiceType)}
                        </span>
                        <Badge variant="secondary">{typeServices.length}</Badge>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        {formatCurrency(typeTotal)}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-2">
                      {typeServices.map(service => (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          booking={booking}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

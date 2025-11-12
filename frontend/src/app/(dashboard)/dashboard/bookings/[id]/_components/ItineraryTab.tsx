'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Hotel,
  Car,
  MapPin,
  User,
  UtensilsCrossed,
  FileCheck,
  Package,
  Plane,
  Calendar,
  Clock,
  Plus,
  Printer,
} from 'lucide-react';
import type { Booking, BookingService, ServiceType } from '@/types/bookings';
import { useBookingServices } from '@/lib/hooks/useBookings';
import { formatDate } from '@/lib/utils/formatters';
import { format, parseISO, differenceInDays } from 'date-fns';

interface ItineraryTabProps {
  booking: Booking;
}

interface DayItinerary {
  date: string;
  dayNumber: number;
  services: BookingService[];
}

// Service Type Icon Component
function ServiceTypeIcon({ type }: { type: ServiceType }) {
  const icons: Record<ServiceType, React.ReactNode> = {
    hotel: <Hotel className="h-5 w-5" />,
    transfer: <Car className="h-5 w-5" />,
    vehicle_rental: <Car className="h-5 w-5" />,
    tour: <MapPin className="h-5 w-5" />,
    guide: <User className="h-5 w-5" />,
    restaurant: <UtensilsCrossed className="h-5 w-5" />,
    entrance_fee: <FileCheck className="h-5 w-5" />,
    extra: <Package className="h-5 w-5" />,
  };

  return icons[type] || <Package className="h-5 w-5" />;
}

// Service Type Color
function getServiceTypeColor(type: ServiceType): string {
  const colors: Record<ServiceType, string> = {
    hotel: 'bg-blue-100 text-blue-800 border-blue-300',
    transfer: 'bg-purple-100 text-purple-800 border-purple-300',
    vehicle_rental: 'bg-purple-100 text-purple-800 border-purple-300',
    tour: 'bg-green-100 text-green-800 border-green-300',
    guide: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    restaurant: 'bg-orange-100 text-orange-800 border-orange-300',
    entrance_fee: 'bg-pink-100 text-pink-800 border-pink-300',
    extra: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
}

export function ItineraryTab({ booking }: ItineraryTabProps) {
  const { data: services = [], isLoading } = useBookingServices(booking.id);

  // Group services by date
  const itineraryByDay = useMemo((): DayItinerary[] => {
    if (!booking.travelStartDate || !booking.travelEndDate) return [];

    const startDate = parseISO(booking.travelStartDate);
    const endDate = parseISO(booking.travelEndDate);
    const totalDays = differenceInDays(endDate, startDate) + 1;

    const days: DayItinerary[] = [];

    // Create an array for each day of the trip
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = format(date, 'yyyy-MM-dd');

      // Find services for this day
      const dayServices = services.filter(service => {
        const serviceDate = format(parseISO(service.serviceDate), 'yyyy-MM-dd');
        return serviceDate === dateStr;
      });

      // Sort services by time if available
      dayServices.sort((a, b) => {
        if (a.pickupTime && b.pickupTime) {
          return a.pickupTime.localeCompare(b.pickupTime);
        }
        // Hotel services first, then others
        if (a.serviceType === 'hotel') return -1;
        if (b.serviceType === 'hotel') return 1;
        return 0;
      });

      days.push({
        date: dateStr,
        dayNumber: i + 1,
        services: dayServices,
      });
    }

    return days;
  }, [booking.travelStartDate, booking.travelEndDate, services]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (itineraryByDay.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No itinerary available</p>
          <p className="text-sm text-muted-foreground mb-4">
            Travel dates not set for this booking
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Day-by-Day Itinerary</h3>
          <p className="text-sm text-muted-foreground">
            {itineraryByDay.length} day{itineraryByDay.length > 1 ? 's' : ''} • {services.length}{' '}
            service{services.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print Itinerary
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {itineraryByDay.map((day, dayIndex) => (
          <div key={day.date} className="relative">
            {/* Timeline connector */}
            {dayIndex < itineraryByDay.length - 1 && (
              <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-border" />
            )}

            {/* Day Card */}
            <div className="flex gap-4">
              {/* Day Number Circle */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md z-10">
                  {day.dayNumber}
                </div>
              </div>

              {/* Day Content */}
              <div className="flex-1 pb-8">
                {/* Date Header */}
                <div className="mb-4">
                  <h4 className="text-lg font-bold">Day {day.dayNumber}</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(day.date), 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>

                {/* Services for this day */}
                {day.services.length > 0 ? (
                  <div className="space-y-3">
                    {day.services.map(service => (
                      <Card key={service.id} className="border-l-4 border-l-primary/30">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Service Icon */}
                            <div
                              className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                service.serviceType === 'hotel'
                                  ? 'bg-blue-100 text-blue-600'
                                  : service.serviceType === 'transfer' ||
                                      service.serviceType === 'vehicle_rental'
                                    ? 'bg-purple-100 text-purple-600'
                                    : service.serviceType === 'tour'
                                      ? 'bg-green-100 text-green-600'
                                      : service.serviceType === 'restaurant'
                                        ? 'bg-orange-100 text-orange-600'
                                        : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              <ServiceTypeIcon type={service.serviceType} />
                            </div>

                            {/* Service Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge
                                      variant="outline"
                                      className={getServiceTypeColor(service.serviceType)}
                                    >
                                      {service.serviceType.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                    {service.pickupTime && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {format(
                                          parseISO(`2000-01-01T${service.pickupTime}`),
                                          'HH:mm'
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <h5 className="font-semibold text-base">
                                    {service.serviceName || 'Unnamed Service'}
                                  </h5>
                                </div>
                              </div>

                              {service.serviceDescription && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {service.serviceDescription}
                                </p>
                              )}

                              {/* Additional Details */}
                              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                {service.supplierName && (
                                  <div>
                                    <span className="font-medium">Supplier:</span>{' '}
                                    {service.supplierName}
                                  </div>
                                )}
                                {service.quantity && service.quantity > 1 && (
                                  <div>
                                    <span className="font-medium">Qty:</span> {service.quantity}
                                  </div>
                                )}
                                {service.pickupLocation && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {service.pickupLocation}
                                  </div>
                                )}
                                {service.dropoffLocation &&
                                  service.pickupLocation !== service.dropoffLocation && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />→ {service.dropoffLocation}
                                    </div>
                                  )}
                              </div>

                              {/* Voucher Status */}
                              {service.voucherSent && (
                                <div className="mt-2">
                                  <Badge
                                    variant="default"
                                    className="bg-green-100 text-green-800 text-xs"
                                  >
                                    Voucher Sent
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">No services scheduled</p>
                        <Button variant="outline" size="sm">
                          <Plus className="mr-2 h-3 w-3" />
                          Add Service
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Itinerary Summary</p>
              <p className="text-xs text-muted-foreground">
                Total of {services.length} services across {itineraryByDay.length} days
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

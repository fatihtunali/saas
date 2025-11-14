'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Hotel,
  Car,
  User,
  UtensilsCrossed,
  Ticket,
  Package,
  Flag,
  Trash2,
  Plus,
} from 'lucide-react';
import type { QuotationServiceType } from '@/types/quotations';

interface ServiceItem {
  id: string;
  service_type: QuotationServiceType;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  currency: string;
  service_date: string;
}

interface DayTimelineCardProps {
  dayNumber: number;
  date: string;
  dayType: 'arrival' | 'middle' | 'departure';
  services: ServiceItem[];
  onAddService: (serviceType: QuotationServiceType, date: string) => void;
  onRemoveService: (serviceId: string) => void;
  onUpdateService: (serviceId: string, field: string, value: any) => void;
  currency: string;
  numPassengers: number;
}

const getServiceIcon = (type: QuotationServiceType) => {
  switch (type) {
    case 'hotel':
      return <Hotel className="h-4 w-4" />;
    case 'vehicle':
      return <Car className="h-4 w-4" />;
    case 'guide':
      return <User className="h-4 w-4" />;
    case 'restaurant':
      return <UtensilsCrossed className="h-4 w-4" />;
    case 'entrance_fee':
      return <Ticket className="h-4 w-4" />;
    case 'extra':
      return <Package className="h-4 w-4" />;
    case 'tour_company':
      return <Flag className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

const getServiceLabel = (type: QuotationServiceType) => {
  switch (type) {
    case 'hotel':
      return 'Hotel';
    case 'vehicle':
      return 'Transfer';
    case 'guide':
      return 'Guide';
    case 'restaurant':
      return 'Restaurant';
    case 'entrance_fee':
      return 'Entrance';
    case 'extra':
      return 'Extra';
    case 'tour_company':
      return 'Tour';
    default:
      return 'Service';
  }
};

export function DayTimelineCard({
  dayNumber,
  date,
  dayType,
  services,
  onAddService,
  onRemoveService,
  onUpdateService,
  currency,
  numPassengers,
}: DayTimelineCardProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const dayTotal = services.reduce(
    (sum, service) => sum + (Number(service.total_price) || 0),
    0
  );

  const getDayBadge = () => {
    if (dayType === 'arrival') {
      return <Badge className="bg-green-100 text-green-800">Arrival</Badge>;
    }
    if (dayType === 'departure') {
      return <Badge className="bg-orange-100 text-orange-800">Departure</Badge>;
    }
    return null;
  };

  const getSuggestedServices = (): QuotationServiceType[] => {
    // Show all service types on all days for maximum flexibility
    return ['hotel', 'vehicle', 'guide', 'restaurant', 'entrance_fee', 'tour_company', 'extra'];
  };

  return (
    <Card className="relative">
      {/* Day connector line */}
      {dayType !== 'departure' && (
        <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200 -mb-4" />
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold z-10">
              {dayNumber}
            </div>
            <div>
              <CardTitle className="text-lg">Day {dayNumber}</CardTitle>
              <p className="text-sm text-muted-foreground">{formattedDate}</p>
            </div>
            {getDayBadge()}
          </div>
          {services.length > 0 && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Day Total</p>
              <p className="text-lg font-semibold">
                {dayTotal.toFixed(2)} {currency}
              </p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Services for this day */}
        {services.length > 0 && (
          <div className="space-y-2">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-white hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                    {getServiceIcon(service.service_type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{service.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {Number(service.unit_price).toFixed(2)} pp ×
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {numPassengers} pax
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs">×</span>
                      <Input
                        type="number"
                        min="1"
                        value={service.quantity}
                        onChange={(e) =>
                          onUpdateService(service.id, 'quantity', parseInt(e.target.value) || 1)
                        }
                        className="w-16 h-8 text-sm"
                      />
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-semibold">
                        {Number(service.total_price).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">{service.currency}</p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveService(service.id)}
                  className="ml-2"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add service buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          {getSuggestedServices().map((serviceType) => (
            <Button
              key={serviceType}
              variant="outline"
              size="sm"
              onClick={() => onAddService(serviceType, date)}
              className="gap-1"
            >
              {getServiceIcon(serviceType)}
              <Plus className="h-3 w-3" />
              {getServiceLabel(serviceType)}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

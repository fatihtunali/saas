'use client';

import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { QuotationServiceType } from '@/types/quotations';
import { useHotels } from '@/hooks/use-hotels';
import { useGuides } from '@/hooks/use-guides';
import { useRestaurants } from '@/hooks/use-restaurants';
import { useEntranceFees } from '@/hooks/use-entrance-fees';
import { useExtras } from '@/hooks/use-extras';
import { useVehicleCompanies } from '@/hooks/use-vehicle-companies';
import { useTourCompanies } from '@/hooks/use-tour-companies';
import { useTransferRoutes } from '@/hooks/use-transfer-routes';
import { useVehicleRentals } from '@/hooks/use-vehicle-rentals';

interface ServiceSelectorProps {
  serviceType: QuotationServiceType;
  open: boolean;
  onClose: () => void;
  onSelect: (service: any) => void;
  currency: string;
}

export function ServiceSelector({
  serviceType,
  open,
  onClose,
  onSelect,
  currency,
}: ServiceSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch services based on type
  const { hotels, isLoading: hotelsLoading } = useHotels({});
  const { guides, isLoading: guidesLoading } = useGuides({});
  const { restaurants, isLoading: restaurantsLoading } = useRestaurants({});
  const { entranceFees, isLoading: feesLoading } = useEntranceFees({});
  const { extras, isLoading: extrasLoading } = useExtras({});
  const { transferRoutes, isLoading: transfersLoading } = useTransferRoutes({});
  const { vehicleRentals, isLoading: rentalsLoading } = useVehicleRentals({});
  const { tourCompanies, isLoading: toursLoading } = useTourCompanies({});

  const getServices = () => {
    switch (serviceType) {
      case 'hotel':
        return hotels.map((h: any) => ({
          id: h.id,
          name: h.hotelName,
          description: `${h.starRating || 'N/A'} Star - ${h.cityName || 'N/A'}`,
          price: h.pricePerPersonDouble || 0,
          isActive: h.isActive,
        }));
      case 'guide':
        return guides.map((g: any) => ({
          id: g.id,
          name: g.guideName,
          description: `${g.languages || 'N/A'} - ${g.specializations || 'N/A'}`,
          price: g.dailyRate || 0,
          isActive: g.isActive,
        }));
      case 'restaurant':
        return restaurants.map((r: any) => ({
          id: r.id,
          name: r.restaurantName,
          description: `${r.cuisineType || 'N/A'} - ${r.cityName || 'N/A'}`,
          price: r.lunchPrice || r.dinnerPrice || 0,
          isActive: r.isActive,
        }));
      case 'entrance_fee':
        return entranceFees.map((e: any) => ({
          id: e.id,
          name: e.siteName,
          description: `${e.cityName || 'N/A'}`,
          price: e.adultPrice || 0,
          isActive: e.isActive,
        }));
      case 'extra':
        return extras.map((e: any) => ({
          id: e.id,
          name: e.expenseName,
          description: e.description || 'N/A',
          price: e.price || 0,
          isActive: e.isActive,
        }));
      case 'vehicle':
        const transfers = transferRoutes.map((t: any) => ({
          id: `transfer-${t.id}`,
          name: `Transfer: ${t.fromCity?.name || 'N/A'} → ${t.toCity?.name || 'N/A'}`,
          description: `${t.vehicleType || 'Any Vehicle'} - ${t.companyName || 'N/A'}`,
          price: t.pricePerVehicle || 0,
          isActive: t.isActive,
          vehicleSubType: 'transfer',
          originalId: t.id,
        }));
        const rentals = vehicleRentals.map((r: any) => ({
          id: `rental-${r.id}`,
          name: `Daily Rental: ${r.vehicleType || 'Vehicle'}`,
          description: `${r.companyName || 'N/A'} - ${r.fullDayPrice ? `Full Day: ${r.fullDayPrice}` : 'TBD'}`,
          price: r.fullDayPrice || 0,
          isActive: r.isActive,
          vehicleSubType: 'rental',
          originalId: r.id,
        }));
        return [...transfers, ...rentals];
      case 'tour_company':
        return tourCompanies.map(t => ({
          id: t.id,
          name: t.companyName,
          description: `${t.tourName || 'N/A'} - ${t.tourType || 'N/A'}`,
          price: t.sicPrice || 0,
          isActive: t.isActive,
        }));
      default:
        return [];
    }
  };

  const services = getServices();
  const isLoading =
    hotelsLoading ||
    guidesLoading ||
    restaurantsLoading ||
    feesLoading ||
    extrasLoading ||
    transfersLoading ||
    rentalsLoading ||
    toursLoading;

  const filteredServices = services.filter(
    (service) =>
      (service.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (service.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleSelect = (service: any) => {
    onSelect({
      serviceType,
      name: service.name,
      description: service.description,
      unitPrice: service.price,
      currency,
    });
    onClose();
    setSearchQuery('');
  };

  const getServiceTypeLabel = () => {
    switch (serviceType) {
      case 'hotel':
        return 'Hotels';
      case 'guide':
        return 'Guides';
      case 'restaurant':
        return 'Restaurants';
      case 'entrance_fee':
        return 'Entrance Fees';
      case 'extra':
        return 'Extra Expenses';
      case 'vehicle':
        return 'Transfers & Rentals';
      case 'tour_company':
        return 'Tour Companies';
      default:
        return 'Services';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select {getServiceTypeLabel()}</DialogTitle>
          <DialogDescription>
            Search and select a service to add to the quotation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Services List */}
          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading services...
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No services found
              </div>
            ) : (
              <div className="space-y-2">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => handleSelect(service)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{service.name}</h4>
                        {!service.isActive && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.description}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-semibold">
                        {service.price > 0
                          ? `${Number(service.price).toFixed(2)} ${currency}`
                          : 'TBD'}
                      </div>
                      <Button size="sm" variant="ghost" className="mt-1">
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

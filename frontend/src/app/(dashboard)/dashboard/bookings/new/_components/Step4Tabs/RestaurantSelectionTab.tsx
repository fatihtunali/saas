/**
 * Restaurant Selection Tab
 */

'use client';

import React, { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { useBookingWizard } from '@/contexts/BookingWizardContext';
import { useRestaurants } from '@/lib/hooks/useBookingWizard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Restaurant, WizardServiceData } from '@/types/wizard';

export function RestaurantSelectionTab() {
  const { tripDetails, addService, services, removeService } = useBookingWizard();
  const { data: restaurants, isLoading } = useRestaurants(tripDetails?.destinationCityId);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const filteredRestaurants = restaurants?.filter(restaurant =>
    restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const restaurantServices = services.filter(s => s.serviceType === 'restaurant');

  const handleAddRestaurant = () => {
    if (!selectedRestaurant || !tripDetails) return;

    const newService: WizardServiceData = {
      serviceType: 'restaurant',
      restaurantId: selectedRestaurant.id,
      serviceDate: tripDetails.travelStartDate,
      serviceDescription: selectedRestaurant.name,
      quantity: tripDetails.numAdults + tripDetails.numChildren,
      costAmount: selectedRestaurant.lunchPrice || 0,
      costCurrency: 'TRY',
      exchangeRate: 1,
      costInBaseCurrency: selectedRestaurant.lunchPrice || 0,
      sellingPrice: (selectedRestaurant.lunchPrice || 0) * 1.2,
      sellingCurrency: 'TRY',
    };

    addService(newService);
    setSelectedRestaurant(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="restaurantSearch">Search Restaurants</Label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="restaurantSearch"
            type="text"
            placeholder="Search by restaurant name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {restaurantServices.length > 0 && (
        <div className="border rounded-lg p-4 bg-green-50">
          <h4 className="font-semibold text-green-900 mb-3">
            Selected Restaurants ({restaurantServices.length})
          </h4>
          <div className="space-y-2">
            {restaurantServices.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-3 rounded-md"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{service.serviceDescription}</p>
                  <p className="text-sm text-gray-600">
                    {service.quantity} guests @ {service.costCurrency} {service.costAmount}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeService(services.indexOf(service))}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading restaurants...</p>
        </div>
      ) : filteredRestaurants && filteredRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRestaurants.map(restaurant => (
            <Card
              key={restaurant.id}
              className={`p-4 cursor-pointer transition-all ${
                selectedRestaurant?.id === restaurant.id
                  ? 'border-blue-500 border-2 bg-blue-50'
                  : 'hover:border-gray-400'
              }`}
              onClick={() => setSelectedRestaurant(restaurant)}
            >
              <h4 className="font-semibold text-gray-900">{restaurant.name}</h4>
              {restaurant.address && (
                <p className="text-sm text-gray-600 mt-2">{restaurant.address}</p>
              )}
              <p className="text-sm text-gray-600 mt-1">
                Per Person: {'TRY'} {restaurant.lunchPrice}
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No restaurants available</p>
        </div>
      )}

      {selectedRestaurant && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <h4 className="font-semibold text-blue-900 mb-4">Add {selectedRestaurant.name}</h4>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setSelectedRestaurant(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleAddRestaurant} className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Add Restaurant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

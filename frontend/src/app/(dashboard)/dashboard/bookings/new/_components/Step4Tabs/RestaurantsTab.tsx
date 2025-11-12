/**
 * Restaurants Tab - Step 4 Service Selection
 *
 * Allows selection of restaurants with meal type selection and guest count.
 * Supports lunch and dinner reservations with special requests.
 */

'use client';

import React, { useState } from 'react';
import { Search, Plus, X, Calendar, Clock, Users, UtensilsCrossed, MapPin } from 'lucide-react';
import { useBookingWizard } from '@/contexts/BookingWizardContext';
import { useRestaurants } from '@/lib/hooks/useBookingWizard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Restaurant, WizardServiceData, WizardRestaurantService } from '@/types/wizard';

type MealType = 'Lunch' | 'Dinner';
type MenuType = 'Set Menu' | 'À la carte';

interface RestaurantFormData {
  serviceDate: string;
  serviceTime: string;
  mealType: MealType;
  menuType: MenuType;
  numGuests: number;
  specialRequests: string;
}

export function RestaurantsTab() {
  const { tripDetails, addService, services, removeService } = useBookingWizard();
  const { data: restaurants, isLoading } = useRestaurants(tripDetails?.destinationCityId);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState<RestaurantFormData>({
    serviceDate: tripDetails?.travelStartDate
      ? new Date(tripDetails.travelStartDate).toISOString().split('T')[0]
      : '',
    serviceTime: '12:00',
    mealType: 'Lunch',
    menuType: 'Set Menu',
    numGuests: (tripDetails?.numAdults || 0) + (tripDetails?.numChildren || 0),
    specialRequests: '',
  });

  const filteredRestaurants = restaurants?.filter(
    restaurant =>
      restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisineType?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const restaurantServices = services.filter(s => s.serviceType === 'restaurant');

  // Calculate restaurant cost based on meal type and guests
  const calculateRestaurantCost = (
    restaurant: Restaurant,
    mealType: MealType,
    numGuests: number
  ): number => {
    const pricePerPerson =
      mealType === 'Lunch' ? restaurant.lunchPrice || 0 : restaurant.dinnerPrice || 0;
    return pricePerPerson * numGuests;
  };

  const handleAddRestaurant = () => {
    if (!selectedRestaurant || !tripDetails || !formData.serviceDate) return;

    const costAmount = calculateRestaurantCost(
      selectedRestaurant,
      formData.mealType,
      formData.numGuests
    );
    const sellingPrice = costAmount * 1.15; // 15% markup

    const newService: WizardRestaurantService = {
      id: `restaurant-${Date.now()}`,
      serviceType: 'restaurant',
      restaurantId: selectedRestaurant.id,
      serviceDate: new Date(formData.serviceDate),
      serviceDescription: `${selectedRestaurant.name} - ${formData.mealType}`,
      serviceName: selectedRestaurant.name,
      supplierName: selectedRestaurant.name,
      quantity: 1,
      costAmount,
      costCurrency: 'TRY',
      exchangeRate: 1,
      costInBaseCurrency: costAmount,
      sellingPrice,
      sellingCurrency: 'TRY',
      mealType: formData.mealType,
      numberOfGuests: formData.numGuests,
      serviceNotes: `Time: ${formData.serviceTime} | Menu: ${formData.menuType} | ${formData.numGuests} guests${formData.specialRequests ? ' | ' + formData.specialRequests : ''}`,
    };

    addService(newService);
    setSelectedRestaurant(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      serviceDate: tripDetails?.travelStartDate
        ? new Date(tripDetails.travelStartDate).toISOString().split('T')[0]
        : '',
      serviceTime: '12:00',
      mealType: 'Lunch',
      menuType: 'Set Menu',
      numGuests: (tripDetails?.numAdults || 0) + (tripDetails?.numChildren || 0),
      specialRequests: '',
    });
  };

  const getDefaultTimeForMeal = (mealType: MealType): string => {
    return mealType === 'Lunch' ? '12:00' : '19:00';
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Restaurants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by restaurant name or cuisine type..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Selected Restaurants List */}
      {restaurantServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Restaurants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {restaurantServices.map((service, index) => {
                const restaurantService = service as WizardRestaurantService;
                return (
                  <div
                    key={service.id || index}
                    className="flex items-start justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <UtensilsCrossed className="w-4 h-4 text-orange-600" />
                        <h4 className="font-semibold text-gray-900">{service.serviceName}</h4>
                        <Badge
                          variant={restaurantService.mealType === 'Lunch' ? 'default' : 'secondary'}
                        >
                          {restaurantService.mealType}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(service.serviceDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {restaurantService.numberOfGuests} guests
                        </div>
                      </div>
                      {service.serviceNotes && (
                        <p className="text-xs text-gray-500 mt-2">{service.serviceNotes}</p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-gray-600">Cost</p>
                      <p className="font-semibold text-gray-900">
                        {service.costCurrency} {service.costAmount.toFixed(2)}
                      </p>
                      <p className="text-sm text-green-600 font-medium">
                        Selling: {service.sellingCurrency} {service.sellingPrice.toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeService(services.indexOf(service))}
                        className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Restaurant Configuration Form */}
      {selectedRestaurant && (
        <Card className="border-blue-500 border-2 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Configure Reservation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedRestaurant.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedRestaurant.cuisineType && (
                      <Badge variant="outline">{selectedRestaurant.cuisineType}</Badge>
                    )}
                  </div>
                </div>
              </div>
              {selectedRestaurant.address && (
                <div className="flex items-start gap-2 text-sm text-gray-600 mt-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>{selectedRestaurant.address}</p>
                </div>
              )}
              {selectedRestaurant.phone && (
                <p className="text-xs text-gray-600 mt-1">Phone: {selectedRestaurant.phone}</p>
              )}
              {selectedRestaurant.capacity && (
                <p className="text-xs text-gray-600">
                  Capacity: {selectedRestaurant.capacity} guests
                </p>
              )}
            </div>

            {/* Meal Type Selection */}
            <div>
              <Label className="text-sm font-medium">Meal Type</Label>
              <Tabs
                value={formData.mealType}
                onValueChange={value => {
                  const mealType = value as MealType;
                  setFormData({
                    ...formData,
                    mealType,
                    serviceTime: getDefaultTimeForMeal(mealType),
                  });
                }}
                className="mt-2"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="Lunch">Lunch</TabsTrigger>
                  <TabsTrigger value="Dinner">Dinner</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <Label htmlFor="serviceDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Reservation Date
                </Label>
                <Input
                  id="serviceDate"
                  type="date"
                  value={formData.serviceDate}
                  onChange={e => setFormData({ ...formData, serviceDate: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Time */}
              <div>
                <Label htmlFor="serviceTime" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Reservation Time
                </Label>
                <Input
                  id="serviceTime"
                  type="time"
                  value={formData.serviceTime}
                  onChange={e => setFormData({ ...formData, serviceTime: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Number of Guests */}
              <div>
                <Label htmlFor="numGuests" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Number of Guests
                </Label>
                <Input
                  id="numGuests"
                  type="number"
                  min="1"
                  value={formData.numGuests}
                  onChange={e =>
                    setFormData({ ...formData, numGuests: parseInt(e.target.value) || 1 })
                  }
                  className="mt-1"
                />
              </div>

              {/* Menu Type */}
              <div>
                <Label htmlFor="menuType">Menu Type</Label>
                <select
                  id="menuType"
                  value={formData.menuType}
                  onChange={e => setFormData({ ...formData, menuType: e.target.value as MenuType })}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="Set Menu">Set Menu</option>
                  <option value="À la carte">À la carte</option>
                </select>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
              <textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={e => setFormData({ ...formData, specialRequests: e.target.value })}
                placeholder="Dietary restrictions, allergies, seating preferences, etc..."
                className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Pricing Display */}
            <div className="bg-white rounded-lg p-4 border-2 border-green-500">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Price per Guest:</span>
                  <span className="font-medium">
                    TRY{' '}
                    {formData.mealType === 'Lunch'
                      ? selectedRestaurant.lunchPrice || 0
                      : selectedRestaurant.dinnerPrice || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Number of Guests:</span>
                  <span className="font-medium">{formData.numGuests}</span>
                </div>
                <div className="pt-2 border-t flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Total Cost:</span>
                  <span className="text-lg font-semibold text-green-600">
                    TRY{' '}
                    {calculateRestaurantCost(
                      selectedRestaurant,
                      formData.mealType,
                      formData.numGuests
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRestaurant(null);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleAddRestaurant} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Add Reservation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Restaurants Grid */}
      {!selectedRestaurant && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Restaurants</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading restaurants...</p>
              </div>
            ) : filteredRestaurants && filteredRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRestaurants.map(restaurant => (
                  <div
                    key={restaurant.id}
                    className="p-4 border rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all"
                    onClick={() => setSelectedRestaurant(restaurant)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{restaurant.name}</h4>
                        {restaurant.cuisineType && (
                          <Badge variant="outline" className="mt-1">
                            {restaurant.cuisineType}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {restaurant.address && (
                      <div className="flex items-start gap-1 text-xs text-gray-600 mb-2">
                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <p className="line-clamp-1">{restaurant.address}</p>
                      </div>
                    )}
                    <div className="space-y-1 text-sm">
                      {restaurant.lunchPrice && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lunch:</span>
                          <span className="font-medium">TRY {restaurant.lunchPrice}</span>
                        </div>
                      )}
                      {restaurant.dinnerPrice && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dinner:</span>
                          <span className="font-medium">TRY {restaurant.dinnerPrice}</span>
                        </div>
                      )}
                      {restaurant.capacity && (
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Capacity:</span>
                          <span>{restaurant.capacity} guests</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <UtensilsCrossed className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  {tripDetails?.destinationCityId
                    ? 'No restaurants available in this city'
                    : 'Please select a destination city in Step 2'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

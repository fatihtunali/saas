/**
 * Step 4: Services Selection
 *
 * Allows adding various services to the booking including hotels, transfers,
 * tours, guides, restaurants, and extras.
 */

'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useBookingWizard } from '@/contexts/BookingWizardContext';
import { HotelSelectionTab } from './Step4Tabs/HotelSelectionTab';
import { TransferSelectionTab } from './Step4Tabs/TransferSelectionTab';
import { ToursTab } from './Step4Tabs/ToursTab';
import { GuidesTab } from './Step4Tabs/GuidesTab';
import { RestaurantsTab } from './Step4Tabs/RestaurantsTab';
import { ExtrasTab } from './Step4Tabs/ExtrasTab';
import { Hotel, Car, MapPin, UserCheck, UtensilsCrossed, Plus } from 'lucide-react';

export function Step4ServicesSelection() {
  const { services, nextStep, previousStep, markStepComplete } = useBookingWizard();

  const handleContinue = () => {
    markStepComplete(4);
    nextStep();
  };

  // Calculate totals
  const totalCost = services.reduce((sum, s) => sum + s.costInBaseCurrency * s.quantity, 0);
  const totalSelling = services.reduce((sum, s) => sum + s.sellingPrice * s.quantity, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Select Services</h2>
        <p className="mt-1 text-sm text-gray-500">
          Add hotels, transfers, tours, and other services to the booking
        </p>
      </div>

      {/* Services Summary Card */}
      {services.length > 0 && (
        <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">Services Summary</h4>
              <p className="text-sm text-gray-600 mt-1">{services.length} services selected</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">TRY {totalCost.toFixed(2)}</p>
              <p className="text-sm text-green-600 font-medium">
                Selling: TRY {totalSelling.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Service Selection Tabs */}
      <Tabs defaultValue="hotels" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="hotels" className="flex items-center gap-2">
            <Hotel className="w-4 h-4" />
            Hotels
          </TabsTrigger>
          <TabsTrigger value="transfers" className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            Transfers
          </TabsTrigger>
          <TabsTrigger value="tours" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Tours
          </TabsTrigger>
          <TabsTrigger value="guides" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Guides
          </TabsTrigger>
          <TabsTrigger value="restaurants" className="flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4" />
            Restaurants
          </TabsTrigger>
          <TabsTrigger value="extras" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Extras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hotels" className="mt-6">
          <HotelSelectionTab />
        </TabsContent>

        <TabsContent value="transfers" className="mt-6">
          <TransferSelectionTab />
        </TabsContent>

        <TabsContent value="tours" className="mt-6">
          <ToursTab />
        </TabsContent>

        <TabsContent value="guides" className="mt-6">
          <GuidesTab />
        </TabsContent>

        <TabsContent value="restaurants" className="mt-6">
          <RestaurantsTab />
        </TabsContent>

        <TabsContent value="extras" className="mt-6">
          <ExtrasTab />
        </TabsContent>
      </Tabs>

      {/* Detailed Services List */}
      {services.length > 0 && (
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Selected Services Details</h4>
          <div className="space-y-3">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {service.serviceType.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 mt-1">{service.serviceDescription}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {service.quantity}x @ {service.costCurrency} {service.costAmount.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Cost</p>
                  <p className="font-medium text-gray-900">
                    {service.costCurrency} {(service.costAmount * service.quantity).toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    Selling: {service.sellingCurrency}{' '}
                    {(service.sellingPrice * service.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {services.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gray-100 rounded-full">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services added yet</h3>
            <p className="text-sm text-gray-500">
              Start adding services by selecting from the tabs above. Services are optional but
              recommended for a complete booking.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={previousStep}>
          Back
        </Button>
        <Button onClick={handleContinue}>Continue to Pricing</Button>
      </div>
    </div>
  );
}

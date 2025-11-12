/**
 * Tour Selection Tab
 */

'use client';

import React, { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { useBookingWizard } from '@/contexts/BookingWizardContext';
import { useTourCompanies } from '@/lib/hooks/useBookingWizard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TourCompany, WizardServiceData } from '@/types/wizard';

export function TourSelectionTab() {
  const { tripDetails, addService, services, removeService } = useBookingWizard();
  const { data: tours, isLoading } = useTourCompanies();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTour, setSelectedTour] = useState<TourCompany | null>(null);

  const filteredTours = tours?.filter(tour =>
    tour.tourName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tourServices = services.filter(s => s.serviceType === 'tour');

  const handleAddTour = () => {
    if (!selectedTour || !tripDetails) return;

    const newService: WizardServiceData = {
      serviceType: 'tour',
      tourCompanyId: selectedTour.id,
      serviceDate: tripDetails.travelStartDate,
      serviceDescription: selectedTour.tourName,
      quantity: 1,
      costAmount: 0,
      costCurrency: 'TRY',
      exchangeRate: 1,
      costInBaseCurrency: 0,
      sellingPrice: 0,
      sellingCurrency: 'TRY',
    };

    addService(newService);
    setSelectedTour(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="tourSearch">Search Tours</Label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="tourSearch"
            type="text"
            placeholder="Search by tour name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {tourServices.length > 0 && (
        <div className="border rounded-lg p-4 bg-green-50">
          <h4 className="font-semibold text-green-900 mb-3">
            Selected Tours ({tourServices.length})
          </h4>
          <div className="space-y-2">
            {tourServices.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-3 rounded-md"
              >
                <p className="font-medium text-gray-900">{service.serviceDescription}</p>
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
          <p className="text-gray-500">Loading tours...</p>
        </div>
      ) : filteredTours && filteredTours.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTours.map(tour => (
            <Card
              key={tour.id}
              className={`p-4 cursor-pointer transition-all ${
                selectedTour?.id === tour.id
                  ? 'border-blue-500 border-2 bg-blue-50'
                  : 'hover:border-gray-400'
              }`}
              onClick={() => setSelectedTour(tour)}
            >
              <h4 className="font-semibold text-gray-900">{tour.tourName}</h4>
              {tour.tourName && (
                <p className="text-sm text-gray-600 mt-2">Contact: {tour.tourName}</p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No tours available</p>
        </div>
      )}

      {selectedTour && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <h4 className="font-semibold text-blue-900 mb-4">Add {selectedTour.tourName}</h4>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setSelectedTour(null)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddTour} className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Add Tour
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Guide Selection Tab
 */

'use client';

import React, { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { useBookingWizard } from '@/contexts/BookingWizardContext';
import { useGuides } from '@/lib/hooks/useBookingWizard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Guide, WizardServiceData } from '@/types/wizard';

export function GuideSelectionTab() {
  const { tripDetails, addService, services, removeService } = useBookingWizard();
  const { data: guides, isLoading } = useGuides();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  const filteredGuides = guides?.filter(guide =>
    guide.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const guideServices = services.filter(s => s.serviceType === 'guide');

  const handleAddGuide = () => {
    if (!selectedGuide || !tripDetails) return;

    const newService: WizardServiceData = {
      serviceType: 'guide',
      guideId: selectedGuide.id,
      serviceDate: tripDetails.travelStartDate,
      serviceDescription: `Guide: ${selectedGuide.fullName}`,
      quantity: 1,
      costAmount: selectedGuide.dailyRate || 0,
      costCurrency: 'TRY',
      exchangeRate: 1,
      costInBaseCurrency: selectedGuide.dailyRate || 0,
      sellingPrice: (selectedGuide.dailyRate || 0) * 1.2,
      sellingCurrency: 'TRY',
    };

    addService(newService);
    setSelectedGuide(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="guideSearch">Search Guides</Label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="guideSearch"
            type="text"
            placeholder="Search by guide name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {guideServices.length > 0 && (
        <div className="border rounded-lg p-4 bg-green-50">
          <h4 className="font-semibold text-green-900 mb-3">
            Selected Guides ({guideServices.length})
          </h4>
          <div className="space-y-2">
            {guideServices.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-3 rounded-md"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{service.serviceDescription}</p>
                  <p className="text-sm text-gray-600">
                    {service.costCurrency} {service.costAmount}
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
          <p className="text-gray-500">Loading guides...</p>
        </div>
      ) : filteredGuides && filteredGuides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGuides.map(guide => (
            <Card
              key={guide.id}
              className={`p-4 cursor-pointer transition-all ${
                selectedGuide?.id === guide.id
                  ? 'border-blue-500 border-2 bg-blue-50'
                  : 'hover:border-gray-400'
              }`}
              onClick={() => setSelectedGuide(guide)}
            >
              <h4 className="font-semibold text-gray-900">{guide.fullName}</h4>
              {guide.languages && (
                <p className="text-sm text-gray-600 mt-2">Languages: {guide.languages}</p>
              )}
              <p className="text-sm text-gray-600 mt-1">
                Daily Rate: {'TRY'} {guide.dailyRate}
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No guides available</p>
        </div>
      )}

      {selectedGuide && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <h4 className="font-semibold text-blue-900 mb-4">Add {selectedGuide.fullName}</h4>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setSelectedGuide(null)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddGuide} className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Add Guide
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

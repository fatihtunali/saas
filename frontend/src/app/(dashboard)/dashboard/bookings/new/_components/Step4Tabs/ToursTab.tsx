/**
 * Tours Tab - Step 4 Service Selection
 *
 * Allows selection of tours with SIC (Series in Coach) or PVT (Private) pricing.
 * Supports slab pricing based on passenger count for private tours.
 */

'use client';

import React, { useState } from 'react';
import { Search, Plus, X, Calendar, Clock, Users, Globe, MapPin } from 'lucide-react';
import { useBookingWizard } from '@/contexts/BookingWizardContext';
import { useTourCompanies } from '@/lib/hooks/useBookingWizard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TourCompany, WizardServiceData, WizardTourService } from '@/types/wizard';

interface TourFormData {
  tourDate: string;
  tourTime: string;
  tourType: 'SIC' | 'Private';
  numParticipants: number;
  language: string;
}

export function ToursTab() {
  const { tripDetails, addService, services, removeService } = useBookingWizard();
  const { data: tours, isLoading } = useTourCompanies();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTour, setSelectedTour] = useState<TourCompany | null>(null);
  const [formData, setFormData] = useState<TourFormData>({
    tourDate: tripDetails?.travelStartDate
      ? new Date(tripDetails.travelStartDate).toISOString().split('T')[0]
      : '',
    tourTime: '09:00',
    tourType: 'SIC',
    numParticipants: (tripDetails?.numAdults || 0) + (tripDetails?.numChildren || 0),
    language: 'English',
  });

  const filteredTours = tours?.filter(
    tour =>
      tour.tourName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.tourType?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tourServices = services.filter(s => s.serviceType === 'tour');

  // Calculate price based on tour type and passenger count
  const calculateTourPrice = (
    tour: TourCompany,
    tourType: 'SIC' | 'Private',
    participants: number
  ): number => {
    if (tourType === 'SIC') {
      return (tour.sicPrice || 0) * participants;
    }

    // Private tour - use slab pricing
    if (participants <= 2 && tour.privatePriceFor2Pax) return tour.privatePriceFor2Pax;
    if (participants <= 4 && tour.privatePriceFor4Pax) return tour.privatePriceFor4Pax;
    if (participants <= 6 && tour.privatePriceFor6Pax) return tour.privatePriceFor6Pax;
    if (participants <= 8 && tour.privatePriceFor8Pax) return tour.privatePriceFor8Pax;
    if (participants <= 10 && tour.privatePriceFor10Pax) return tour.privatePriceFor10Pax;

    // Default to highest slab if more than 10 pax
    return tour.privatePriceFor10Pax || 0;
  };

  const handleAddTour = () => {
    if (!selectedTour || !tripDetails || !formData.tourDate) return;

    const costAmount = calculateTourPrice(
      selectedTour,
      formData.tourType,
      formData.numParticipants
    );
    const sellingPrice = costAmount * 1.15; // 15% markup

    const newService: WizardTourService = {
      id: `tour-${Date.now()}`,
      serviceType: 'tour',
      tourCompanyId: selectedTour.id,
      serviceDate: new Date(formData.tourDate),
      serviceDescription: `${selectedTour.tourName} (${formData.tourType})`,
      serviceName: selectedTour.tourName,
      supplierName: `Tour Company #${selectedTour.id}`,
      quantity: 1,
      costAmount,
      costCurrency: 'TRY',
      exchangeRate: 1,
      costInBaseCurrency: costAmount,
      sellingPrice,
      sellingCurrency: 'TRY',
      tourType: formData.tourType,
      numberOfParticipants: formData.numParticipants,
      tourDate: new Date(formData.tourDate),
      serviceNotes: `Tour Time: ${formData.tourTime} | Language: ${formData.language} | ${formData.numParticipants} participants`,
    };

    addService(newService);
    setSelectedTour(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      tourDate: tripDetails?.travelStartDate
        ? new Date(tripDetails.travelStartDate).toISOString().split('T')[0]
        : '',
      tourTime: '09:00',
      tourType: 'SIC',
      numParticipants: (tripDetails?.numAdults || 0) + (tripDetails?.numChildren || 0),
      language: 'English',
    });
  };

  const getPricingDisplay = (tour: TourCompany) => {
    if (formData.tourType === 'SIC') {
      return (
        <div className="text-sm">
          <span className="text-gray-600">Per Person:</span>
          <span className="ml-2 font-semibold text-green-600">TRY {tour.sicPrice || 0}</span>
          <div className="text-xs text-gray-500 mt-1">
            Total: TRY {((tour.sicPrice || 0) * formData.numParticipants).toFixed(2)}
          </div>
        </div>
      );
    }

    // Private tour pricing
    const price = calculateTourPrice(tour, 'Private', formData.numParticipants);
    return (
      <div className="text-sm space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Private Tour ({formData.numParticipants} pax):</span>
          <span className="font-semibold text-green-600">TRY {price.toFixed(2)}</span>
        </div>
        <div className="text-xs text-gray-500">
          Available slabs:
          {tour.privatePriceFor2Pax && ' 2-pax'}
          {tour.privatePriceFor4Pax && ' 4-pax'}
          {tour.privatePriceFor6Pax && ' 6-pax'}
          {tour.privatePriceFor8Pax && ' 8-pax'}
          {tour.privatePriceFor10Pax && ' 10-pax'}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Tours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by tour name or type..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Selected Tours List */}
      {tourServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Tours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tourServices.map((service, index) => {
                const tourService = service as WizardTourService;
                return (
                  <div
                    key={service.id || index}
                    className="flex items-start justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{service.serviceName}</h4>
                        <Badge variant={tourService.tourType === 'SIC' ? 'default' : 'secondary'}>
                          {tourService.tourType}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(service.serviceDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {tourService.numberOfParticipants} participants
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

      {/* Tour Selection */}
      {selectedTour && (
        <Card className="border-blue-500 border-2 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Configure Tour</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-2">{selectedTour.tourName}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Type:</span> {selectedTour.tourType}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {selectedTour.duration}
                </div>
              </div>
              {selectedTour.itinerary && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium text-gray-700 mb-1">Itinerary:</p>
                  <p className="text-xs text-gray-600">{selectedTour.itinerary}</p>
                </div>
              )}
              {selectedTour.inclusions && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-green-700">Inclusions:</p>
                  <p className="text-xs text-gray-600">{selectedTour.inclusions}</p>
                </div>
              )}
              {selectedTour.exclusions && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-red-700">Exclusions:</p>
                  <p className="text-xs text-gray-600">{selectedTour.exclusions}</p>
                </div>
              )}
            </div>

            {/* Tour Type Toggle */}
            <div>
              <Label className="text-sm font-medium">Tour Type</Label>
              <Tabs
                value={formData.tourType}
                onValueChange={value =>
                  setFormData({ ...formData, tourType: value as 'SIC' | 'Private' })
                }
                className="mt-2"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="SIC">SIC (Seat in Coach)</TabsTrigger>
                  <TabsTrigger value="Private">Private Tour</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <Label htmlFor="tourDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Tour Date
                </Label>
                <Input
                  id="tourDate"
                  type="date"
                  value={formData.tourDate}
                  onChange={e => setFormData({ ...formData, tourDate: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Time */}
              <div>
                <Label htmlFor="tourTime" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Tour Time
                </Label>
                <Input
                  id="tourTime"
                  type="time"
                  value={formData.tourTime}
                  onChange={e => setFormData({ ...formData, tourTime: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Participants */}
              <div>
                <Label htmlFor="numParticipants" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Participants
                </Label>
                <Input
                  id="numParticipants"
                  type="number"
                  min="1"
                  value={formData.numParticipants}
                  onChange={e =>
                    setFormData({ ...formData, numParticipants: parseInt(e.target.value) || 1 })
                  }
                  className="mt-1"
                />
              </div>

              {/* Language */}
              <div>
                <Label htmlFor="language" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Language
                </Label>
                <select
                  id="language"
                  value={formData.language}
                  onChange={e => setFormData({ ...formData, language: e.target.value })}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Turkish">Turkish</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Japanese">Japanese</option>
                </select>
              </div>
            </div>

            {/* Pricing Display */}
            <div className="bg-white rounded-lg p-4 border-2 border-green-500">
              {getPricingDisplay(selectedTour)}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTour(null);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleAddTour} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Add Tour
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Tours Grid */}
      {!selectedTour && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Tours</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading tours...</p>
              </div>
            ) : filteredTours && filteredTours.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTours.map(tour => (
                  <div
                    key={tour.id}
                    className="p-4 border rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                    onClick={() => setSelectedTour(tour)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{tour.tourName}</h4>
                      <Badge variant="outline">{tour.tourType}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{tour.duration}</p>
                    <div className="space-y-1">
                      {tour.sicPrice && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">SIC (per person):</span>
                          <span className="font-medium">TRY {tour.sicPrice}</span>
                        </div>
                      )}
                      {tour.privatePriceFor2Pax && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Private (2 pax):</span>
                          <span className="font-medium">TRY {tour.privatePriceFor2Pax}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No tours available</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

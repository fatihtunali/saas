/**
 * Guides Tab - Step 4 Service Selection
 *
 * Allows selection of guides with different service types and pricing options.
 * Supports hourly, half-day, daily, and night rates.
 */

'use client';

import React, { useState } from 'react';
import { Search, Plus, X, Calendar, Clock, Globe, User, DollarSign } from 'lucide-react';
import { useBookingWizard } from '@/contexts/BookingWizardContext';
import { useGuides } from '@/lib/hooks/useBookingWizard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { Guide, WizardServiceData, WizardGuideService } from '@/types/wizard';

type ServiceTypeDetail = 'Full Day' | 'Half Day' | 'Night' | 'Transfer';
type RateType = 'hourly' | 'halfDay' | 'daily' | 'night' | 'transfer';

interface GuideFormData {
  serviceDate: string;
  serviceTime: string;
  serviceTypeDetail: ServiceTypeDetail;
  rateType: RateType;
  durationHours: number;
  selectedLanguages: string[];
  specialNotes: string;
}

export function GuidesTab() {
  const { tripDetails, addService, services, removeService } = useBookingWizard();
  const { data: guides, isLoading } = useGuides();

  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string>('');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [formData, setFormData] = useState<GuideFormData>({
    serviceDate: tripDetails?.travelStartDate
      ? new Date(tripDetails.travelStartDate).toISOString().split('T')[0]
      : '',
    serviceTime: '09:00',
    serviceTypeDetail: 'Full Day',
    rateType: 'daily',
    durationHours: 8,
    selectedLanguages: ['English'],
    specialNotes: '',
  });

  const filteredGuides = guides?.filter(guide => {
    const matchesSearch = guide.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage =
      !languageFilter ||
      (Array.isArray(guide.languages)
        ? guide.languages.some(lang =>
            String(lang).toLowerCase().includes(languageFilter.toLowerCase())
          )
        : String(guide.languages || '')
            .toLowerCase()
            .includes(languageFilter.toLowerCase()));
    return matchesSearch && matchesLanguage;
  });

  const guideServices = services.filter(s => s.serviceType === 'guide');

  // Calculate guide cost based on rate type
  const calculateGuideCost = (guide: Guide, rateType: RateType, hours: number): number => {
    switch (rateType) {
      case 'hourly':
        // Assuming hourly rate is daily rate / 8
        return (guide.dailyRate / 8) * hours;
      case 'halfDay':
        return guide.halfDayRate || guide.dailyRate * 0.6;
      case 'daily':
        return guide.dailyRate;
      case 'night':
        return guide.nightRate || guide.dailyRate * 1.2;
      case 'transfer':
        return guide.transferRate || guide.dailyRate * 0.3;
      default:
        return guide.dailyRate;
    }
  };

  const handleAddGuide = () => {
    if (!selectedGuide || !tripDetails || !formData.serviceDate) return;

    const costAmount = calculateGuideCost(selectedGuide, formData.rateType, formData.durationHours);
    const sellingPrice = costAmount * 1.2; // 20% markup

    const newService: WizardGuideService = {
      id: `guide-${Date.now()}`,
      serviceType: 'guide',
      guideId: selectedGuide.id,
      serviceDate: new Date(formData.serviceDate),
      serviceDescription: `Guide: ${selectedGuide.fullName} (${formData.serviceTypeDetail})`,
      serviceName: selectedGuide.fullName,
      supplierName: `Guide #${selectedGuide.id}`,
      quantity: 1,
      costAmount,
      costCurrency: 'TRY',
      exchangeRate: 1,
      costInBaseCurrency: costAmount,
      sellingPrice,
      sellingCurrency: 'TRY',
      serviceTypeDetail: formData.serviceTypeDetail,
      languages: formData.selectedLanguages,
      serviceNotes: `Time: ${formData.serviceTime} | Duration: ${formData.durationHours}h | Rate: ${formData.rateType}${formData.specialNotes ? ' | ' + formData.specialNotes : ''}`,
    };

    addService(newService);
    setSelectedGuide(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      serviceDate: tripDetails?.travelStartDate
        ? new Date(tripDetails.travelStartDate).toISOString().split('T')[0]
        : '',
      serviceTime: '09:00',
      serviceTypeDetail: 'Full Day',
      rateType: 'daily',
      durationHours: 8,
      selectedLanguages: ['English'],
      specialNotes: '',
    });
  };

  const getRateTypeLabel = (rateType: RateType): string => {
    const labels: Record<RateType, string> = {
      hourly: 'Hourly Rate',
      halfDay: 'Half Day Rate',
      daily: 'Daily Rate',
      night: 'Night Rate',
      transfer: 'Transfer Rate',
    };
    return labels[rateType];
  };

  const formatLanguages = (languages: string | string[]): string => {
    if (Array.isArray(languages)) {
      return languages.join(', ');
    }
    return languages || 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Guides</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by guide name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div>
            <Label htmlFor="languageFilter" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Filter by Language
            </Label>
            <Input
              id="languageFilter"
              type="text"
              placeholder="e.g., English, Spanish..."
              value={languageFilter}
              onChange={e => setLanguageFilter(e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Selected Guides List */}
      {guideServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Guides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {guideServices.map((service, index) => {
                const guideService = service as WizardGuideService;
                return (
                  <div
                    key={service.id || index}
                    className="flex items-start justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-purple-600" />
                        <h4 className="font-semibold text-gray-900">{service.serviceName}</h4>
                        <Badge variant="secondary">{guideService.serviceTypeDetail}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(service.serviceDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {guideService.languages?.join(', ') || 'N/A'}
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

      {/* Guide Configuration Form */}
      {selectedGuide && (
        <Card className="border-blue-500 border-2 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Configure Guide Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedGuide.fullName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-600">
                      Languages: {formatLanguages(selectedGuide.languages)}
                    </p>
                  </div>
                </div>
                {selectedGuide.specializations && selectedGuide.specializations.length > 0 && (
                  <Badge variant="outline">
                    {Array.isArray(selectedGuide.specializations)
                      ? selectedGuide.specializations[0]
                      : selectedGuide.specializations}
                  </Badge>
                )}
              </div>
              {selectedGuide.email && (
                <p className="text-xs text-gray-600">Email: {selectedGuide.email}</p>
              )}
              {selectedGuide.phone && (
                <p className="text-xs text-gray-600">Phone: {selectedGuide.phone}</p>
              )}
            </div>

            {/* Service Type */}
            <div>
              <Label htmlFor="serviceTypeDetail">Service Type</Label>
              <select
                id="serviceTypeDetail"
                value={formData.serviceTypeDetail}
                onChange={e => {
                  const serviceType = e.target.value as ServiceTypeDetail;
                  let rateType: RateType = 'daily';
                  let duration = 8;

                  if (serviceType === 'Half Day') {
                    rateType = 'halfDay';
                    duration = 4;
                  } else if (serviceType === 'Night') {
                    rateType = 'night';
                    duration = 4;
                  } else if (serviceType === 'Transfer') {
                    rateType = 'transfer';
                    duration = 2;
                  }

                  setFormData({
                    ...formData,
                    serviceTypeDetail: serviceType,
                    rateType,
                    durationHours: duration,
                  });
                }}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Full Day">Full Day</option>
                <option value="Half Day">Half Day</option>
                <option value="Night">Night</option>
                <option value="Transfer">Airport/Hotel Transfer</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <Label htmlFor="serviceDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Service Date
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
                  Start Time
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

            {/* Pricing Selector */}
            <div>
              <Label htmlFor="rateType" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pricing Type
              </Label>
              <select
                id="rateType"
                value={formData.rateType}
                onChange={e => setFormData({ ...formData, rateType: e.target.value as RateType })}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="hourly">Hourly Rate</option>
                <option value="halfDay">Half Day Rate</option>
                <option value="daily">Daily Rate</option>
                <option value="night">Night Rate</option>
                <option value="transfer">Transfer Rate</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <Label htmlFor="durationHours">Duration (hours)</Label>
              <Input
                id="durationHours"
                type="number"
                min="1"
                max="24"
                value={formData.durationHours}
                onChange={e =>
                  setFormData({ ...formData, durationHours: parseInt(e.target.value) || 1 })
                }
                className="mt-1"
              />
            </div>

            {/* Special Notes */}
            <div>
              <Label htmlFor="specialNotes">Special Notes (Optional)</Label>
              <textarea
                id="specialNotes"
                value={formData.specialNotes}
                onChange={e => setFormData({ ...formData, specialNotes: e.target.value })}
                placeholder="Any special requirements or notes..."
                className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Pricing Display */}
            <div className="bg-white rounded-lg p-4 border-2 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {getRateTypeLabel(formData.rateType)}
                </span>
                <span className="text-lg font-semibold text-green-600">
                  TRY{' '}
                  {calculateGuideCost(
                    selectedGuide,
                    formData.rateType,
                    formData.durationHours
                  ).toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Daily Rate:</span>
                  <span>TRY {selectedGuide.dailyRate}</span>
                </div>
                {selectedGuide.halfDayRate && (
                  <div className="flex justify-between">
                    <span>Half Day Rate:</span>
                    <span>TRY {selectedGuide.halfDayRate}</span>
                  </div>
                )}
                {selectedGuide.nightRate && (
                  <div className="flex justify-between">
                    <span>Night Rate:</span>
                    <span>TRY {selectedGuide.nightRate}</span>
                  </div>
                )}
                {selectedGuide.transferRate && (
                  <div className="flex justify-between">
                    <span>Transfer Rate:</span>
                    <span>TRY {selectedGuide.transferRate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedGuide(null);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleAddGuide} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Add Guide
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Guides Grid */}
      {!selectedGuide && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Guides</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading guides...</p>
              </div>
            ) : filteredGuides && filteredGuides.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGuides.map(guide => (
                  <div
                    key={guide.id}
                    className="p-4 border rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
                    onClick={() => setSelectedGuide(guide)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{guide.fullName}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <Globe className="w-3 h-3 text-gray-500" />
                          <p className="text-xs text-gray-600">
                            {formatLanguages(guide.languages)}
                          </p>
                        </div>
                      </div>
                    </div>
                    {guide.specializations && guide.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(Array.isArray(guide.specializations)
                          ? guide.specializations.slice(0, 2)
                          : [guide.specializations]
                        ).map((spec, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Daily Rate:</span>
                        <span className="font-medium">TRY {guide.dailyRate}</span>
                      </div>
                      {guide.halfDayRate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Half Day:</span>
                          <span className="font-medium">TRY {guide.halfDayRate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  {languageFilter
                    ? 'No guides found with the selected language'
                    : 'No guides available'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

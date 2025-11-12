/**
 * Transfer Selection Tab
 *
 * Allows selecting transfer routes and adding them to the booking services.
 * Enhanced with transfer types, vehicle types, time pickers, and meet & greet.
 */

'use client';

import React, { useState } from 'react';
import { Search, Plus, X, Car, Clock, MapPin, Languages, CheckCircle } from 'lucide-react';
import { useBookingWizard } from '@/contexts/BookingWizardContext';
import { useTransferRoutes, useVehicleRentals, useCities } from '@/lib/hooks/useBookingWizard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TransferRoute, WizardServiceData, VehicleRental } from '@/types/wizard';
import { format } from 'date-fns';

const TRANSFER_TYPES = [
  { value: 'point-to-point', label: 'Point-to-Point' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'full-day', label: 'Full Day' },
];

const DRIVER_LANGUAGES = [
  'English',
  'Turkish',
  'German',
  'French',
  'Spanish',
  'Russian',
  'Arabic',
  'Chinese',
];

export function TransferSelectionTab() {
  const { tripDetails, addService, services, removeService } = useBookingWizard();
  const { data: transfers, isLoading } = useTransferRoutes();
  const { data: vehicles } = useVehicleRentals();
  const { data: cities } = useCities();

  // Transfer selection and configuration state
  const [searchQuery, setSearchQuery] = useState('');
  const [transferType, setTransferType] = useState('point-to-point');
  const [fromCityId, setFromCityId] = useState<number | undefined>();
  const [toCityId, setToCityId] = useState<number | undefined>();
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRoute | null>(null);

  // Transfer details state
  const [transferDate, setTransferDate] = useState(
    tripDetails?.travelStartDate ? format(tripDetails.travelStartDate, 'yyyy-MM-dd') : ''
  );
  const [transferTime, setTransferTime] = useState('09:00');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | undefined>();
  const [driverLanguage, setDriverLanguage] = useState('English');
  const [meetAndGreet, setMeetAndGreet] = useState(false);
  const [customFromLocation, setCustomFromLocation] = useState('');
  const [customToLocation, setCustomToLocation] = useState('');

  // Filter transfers by cities and search
  const { data: filteredTransfersData } = useTransferRoutes(fromCityId, toCityId);
  const filteredTransfers = filteredTransfersData?.filter(
    transfer =>
      transfer.fromCityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.toCityName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const transferServices = services.filter(s => s.serviceType === 'transfer');

  const calculateTransferCost = () => {
    if (transferType === 'point-to-point' && selectedTransfer) {
      return selectedTransfer.pricePerVehicle || 0;
    }

    if (selectedVehicleId && vehicles) {
      const vehicle = vehicles.find(v => v.id === selectedVehicleId);
      if (vehicle) {
        if (transferType === 'hourly') {
          return vehicle.perHourRate || 0;
        } else if (transferType === 'full-day') {
          return vehicle.fullDayRate || 0;
        }
      }
    }

    return 0;
  };

  const handleAddTransfer = () => {
    if (!tripDetails || !transferDate) return;

    const cost = calculateTransferCost();
    const selectedVehicle = vehicles?.find(v => v.id === selectedVehicleId);

    let description = '';
    if (transferType === 'point-to-point' && selectedTransfer) {
      description = `${selectedTransfer.fromCityName} → ${selectedTransfer.toCityName}`;
    } else if (customFromLocation && customToLocation) {
      description = `${customFromLocation} → ${customToLocation}`;
    } else {
      description = `Transfer - ${transferType}`;
    }

    if (selectedVehicle) {
      description += ` (${selectedVehicle.vehicleName || selectedVehicle.vehicleType})`;
    }

    const newService: WizardServiceData = {
      serviceType: 'transfer',
      transferRouteId: selectedTransfer?.id,
      vehicleRentalId: selectedVehicleId,
      serviceDate: new Date(transferDate),
      serviceDescription: description,
      serviceName: description,
      quantity: 1,
      costAmount: cost,
      costCurrency: 'TRY',
      exchangeRate: 1,
      costInBaseCurrency: cost,
      sellingPrice: cost * 1.2,
      sellingCurrency: 'TRY',
      pickupTime: transferTime,
      serviceNotes: `Type: ${transferType}, Time: ${transferTime}, Driver Language: ${driverLanguage}, Meet & Greet: ${meetAndGreet ? 'Yes' : 'No'}`,
    };

    addService(newService);

    // Reset form
    setSelectedTransfer(null);
    setSelectedVehicleId(undefined);
    setCustomFromLocation('');
    setCustomToLocation('');
    setMeetAndGreet(false);
  };

  return (
    <div className="space-y-6">
      {/* Transfer Type and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="transferType">Transfer Type</Label>
          <Select value={transferType} onValueChange={setTransferType}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRANSFER_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {transferType === 'point-to-point' && (
          <>
            <div>
              <Label htmlFor="fromCity">From City</Label>
              <Select
                value={fromCityId?.toString() || ''}
                onValueChange={value => setFromCityId(value ? parseInt(value) : undefined)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any City</SelectItem>
                  {cities?.map(city => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="toCity">To City</Label>
              <Select
                value={toCityId?.toString() || ''}
                onValueChange={value => setToCityId(value ? parseInt(value) : undefined)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any City</SelectItem>
                  {cities?.map(city => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* Search */}
      {transferType === 'point-to-point' && (
        <div>
          <Label htmlFor="transferSearch">Search Routes</Label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="transferSearch"
              type="text"
              placeholder="Search by route name or cities..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Selected Transfers Summary */}
      {transferServices.length > 0 && (
        <div className="border rounded-lg p-4 bg-green-50">
          <h4 className="font-semibold text-green-900 mb-3">
            Selected Transfers ({transferServices.length})
          </h4>
          <div className="space-y-2">
            {transferServices.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-3 rounded-md"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Car className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{service.serviceDescription}</p>
                    <p className="text-sm text-gray-600">
                      {service.costCurrency} {service.costAmount}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900">
                    {service.sellingCurrency} {service.sellingPrice.toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeService(services.indexOf(service))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transfer Selection - Point to Point */}
      {transferType === 'point-to-point' && (
        <>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading transfers...</p>
            </div>
          ) : filteredTransfers && filteredTransfers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTransfers.map(transfer => (
                <Card
                  key={transfer.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedTransfer?.id === transfer.id
                      ? 'border-blue-500 border-2 bg-blue-50'
                      : 'hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedTransfer(transfer)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-gray-900">
                        {transfer.fromCityName} → {transfer.toCityName}
                      </h4>
                      <Car className="w-5 h-5 text-gray-400" />
                    </div>

                    <div className="pt-2 border-t space-y-1">
                      {transfer.distance && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Distance:</span>
                          <span className="font-medium">{transfer.distance} km</span>
                        </div>
                      )}
                      {transfer.estimatedDuration && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{transfer.estimatedDuration}</span>
                        </div>
                      )}
                      {transfer.vehicleTypeName && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Vehicle:</span>
                          <span className="font-medium">{transfer.vehicleTypeName}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Price per vehicle:</span>
                        <span className="font-medium">TRY {transfer.pricePerVehicle || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">
                {searchQuery ? 'No transfers found matching your search' : 'No transfers available'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Custom Route Input - Hourly or Full Day */}
      {transferType !== 'point-to-point' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customFrom" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              From Location
            </Label>
            <Input
              id="customFrom"
              value={customFromLocation}
              onChange={e => setCustomFromLocation(e.target.value)}
              placeholder="Enter pickup location"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="customTo" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              To Location
            </Label>
            <Input
              id="customTo"
              value={customToLocation}
              onChange={e => setCustomToLocation(e.target.value)}
              placeholder="Enter drop-off location"
              className="mt-2"
            />
          </div>
        </div>
      )}

      {/* Configure Transfer Form */}
      {(selectedTransfer ||
        (transferType !== 'point-to-point' && customFromLocation && customToLocation)) && (
        <div className="border rounded-lg p-6 bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-blue-900 text-lg">
              Configure Transfer
              {selectedTransfer &&
                `: ${selectedTransfer.fromCityName} → ${selectedTransfer.toCityName}`}
            </h4>
            <Badge variant="secondary">{transferType}</Badge>
          </div>

          <div className="space-y-4">
            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transferDate" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Transfer Date
                </Label>
                <Input
                  id="transferDate"
                  type="date"
                  value={transferDate}
                  onChange={e => setTransferDate(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="transferTime" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pickup Time
                </Label>
                <Input
                  id="transferTime"
                  type="time"
                  value={transferTime}
                  onChange={e => setTransferTime(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Vehicle Selection */}
            <div>
              <Label htmlFor="vehicleType" className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                Vehicle Type
              </Label>
              <Select
                value={selectedVehicleId?.toString() || ''}
                onValueChange={value => setSelectedVehicleId(value ? parseInt(value) : undefined)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles?.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.vehicleName || vehicle.vehicleType} - Capacity: {vehicle.capacity}
                      {transferType === 'hourly' && ` - TRY ${vehicle.perHourRate || 0}/hour`}
                      {transferType === 'full-day' && ` - TRY ${vehicle.fullDayRate || 0}/day`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Vehicle Details */}
            {selectedVehicleId && vehicles && (
              <div className="p-3 bg-white rounded-md">
                {(() => {
                  const vehicle = vehicles.find(v => v.id === selectedVehicleId);
                  if (!vehicle) return null;
                  return (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vehicle:</span>
                        <span className="font-medium">
                          {vehicle.vehicleName || vehicle.vehicleType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-medium">{vehicle.capacity} passengers</span>
                      </div>
                      {vehicle.perKmRate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Per KM Rate:</span>
                          <span className="font-medium">TRY {vehicle.perKmRate}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Driver Language */}
            <div>
              <Label htmlFor="driverLanguage" className="flex items-center gap-2">
                <Languages className="w-4 h-4" />
                Driver Language
              </Label>
              <Select value={driverLanguage} onValueChange={setDriverLanguage}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DRIVER_LANGUAGES.map(lang => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Meet & Greet Checkbox */}
            <div className="flex items-center space-x-2 p-3 bg-white rounded-md">
              <Checkbox
                id="meetAndGreet"
                checked={meetAndGreet}
                onCheckedChange={checked => setMeetAndGreet(checked === true)}
              />
              <Label
                htmlFor="meetAndGreet"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 text-green-600" />
                Meet & Greet Service (driver will meet at arrival gate)
              </Label>
            </div>

            {/* Pricing Summary */}
            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Base Price:</span>
                <span className="font-medium">TRY {calculateTransferCost().toFixed(2)}</span>
              </div>
              {meetAndGreet && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Meet & Greet:</span>
                  <span className="font-medium">TRY 50.00</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-semibold text-gray-900">Total Cost:</span>
                <span className="text-lg font-bold text-gray-900">
                  TRY {(calculateTransferCost() + (meetAndGreet ? 50 : 0)).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600">Selling Price (20% markup):</span>
                <span className="text-lg font-bold text-green-600">
                  TRY {((calculateTransferCost() + (meetAndGreet ? 50 : 0)) * 1.2).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTransfer(null);
                  setCustomFromLocation('');
                  setCustomToLocation('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddTransfer}
                className="flex-1"
                disabled={
                  !transferDate || (!selectedTransfer && !(customFromLocation && customToLocation))
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Transfer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

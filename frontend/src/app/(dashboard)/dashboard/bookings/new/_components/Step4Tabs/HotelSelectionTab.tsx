/**
 * Hotel Selection Tab
 *
 * Allows selecting hotels and adding them to the booking services.
 * Enhanced with room types, meal plans, date pickers, and passenger capacity.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Calendar, Users, Bed, UtensilsCrossed } from 'lucide-react';
import { useBookingWizard } from '@/contexts/BookingWizardContext';
import { useHotels, useHotelRoomTypes, useCities } from '@/lib/hooks/useBookingWizard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Hotel, WizardServiceData, HotelRoomType } from '@/types/wizard';
import { differenceInDays, format } from 'date-fns';

const MEAL_PLANS = [
  { value: 'RO', label: 'Room Only' },
  { value: 'BB', label: 'Bed & Breakfast' },
  { value: 'HB', label: 'Half Board' },
  { value: 'FB', label: 'Full Board' },
  { value: 'AI', label: 'All Inclusive' },
];

export function HotelSelectionTab() {
  const { tripDetails, addService, services, removeService } = useBookingWizard();
  const { data: hotels, isLoading } = useHotels(tripDetails?.destinationCityId);
  const { data: cities } = useCities();

  // Hotel selection and configuration state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityId, setSelectedCityId] = useState<number | undefined>(
    tripDetails?.destinationCityId
  );
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  // Hotel details state
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<number | undefined>();
  const [mealPlan, setMealPlan] = useState('BB');
  const [checkInDate, setCheckInDate] = useState(
    tripDetails?.travelStartDate ? format(tripDetails.travelStartDate, 'yyyy-MM-dd') : ''
  );
  const [checkOutDate, setCheckOutDate] = useState(
    tripDetails?.travelEndDate ? format(tripDetails.travelEndDate, 'yyyy-MM-dd') : ''
  );
  const [numberOfRooms, setNumberOfRooms] = useState(1);
  const [numAdults, setNumAdults] = useState(tripDetails?.numAdults || 2);
  const [numChildren, setNumChildren] = useState(tripDetails?.numChildren || 0);

  // Fetch room types when hotel is selected
  const { data: roomTypes, isLoading: roomTypesLoading } = useHotelRoomTypes(
    selectedHotel?.id || 0,
    !!selectedHotel
  );

  // Calculate number of nights
  const numberOfNights =
    checkInDate && checkOutDate
      ? differenceInDays(new Date(checkOutDate), new Date(checkInDate))
      : 0;

  // Filter hotels by search and city
  const { data: cityFilteredHotels } = useHotels(selectedCityId);
  const filteredHotels = cityFilteredHotels?.filter(
    hotel =>
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hotelServices = services.filter(s => s.serviceType === 'hotel');

  // Reset room type when hotel changes
  useEffect(() => {
    setSelectedRoomTypeId(undefined);
  }, [selectedHotel?.id]);

  const calculateHotelCost = () => {
    if (!selectedHotel || !numberOfNights || numberOfNights <= 0) return 0;

    // Base price calculation
    let basePrice = selectedHotel.pricePerPersonDoubleOccupancy || 0;

    // If room type is selected, use its price
    if (selectedRoomTypeId && roomTypes) {
      const roomType = roomTypes.find(rt => rt.id === selectedRoomTypeId);
      if (roomType) {
        basePrice = roomType.pricePerNight;
      }
    }

    // Calculate total cost: price per night * nights * rooms * adults
    return basePrice * numberOfNights * numberOfRooms * numAdults;
  };

  const handleAddHotel = () => {
    if (!selectedHotel || !tripDetails || !checkInDate || !checkOutDate) return;

    const totalCost = calculateHotelCost();
    const selectedRoomType = roomTypes?.find(rt => rt.id === selectedRoomTypeId);
    const roomTypeName = selectedRoomType?.roomTypeName || 'Standard Room';

    const newService: WizardServiceData = {
      serviceType: 'hotel',
      hotelId: selectedHotel.id,
      serviceDate: new Date(checkInDate),
      serviceDescription: `${selectedHotel.name} - ${roomTypeName} - ${mealPlan} - ${numberOfRooms} room(s) - ${numberOfNights} night(s)`,
      serviceName: selectedHotel.name,
      quantity: numberOfRooms,
      costAmount: totalCost,
      costCurrency: 'TRY',
      exchangeRate: 1,
      costInBaseCurrency: totalCost,
      sellingPrice: totalCost * 1.2, // 20% markup
      sellingCurrency: 'TRY',
      serviceNotes: `Check-in: ${checkInDate}, Check-out: ${checkOutDate}, Adults: ${numAdults}, Children: ${numChildren}, Meal: ${mealPlan}`,
    };

    addService(newService);

    // Reset form
    setSelectedHotel(null);
    setSelectedRoomTypeId(undefined);
    setNumberOfRooms(1);
    setMealPlan('BB');
  };

  return (
    <div className="space-y-6">
      {/* City and Search Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cityFilter">Filter by City</Label>
          <Select
            value={selectedCityId?.toString() || ''}
            onValueChange={value => setSelectedCityId(value ? parseInt(value) : undefined)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="All cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Cities</SelectItem>
              {cities?.map(city => (
                <SelectItem key={city.id} value={city.id.toString()}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="hotelSearch">Search Hotels</Label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="hotelSearch"
              type="text"
              placeholder="Search by hotel name or location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Selected Hotels Summary */}
      {hotelServices.length > 0 && (
        <div className="border rounded-lg p-4 bg-green-50">
          <h4 className="font-semibold text-green-900 mb-3">
            Selected Hotels ({hotelServices.length})
          </h4>
          <div className="space-y-2">
            {hotelServices.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-3 rounded-md"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{service.serviceDescription}</p>
                  <p className="text-sm text-gray-600">
                    {service.costCurrency} {service.costAmount} x {service.quantity}
                  </p>
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

      {/* Hotel Selection */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading hotels...</p>
        </div>
      ) : filteredHotels && filteredHotels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHotels.map(hotel => (
            <Card
              key={hotel.id}
              className={`p-4 cursor-pointer transition-all ${
                selectedHotel?.id === hotel.id
                  ? 'border-blue-500 border-2 bg-blue-50'
                  : 'hover:border-gray-400'
              }`}
              onClick={() => setSelectedHotel(hotel)}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-gray-900">{hotel.name}</h4>
                  <Badge variant="secondary">
                    {hotel.starRating ? `${hotel.starRating}⭐` : 'Unrated'}
                  </Badge>
                </div>

                {hotel.address && <p className="text-sm text-gray-600">{hotel.address}</p>}

                <div className="pt-2 border-t space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Per Person (Double):</span>
                    <span className="font-medium">
                      {'TRY'} {hotel.pricePerPersonDoubleOccupancy || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Per Person (Single):</span>
                    <span className="font-medium">
                      {'TRY'} {hotel.singleSupplement || 'N/A'}
                    </span>
                  </div>
                </div>

                {hotel.phone && <p className="text-xs text-gray-500 pt-2">Phone: {hotel.phone}</p>}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">
            {searchQuery ? 'No hotels found matching your search' : 'No hotels available'}
          </p>
        </div>
      )}

      {/* Add Hotel Form */}
      {selectedHotel && (
        <div className="border rounded-lg p-6 bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-blue-900 text-lg">Configure {selectedHotel.name}</h4>
            <Badge variant="secondary">{selectedHotel.starRating}⭐</Badge>
          </div>

          <div className="space-y-4">
            {/* Room Type Selection */}
            <div>
              <Label htmlFor="roomType" className="flex items-center gap-2">
                <Bed className="w-4 h-4" />
                Room Type
              </Label>
              <Select
                value={selectedRoomTypeId?.toString() || ''}
                onValueChange={value => setSelectedRoomTypeId(value ? parseInt(value) : undefined)}
                disabled={roomTypesLoading || !roomTypes || roomTypes.length === 0}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue
                    placeholder={roomTypesLoading ? 'Loading room types...' : 'Select room type'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes?.map(roomType => (
                    <SelectItem key={roomType.id} value={roomType.id.toString()}>
                      {roomType.roomTypeName} - {roomType.bedType} (Capacity: {roomType.capacity}) -
                      TRY {roomType.pricePerNight}/night
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Meal Plan */}
            <div>
              <Label htmlFor="mealPlan" className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4" />
                Meal Plan
              </Label>
              <Select value={mealPlan} onValueChange={setMealPlan}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_PLANS.map(plan => (
                    <SelectItem key={plan.value} value={plan.value}>
                      {plan.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Check-in and Check-out Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkInDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Check-in Date
                </Label>
                <Input
                  id="checkInDate"
                  type="date"
                  value={checkInDate}
                  onChange={e => setCheckInDate(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="checkOutDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Check-out Date
                </Label>
                <Input
                  id="checkOutDate"
                  type="date"
                  value={checkOutDate}
                  onChange={e => setCheckOutDate(e.target.value)}
                  min={checkInDate}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Number of Nights Display */}
            {numberOfNights > 0 && (
              <div className="p-3 bg-white rounded-md">
                <p className="text-sm text-gray-600">
                  Duration:{' '}
                  <span className="font-semibold text-gray-900">{numberOfNights} night(s)</span>
                </p>
              </div>
            )}

            {/* Number of Rooms */}
            <div>
              <Label htmlFor="numberOfRooms">Number of Rooms</Label>
              <Input
                id="numberOfRooms"
                type="number"
                min={1}
                max={50}
                value={numberOfRooms}
                onChange={e => setNumberOfRooms(parseInt(e.target.value) || 1)}
                className="mt-2"
              />
            </div>

            {/* Adults and Children */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numAdults" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Adults per Room
                </Label>
                <Input
                  id="numAdults"
                  type="number"
                  min={1}
                  max={10}
                  value={numAdults}
                  onChange={e => setNumAdults(parseInt(e.target.value) || 1)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="numChildren" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Children per Room
                </Label>
                <Input
                  id="numChildren"
                  type="number"
                  min={0}
                  max={10}
                  value={numChildren}
                  onChange={e => setNumChildren(parseInt(e.target.value) || 0)}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Base price per night:</span>
                <span className="font-medium">
                  TRY{' '}
                  {(selectedRoomTypeId &&
                    roomTypes?.find(rt => rt.id === selectedRoomTypeId)?.pricePerNight) ||
                    selectedHotel.pricePerPersonDoubleOccupancy ||
                    0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total nights:</span>
                <span className="font-medium">{numberOfNights}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total rooms:</span>
                <span className="font-medium">{numberOfRooms}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-semibold text-gray-900">Total Cost:</span>
                <span className="text-lg font-bold text-gray-900">
                  TRY {calculateHotelCost().toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600">Selling Price (20% markup):</span>
                <span className="text-lg font-bold text-green-600">
                  TRY {(calculateHotelCost() * 1.2).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setSelectedHotel(null)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleAddHotel}
                className="flex-1"
                disabled={!checkInDate || !checkOutDate || numberOfNights <= 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Hotel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

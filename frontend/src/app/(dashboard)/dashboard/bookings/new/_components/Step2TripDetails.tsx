/**
 * Step 2: Trip Details
 *
 * Collects travel dates, destination, number of travelers, emergency contacts,
 * and special requests.
 */

'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useBookingWizard } from '@/contexts/BookingWizardContext';
import { useCities, useCurrencies } from '@/lib/hooks/useBookingWizard';
import { tripDetailsSchema } from '@/lib/validations/booking-wizard';
import type { WizardTripDetails } from '@/types/wizard';

export function Step2TripDetails() {
  const { tripDetails, setTripDetails, nextStep, previousStep, markStepComplete } =
    useBookingWizard();
  const { data: cities, isLoading: loadingCities } = useCities();
  const { data: currencies, isLoading: loadingCurrencies } = useCurrencies();

  const form = useForm({
    resolver: zodResolver(tripDetailsSchema),
    defaultValues: tripDetails || {
      numAdults: 2,
      numChildren: 0,
      childrenAges: [],
      isGroupBooking: false,
      travelStartDate: new Date(),
      travelEndDate: new Date(),
      destinationCityId: 0,
      currency: 'USD',
      tripType: 'Package' as const,
      bookingSource: 'Website' as const,
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
    },
  });

  const numChildren = form.watch('numChildren');
  const isGroupBooking = form.watch('isGroupBooking');
  const travelStartDate = form.watch('travelStartDate');

  // Update children ages array when number changes
  useEffect(() => {
    if (numChildren === undefined) return;
    const currentAges = form.getValues('childrenAges') || [];
    if (numChildren > currentAges.length) {
      // Add empty ages
      const newAges = [...currentAges, ...Array(numChildren - currentAges.length).fill(0)];
      form.setValue('childrenAges', newAges);
    } else if (numChildren < currentAges.length) {
      // Remove excess ages
      form.setValue('childrenAges', currentAges.slice(0, numChildren));
    }
  }, [numChildren, form]);

  const onSubmit = (data: WizardTripDetails) => {
    setTripDetails(data);
    markStepComplete(2);
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Trip Details</h2>
        <p className="mt-1 text-sm text-gray-500">
          Provide travel dates, destination, and traveler information
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Travel Start Date */}
          <div>
            <Label htmlFor="travelStartDate">Travel Start Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal mt-2',
                    !form.watch('travelStartDate') && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch('travelStartDate') ? (
                    format(form.watch('travelStartDate'), 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.watch('travelStartDate')}
                  onSelect={date => date && form.setValue('travelStartDate', date)}
                  disabled={date => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.travelStartDate && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.travelStartDate.message}
              </p>
            )}
          </div>

          {/* Travel End Date */}
          <div>
            <Label htmlFor="travelEndDate">Travel End Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal mt-2',
                    !form.watch('travelEndDate') && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch('travelEndDate') ? (
                    format(form.watch('travelEndDate'), 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.watch('travelEndDate')}
                  onSelect={date => date && form.setValue('travelEndDate', date)}
                  disabled={date => date < (travelStartDate || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.travelEndDate && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.travelEndDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Destination City */}
        <div>
          <Label htmlFor="destinationCityId">Destination *</Label>
          <Select
            value={form.watch('destinationCityId')?.toString()}
            onValueChange={value => form.setValue('destinationCityId', parseInt(value))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue
                placeholder={loadingCities ? 'Loading cities...' : 'Select destination city'}
              />
            </SelectTrigger>
            <SelectContent>
              {cities?.map(city => (
                <SelectItem key={city.id} value={city.id.toString()}>
                  {city.name}, {city.countryName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.destinationCityId && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.destinationCityId.message}
            </p>
          )}
        </div>

        {/* Booking Details Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Currency */}
          <div>
            <Label htmlFor="currency">Currency *</Label>
            <Select
              value={form.watch('currency')}
              onValueChange={value => form.setValue('currency', value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder={loadingCurrencies ? 'Loading...' : 'Select currency'} />
              </SelectTrigger>
              <SelectContent>
                {currencies?.map(currency => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.currency && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.currency.message}</p>
            )}
          </div>

          {/* Trip Type */}
          <div>
            <Label htmlFor="tripType">Trip Type *</Label>
            <Select
              value={form.watch('tripType')}
              onValueChange={value => form.setValue('tripType', value as any)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select trip type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Package">Package Tour</SelectItem>
                <SelectItem value="Custom">Custom Tour</SelectItem>
                <SelectItem value="FIT">FIT (Free Independent Traveler)</SelectItem>
                <SelectItem value="Group">Group Tour</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.tripType && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.tripType.message}</p>
            )}
          </div>

          {/* Booking Source */}
          <div>
            <Label htmlFor="bookingSource">Booking Source *</Label>
            <Select
              value={form.watch('bookingSource')}
              onValueChange={value => form.setValue('bookingSource', value as any)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select booking source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="Phone">Phone</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="Walk-in">Walk-in</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="Agent">Agent</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.bookingSource && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.bookingSource.message}
              </p>
            )}
          </div>
        </div>

        {/* Number of Travelers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="numAdults">Number of Adults *</Label>
            <Input
              id="numAdults"
              type="number"
              min={1}
              max={50}
              {...form.register('numAdults', { valueAsNumber: true })}
              className="mt-2"
            />
            {form.formState.errors.numAdults && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.numAdults.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="numChildren">Number of Children</Label>
            <Input
              id="numChildren"
              type="number"
              min={0}
              max={50}
              {...form.register('numChildren', { valueAsNumber: true })}
              className="mt-2"
            />
            {form.formState.errors.numChildren && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.numChildren.message}
              </p>
            )}
          </div>
        </div>

        {/* Children Ages (Dynamic Array) */}
        {numChildren !== undefined && numChildren > 0 && (
          <div>
            <Label>Children Ages *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {Array.from({ length: numChildren }).map((_, index) => (
                <div key={index}>
                  <Input
                    type="number"
                    min={0}
                    max={17}
                    placeholder={`Child ${index + 1} age`}
                    {...form.register(`childrenAges.${index}`, { valueAsNumber: true })}
                  />
                </div>
              ))}
            </div>
            {form.formState.errors.childrenAges && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.childrenAges.message}
              </p>
            )}
          </div>
        )}

        {/* Group Booking Section */}
        <div className="border-t pt-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isGroupBooking"
              checked={isGroupBooking}
              onCheckedChange={checked => form.setValue('isGroupBooking', !!checked)}
            />
            <Label htmlFor="isGroupBooking" className="cursor-pointer">
              This is a group booking
            </Label>
          </div>

          {isGroupBooking && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <Label htmlFor="groupName">Group Name *</Label>
                <Input id="groupName" {...form.register('groupName')} className="mt-2" />
                {form.formState.errors.groupName && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.groupName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="groupLeaderName">Group Leader Name *</Label>
                <Input
                  id="groupLeaderName"
                  {...form.register('groupLeaderName')}
                  className="mt-2"
                />
                {form.formState.errors.groupLeaderName && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.groupLeaderName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="groupLeaderContact">Leader Contact *</Label>
                <Input
                  id="groupLeaderContact"
                  {...form.register('groupLeaderContact')}
                  className="mt-2"
                />
                {form.formState.errors.groupLeaderContact && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.groupLeaderContact.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Emergency Contact */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="emergencyContactName">Name *</Label>
              <Input
                id="emergencyContactName"
                {...form.register('emergencyContactName')}
                className="mt-2"
              />
              {form.formState.errors.emergencyContactName && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.emergencyContactName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="emergencyContactPhone">Phone *</Label>
              <Input
                id="emergencyContactPhone"
                {...form.register('emergencyContactPhone')}
                className="mt-2"
              />
              {form.formState.errors.emergencyContactPhone && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.emergencyContactPhone.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="emergencyContactRelationship">Relationship *</Label>
              <Input
                id="emergencyContactRelationship"
                {...form.register('emergencyContactRelationship')}
                className="mt-2"
              />
              {form.formState.errors.emergencyContactRelationship && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.emergencyContactRelationship.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <Label htmlFor="specialRequests">Special Requests</Label>
          <Textarea
            id="specialRequests"
            placeholder="Any special requirements or notes..."
            {...form.register('specialRequests')}
            className="mt-2"
            rows={4}
          />
          {form.formState.errors.specialRequests && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.specialRequests.message}
            </p>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button type="button" variant="outline" onClick={previousStep}>
            Back
          </Button>
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </div>
  );
}

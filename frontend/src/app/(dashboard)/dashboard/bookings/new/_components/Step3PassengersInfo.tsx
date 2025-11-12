/**
 * Step 3: Passengers Information
 *
 * Collects detailed passenger information with dynamic forms based on
 * the number of travelers specified in Step 2. Features include:
 * - Auto-generated passenger forms (adults + children)
 * - Lead passenger designation
 * - Age calculation from date of birth
 * - Passport expiry validation
 * - Copy data from lead passenger
 * - Progress tracking
 */

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, differenceInYears, addMonths, isBefore } from 'date-fns';
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  UserCheck,
  Calendar as CalendarIcon,
  User,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useBookingWizard } from '@/contexts/BookingWizardContext';
import { passengerSchema } from '@/lib/validations/booking-wizard';
import type { WizardPassengerData, PassengerType } from '@/types/wizard';
import { cn } from '@/lib/utils';

/**
 * Form schema for all passengers
 */
const passengersFormSchema = z.object({
  passengers: z.array(passengerSchema).min(1, 'At least one passenger is required'),
});

type PassengersFormData = z.infer<typeof passengersFormSchema>;

/**
 * Title options for passengers
 */
const TITLE_OPTIONS = [
  { value: 'Mr.', label: 'Mr.' },
  { value: 'Mrs.', label: 'Mrs.' },
  { value: 'Ms.', label: 'Ms.' },
  { value: 'Miss', label: 'Miss' },
  { value: 'Dr.', label: 'Dr.' },
  { value: 'Prof.', label: 'Prof.' },
  { value: 'Master', label: 'Master' },
];

/**
 * Common nationalities for quick selection
 */
const COMMON_NATIONALITIES = [
  'American',
  'British',
  'Canadian',
  'Turkish',
  'German',
  'French',
  'Spanish',
  'Italian',
  'Chinese',
  'Japanese',
  'Australian',
  'Brazilian',
  'Indian',
  'Russian',
  'Other',
];

/**
 * Step 3: Passengers Information Component
 */
export function Step3PassengersInfo() {
  const { tripDetails, passengers, setPassengers, nextStep, previousStep, markStepComplete } =
    useBookingWizard();

  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>(['passenger-0']);

  // Calculate total passengers from trip details
  const totalPassengers = (tripDetails?.numAdults || 0) + (tripDetails?.numChildren || 0);

  // Initialize form with existing data or create new passenger objects
  const form = useForm<PassengersFormData>({
    resolver: zodResolver(passengersFormSchema),
    defaultValues: {
      passengers:
        passengers.length > 0
          ? passengers
          : Array.from({ length: totalPassengers }, (_, index) => {
              const isAdult = index < (tripDetails?.numAdults || 0);
              const childAgeIndex = index - (tripDetails?.numAdults || 0);
              const childAge =
                !isAdult && tripDetails?.childrenAges?.[childAgeIndex]
                  ? tripDetails.childrenAges[childAgeIndex]
                  : 0;

              return {
                id: `passenger-${index}`,
                passengerType: (isAdult
                  ? 'Adult'
                  : childAge < 2
                    ? 'Infant'
                    : 'Child') as PassengerType,
                isLeadPassenger: index === 0,
                title: isAdult ? 'Mr.' : 'Master',
                firstName: '',
                lastName: '',
                dateOfBirth: new Date(),
                age: isAdult ? 30 : childAge,
                gender: 'Male',
                nationality: '',
                passportNumber: '',
                passportExpiryDate: new Date(),
                passportIssueCountry: '',
                email: '',
                phone: '',
                dietaryRequirements: [],
                medicalConditions: '',
                accessibilityNeeds: '',
                specialNotes: '',
                roomNumber: '',
                bedTypePreference: '',
              };
            }),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'passengers',
  });

  /**
   * Calculate age from date of birth
   */
  const calculateAge = (dateOfBirth: Date): number => {
    return differenceInYears(new Date(), dateOfBirth);
  };

  /**
   * Determine passenger type based on age
   */
  const determinePassengerType = (age: number): PassengerType => {
    if (age >= 18) return 'Adult';
    if (age >= 2) return 'Child';
    return 'Infant';
  };

  /**
   * Check if passport expires within 6 months of travel end
   */
  const isPassportExpiringSoon = (expiryDate: Date): boolean => {
    if (!tripDetails?.travelEndDate) return false;
    const sixMonthsAfterTravel = addMonths(tripDetails.travelEndDate, 6);
    return isBefore(expiryDate, sixMonthsAfterTravel);
  };

  /**
   * Check if passenger form is complete (all required fields filled)
   */
  const isPassengerComplete = (index: number): boolean => {
    const passenger = form.watch(`passengers.${index}`);
    const isLead = passenger?.isLeadPassenger;

    // Required fields for all passengers
    const basicFieldsComplete =
      passenger?.firstName &&
      passenger?.lastName &&
      passenger?.dateOfBirth &&
      passenger?.nationality &&
      passenger?.passportNumber &&
      passenger?.passportExpiryDate &&
      passenger?.passportIssueCountry;

    // Additional required fields for lead passenger
    const leadFieldsComplete = !isLead || (passenger?.email && passenger?.phone);

    return !!(basicFieldsComplete && leadFieldsComplete);
  };

  /**
   * Copy lead passenger data to another passenger
   */
  const copyFromLead = (targetIndex: number) => {
    const leadPassenger = form.getValues('passengers.0');
    if (!leadPassenger || targetIndex === 0) return;

    // Copy relevant fields but keep individual identification
    form.setValue(`passengers.${targetIndex}.title`, leadPassenger.title);
    form.setValue(`passengers.${targetIndex}.nationality`, leadPassenger.nationality);
    form.setValue(
      `passengers.${targetIndex}.passportIssueCountry`,
      leadPassenger.passportIssueCountry
    );

    // Don't copy personal fields like name, DOB, passport number
    // Show success feedback
    alert(`Contact and nationality information copied from lead passenger.`);
  };

  /**
   * Count completed passengers
   */
  const passengers_data = form.watch('passengers');
  const completedCount = useMemo(() => {
    return fields.filter((_, index) => isPassengerComplete(index)).length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields.length, passengers_data]);

  /**
   * Handle form submission
   */
  const onSubmit = (data: PassengersFormData) => {
    // Ensure at least one lead passenger
    const hasLead = data.passengers.some(p => p.isLeadPassenger);
    if (!hasLead) {
      alert('Please designate at least one lead passenger');
      return;
    }

    setPassengers(data.passengers);
    markStepComplete(3);
    nextStep();
  };

  /**
   * Auto-open first incomplete passenger accordion
   */
  useEffect(() => {
    const firstIncomplete = fields.findIndex((_, index) => !isPassengerComplete(index));
    if (firstIncomplete !== -1) {
      setOpenAccordionItems([`passenger-${firstIncomplete}`]);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Passengers Information</h2>
        <p className="mt-1 text-sm text-gray-500">
          Provide details for all {totalPassengers} passengers. The first passenger is the lead
          passenger.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Progress Summary */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-500" />
            <div>
              <h3 className="font-semibold text-gray-900">Passengers ({totalPassengers})</h3>
              <p className="text-sm text-gray-600">
                {tripDetails?.numAdults} {tripDetails?.numAdults === 1 ? 'Adult' : 'Adults'}
                {tripDetails?.numChildren
                  ? `, ${tripDetails.numChildren} ${tripDetails.numChildren === 1 ? 'Child' : 'Children'}`
                  : ''}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-900">
                {completedCount} of {totalPassengers} completed
              </span>
            </div>
            <div className="mt-1 h-2 w-40 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-green-600 transition-all duration-300"
                style={{ width: `${(completedCount / totalPassengers) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Passenger Forms */}
        <Accordion
          type="multiple"
          value={openAccordionItems}
          onValueChange={setOpenAccordionItems}
          className="w-full space-y-2"
        >
          {fields.map((field, index) => {
            const passenger = form.watch(`passengers.${index}`);
            const isComplete = isPassengerComplete(index);
            const isLead = passenger?.isLeadPassenger;
            const passportExpiringSoon =
              passenger?.passportExpiryDate && isPassportExpiringSoon(passenger.passportExpiryDate);

            return (
              <AccordionItem
                key={field.id}
                value={`passenger-${index}`}
                className={cn(
                  'rounded-lg border',
                  isComplete ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-white'
                )}
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex w-full items-center justify-between pr-4">
                    <div className="flex items-center gap-3">
                      {/* Completion Status */}
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                      ) : (
                        <div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-gray-300" />
                      )}

                      {/* Passenger Info */}
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          {isLead && (
                            <Badge variant="default" className="bg-blue-600">
                              <UserCheck className="mr-1 h-3 w-3" />
                              Lead
                            </Badge>
                          )}
                          <span className="font-medium text-gray-900">Passenger {index + 1}</span>
                          <Badge variant="outline">{passenger?.passengerType}</Badge>
                        </div>
                        {passenger?.firstName && passenger?.lastName && (
                          <p className="mt-0.5 text-sm text-gray-600">
                            {passenger.firstName} {passenger.lastName}
                            {passenger.age > 0 && ` (${passenger.age} years old)`}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Warning Badge */}
                    {passportExpiringSoon && (
                      <Badge variant="destructive" className="ml-2">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Passport Expires Soon
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4 pt-2">
                  <div className="space-y-6 rounded-lg border border-gray-100 bg-white p-4">
                    {/* Copy from Lead Button */}
                    {index > 0 && (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => copyFromLead(index)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Info from Lead Passenger
                        </Button>
                      </div>
                    )}

                    {/* Personal Information */}
                    <div>
                      <h4 className="mb-3 font-semibold text-gray-900">Personal Information</h4>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Title */}
                        <div>
                          <Label htmlFor={`passengers.${index}.title`}>
                            Title <span className="text-red-600">*</span>
                          </Label>
                          <Select
                            value={passenger?.title}
                            onValueChange={value =>
                              form.setValue(`passengers.${index}.title`, value)
                            }
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select title" />
                            </SelectTrigger>
                            <SelectContent>
                              {TITLE_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {form.formState.errors.passengers?.[index]?.title && (
                            <p className="mt-1 text-sm text-red-600">
                              {form.formState.errors.passengers[index]?.title?.message}
                            </p>
                          )}
                        </div>

                        {/* First Name */}
                        <div>
                          <Label htmlFor={`passengers.${index}.firstName`}>
                            First Name <span className="text-red-600">*</span>
                          </Label>
                          <Input
                            {...form.register(`passengers.${index}.firstName`)}
                            placeholder="Enter first name"
                            className="mt-2"
                          />
                          {form.formState.errors.passengers?.[index]?.firstName && (
                            <p className="mt-1 text-sm text-red-600">
                              {form.formState.errors.passengers[index]?.firstName?.message}
                            </p>
                          )}
                        </div>

                        {/* Last Name */}
                        <div>
                          <Label htmlFor={`passengers.${index}.lastName`}>
                            Last Name <span className="text-red-600">*</span>
                          </Label>
                          <Input
                            {...form.register(`passengers.${index}.lastName`)}
                            placeholder="Enter last name"
                            className="mt-2"
                          />
                          {form.formState.errors.passengers?.[index]?.lastName && (
                            <p className="mt-1 text-sm text-red-600">
                              {form.formState.errors.passengers[index]?.lastName?.message}
                            </p>
                          )}
                        </div>

                        {/* Date of Birth */}
                        <div>
                          <Label htmlFor={`passengers.${index}.dateOfBirth`}>
                            Date of Birth <span className="text-red-600">*</span>
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  'mt-2 w-full justify-start text-left font-normal',
                                  !passenger?.dateOfBirth && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {passenger?.dateOfBirth
                                  ? format(passenger.dateOfBirth, 'PPP')
                                  : 'Pick a date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={passenger?.dateOfBirth}
                                onSelect={date => {
                                  if (date) {
                                    form.setValue(`passengers.${index}.dateOfBirth`, date);
                                    const age = calculateAge(date);
                                    form.setValue(`passengers.${index}.age`, age);
                                    const passengerType = determinePassengerType(age);
                                    form.setValue(
                                      `passengers.${index}.passengerType`,
                                      passengerType
                                    );
                                  }
                                }}
                                disabled={date =>
                                  date > new Date() || date < new Date('1900-01-01')
                                }
                                captionLayout="dropdown"
                                fromYear={1900}
                                toYear={new Date().getFullYear()}
                              />
                            </PopoverContent>
                          </Popover>
                          {form.formState.errors.passengers?.[index]?.dateOfBirth && (
                            <p className="mt-1 text-sm text-red-600">
                              {form.formState.errors.passengers[index]?.dateOfBirth?.message}
                            </p>
                          )}
                        </div>

                        {/* Age (Auto-calculated) */}
                        <div>
                          <Label htmlFor={`passengers.${index}.age`}>Age</Label>
                          <Input
                            type="number"
                            value={passenger?.age || 0}
                            disabled
                            className="mt-2 bg-gray-50"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Auto-calculated from date of birth
                          </p>
                        </div>

                        {/* Passenger Type (Auto-determined) */}
                        <div>
                          <Label htmlFor={`passengers.${index}.passengerType`}>
                            Passenger Type
                          </Label>
                          <Input
                            value={passenger?.passengerType || 'Adult'}
                            disabled
                            className="mt-2 bg-gray-50"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Auto-determined (Adult: 18+, Child: 2-17, Infant: 0-1)
                          </p>
                        </div>

                        {/* Gender */}
                        <div>
                          <Label htmlFor={`passengers.${index}.gender`}>
                            Gender <span className="text-red-600">*</span>
                          </Label>
                          <Select
                            value={passenger?.gender}
                            onValueChange={value =>
                              form.setValue(`passengers.${index}.gender`, value)
                            }
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Nationality */}
                        <div>
                          <Label htmlFor={`passengers.${index}.nationality`}>
                            Nationality <span className="text-red-600">*</span>
                          </Label>
                          <Select
                            value={passenger?.nationality}
                            onValueChange={value =>
                              form.setValue(`passengers.${index}.nationality`, value)
                            }
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select nationality" />
                            </SelectTrigger>
                            <SelectContent>
                              {COMMON_NATIONALITIES.map(nationality => (
                                <SelectItem key={nationality} value={nationality}>
                                  {nationality}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {form.formState.errors.passengers?.[index]?.nationality && (
                            <p className="mt-1 text-sm text-red-600">
                              {form.formState.errors.passengers[index]?.nationality?.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Passport Information */}
                    <div>
                      <h4 className="mb-3 font-semibold text-gray-900">Passport Information</h4>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Passport Number */}
                        <div>
                          <Label htmlFor={`passengers.${index}.passportNumber`}>
                            Passport Number <span className="text-red-600">*</span>
                          </Label>
                          <Input
                            {...form.register(`passengers.${index}.passportNumber`)}
                            placeholder="e.g., AB1234567"
                            className="mt-2"
                          />
                          {form.formState.errors.passengers?.[index]?.passportNumber && (
                            <p className="mt-1 text-sm text-red-600">
                              {form.formState.errors.passengers[index]?.passportNumber?.message}
                            </p>
                          )}
                        </div>

                        {/* Passport Expiry Date */}
                        <div>
                          <Label htmlFor={`passengers.${index}.passportExpiryDate`}>
                            Passport Expiry Date <span className="text-red-600">*</span>
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  'mt-2 w-full justify-start text-left font-normal',
                                  !passenger?.passportExpiryDate && 'text-muted-foreground',
                                  passportExpiringSoon && 'border-red-600 text-red-600'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {passenger?.passportExpiryDate
                                  ? format(passenger.passportExpiryDate, 'PPP')
                                  : 'Pick expiry date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={passenger?.passportExpiryDate}
                                onSelect={date => {
                                  if (date) {
                                    form.setValue(`passengers.${index}.passportExpiryDate`, date);
                                  }
                                }}
                                disabled={date => date < new Date()}
                                captionLayout="dropdown"
                                fromYear={new Date().getFullYear()}
                                toYear={new Date().getFullYear() + 20}
                              />
                            </PopoverContent>
                          </Popover>
                          {passportExpiringSoon && (
                            <p className="mt-1 flex items-center text-sm text-red-600">
                              <AlertCircle className="mr-1 h-4 w-4" />
                              Passport expires within 6 months of travel end date
                            </p>
                          )}
                          {form.formState.errors.passengers?.[index]?.passportExpiryDate && (
                            <p className="mt-1 text-sm text-red-600">
                              {form.formState.errors.passengers[index]?.passportExpiryDate?.message}
                            </p>
                          )}
                        </div>

                        {/* Passport Issue Country */}
                        <div className="md:col-span-2">
                          <Label htmlFor={`passengers.${index}.passportIssueCountry`}>
                            Passport Issue Country <span className="text-red-600">*</span>
                          </Label>
                          <Input
                            {...form.register(`passengers.${index}.passportIssueCountry`)}
                            placeholder="e.g., United States"
                            className="mt-2"
                          />
                          {form.formState.errors.passengers?.[index]?.passportIssueCountry && (
                            <p className="mt-1 text-sm text-red-600">
                              {
                                form.formState.errors.passengers[index]?.passportIssueCountry
                                  ?.message
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact Information (Lead Passenger Only) */}
                    {isLead && (
                      <div>
                        <h4 className="mb-3 font-semibold text-gray-900">Contact Information</h4>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {/* Email */}
                          <div>
                            <Label htmlFor={`passengers.${index}.email`}>
                              Email <span className="text-red-600">*</span>
                            </Label>
                            <Input
                              type="email"
                              {...form.register(`passengers.${index}.email`)}
                              placeholder="email@example.com"
                              className="mt-2"
                            />
                            {form.formState.errors.passengers?.[index]?.email && (
                              <p className="mt-1 text-sm text-red-600">
                                {form.formState.errors.passengers[index]?.email?.message}
                              </p>
                            )}
                          </div>

                          {/* Phone */}
                          <div>
                            <Label htmlFor={`passengers.${index}.phone`}>
                              Phone <span className="text-red-600">*</span>
                            </Label>
                            <Input
                              type="tel"
                              {...form.register(`passengers.${index}.phone`)}
                              placeholder="+1 (555) 123-4567"
                              className="mt-2"
                            />
                            {form.formState.errors.passengers?.[index]?.phone && (
                              <p className="mt-1 text-sm text-red-600">
                                {form.formState.errors.passengers[index]?.phone?.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Special Requirements */}
                    <div>
                      <h4 className="mb-3 font-semibold text-gray-900">Special Requirements</h4>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Dietary Requirements */}
                        <div>
                          <Label htmlFor={`passengers.${index}.dietaryRequirements`}>
                            Dietary Requirements
                          </Label>
                          <Textarea
                            {...form.register(`passengers.${index}.dietaryRequirements.0`)}
                            placeholder="e.g., Vegetarian, Vegan, Halal, Gluten-free, Nut allergy"
                            className="mt-2"
                            rows={2}
                          />
                        </div>

                        {/* Medical Conditions */}
                        <div>
                          <Label htmlFor={`passengers.${index}.medicalConditions`}>
                            Medical Conditions
                          </Label>
                          <Textarea
                            {...form.register(`passengers.${index}.medicalConditions`)}
                            placeholder="Any medical conditions we should be aware of"
                            className="mt-2"
                            rows={2}
                          />
                        </div>

                        {/* Special Needs */}
                        <div className="md:col-span-2">
                          <Label htmlFor={`passengers.${index}.accessibilityNeeds`}>
                            Special Needs / Accessibility
                          </Label>
                          <Textarea
                            {...form.register(`passengers.${index}.accessibilityNeeds`)}
                            placeholder="e.g., Wheelchair access, mobility assistance"
                            className="mt-2"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Form Errors */}
        {form.formState.errors.passengers?.root && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{form.formState.errors.passengers.root.message}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between border-t pt-6">
          <Button type="button" variant="outline" onClick={previousStep}>
            Back to Trip Details
          </Button>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              {completedCount === totalPassengers ? (
                <span className="flex items-center text-green-600">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  All passengers completed
                </span>
              ) : (
                <span>
                  {totalPassengers - completedCount} passenger
                  {totalPassengers - completedCount !== 1 ? 's' : ''} remaining
                </span>
              )}
            </p>
            <Button type="submit" disabled={completedCount === 0}>
              Continue to Services
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

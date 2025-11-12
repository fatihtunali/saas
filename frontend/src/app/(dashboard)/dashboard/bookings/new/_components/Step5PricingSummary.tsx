/**
 * Step 5: Pricing & Summary
 *
 * Final step of booking wizard with complete pricing calculations,
 * comprehensive booking summary, payment schedule, and booking submission.
 *
 * Features:
 * - Complete booking summary with accordion sections
 * - Advanced pricing calculator with commission and discounts
 * - Promo code validation
 * - Payment schedule management
 * - Multiple submission options (Draft, Quotation, Confirmed)
 * - Field mapping for API submission
 *
 * @module components/Step5PricingSummary
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Tag,
  Calendar,
  Users,
  MapPin,
  Package,
  DollarSign,
  FileText,
  User,
  Phone,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBookingWizard } from '@/contexts/BookingWizardContext';
import {
  useCreateCompleteBooking,
  useTaxRates,
  useValidatePromoCode,
  useCancellationPolicies,
  useMarketingCampaigns,
} from '@/lib/hooks/useBookingWizard';
import { useToast } from '@/lib/hooks/use-toast';
import { toSnakeCase } from '@/lib/utils/fieldMapping';
import type { ServiceType } from '@/types/bookings';

/**
 * Service type display names
 */
const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  hotel: 'Hotel',
  transfer: 'Transfer',
  vehicle_rental: 'Vehicle Rental',
  tour: 'Tour',
  guide: 'Guide',
  restaurant: 'Restaurant',
  entrance_fee: 'Entrance Fee',
  extra: 'Extra Service',
};

/**
 * Priority options
 */
const PRIORITY_OPTIONS = [
  { value: 'Normal', label: 'Normal', color: 'bg-gray-100 text-gray-800' },
  { value: 'High', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'Urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

/**
 * Booking source options
 */
const BOOKING_SOURCE_OPTIONS = [
  'Website',
  'Phone',
  'Email',
  'Walk-in',
  'Partner',
  'Referral',
  'Social Media',
  'Direct',
];

/**
 * Step 5: Pricing & Summary Component
 */
export function Step5PricingSummary() {
  const router = useRouter();
  const { toast } = useToast();
  const { client, tripDetails, passengers, services, resetWizard, previousStep, setIsSubmitting } =
    useBookingWizard();

  // Hooks
  const { data: taxRates } = useTaxRates();
  const { data: cancellationPolicies } = useCancellationPolicies();
  const { data: marketingCampaigns } = useMarketingCampaigns();
  const createBooking = useCreateCompleteBooking();

  // Pricing state
  const [markupPercentage, setMarkupPercentage] = useState<number>(20);
  const [commissionPercentage, setCommissionPercentage] = useState<number>(0);
  const [selectedTaxRateId, setSelectedTaxRateId] = useState<string>('');
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [isValidatingPromo, setIsValidatingPromo] = useState<boolean>(false);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [manualDiscount, setManualDiscount] = useState<number>(0);

  // Payment schedule state
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [depositDueDate, setDepositDueDate] = useState<string>('');
  const [balanceDueDate, setBalanceDueDate] = useState<string>('');

  // Additional fields state
  const [bookingSource, setBookingSource] = useState<string>('Website');
  const [referralSource, setReferralSource] = useState<string>('');
  const [priority, setPriority] = useState<string>('Normal');
  const [cancellationPolicyId, setCancellationPolicyId] = useState<string>('');
  const [campaignId, setCampaignId] = useState<string>('');
  const [internalNotes, setInternalNotes] = useState<string>('');
  const [clientNotes, setClientNotes] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

  // Promo code validation
  const { data: promoData } = useValidatePromoCode(promoCode);

  /**
   * Calculate pricing breakdown
   */
  const pricingCalculation = useMemo(() => {
    // 1. Sum all service costs
    const servicesCost = services.reduce(
      (sum, s) => sum + (s.costInBaseCurrency || 0) * s.quantity,
      0
    );

    // 2. Apply markup
    const markup = servicesCost * (markupPercentage / 100);
    const totalBeforeCommission = servicesCost + markup;

    // 3. Apply commission (if agent booking)
    const commission = totalBeforeCommission * (commissionPercentage / 100);
    const profitAmount = markup - commission;

    // 4. Calculate subtotal
    const subtotal = totalBeforeCommission - commission;

    // 5. Apply promo code discount (if any)
    let promoDiscount = 0;
    if (promoData) {
      if (promoData.discountType === 'percentage') {
        promoDiscount = subtotal * (promoData.discountValue / 100);
      } else {
        promoDiscount = promoData.discountValue;
      }
    }

    // 6. Apply manual discount
    const totalDiscount = promoDiscount + manualDiscount;
    const afterDiscount = Math.max(0, subtotal - totalDiscount);

    // 7. Apply tax
    const selectedTaxRate = taxRates?.find(t => t.id.toString() === selectedTaxRateId);
    const taxAmount = selectedTaxRate ? afterDiscount * (selectedTaxRate.rate / 100) : 0;

    // 8. Final total
    const totalAmount = afterDiscount + taxAmount;

    // Default deposit (30% of total)
    const defaultDeposit = totalAmount * 0.3;

    return {
      servicesCost,
      markup,
      markupPercentage,
      totalBeforeCommission,
      commission,
      commissionPercentage,
      profitAmount,
      subtotal,
      promoDiscount,
      manualDiscount,
      totalDiscount,
      afterDiscount,
      taxRate: selectedTaxRate?.rate || 0,
      taxAmount,
      totalAmount,
      defaultDeposit,
      selectedTaxRate,
    };
  }, [
    services,
    markupPercentage,
    commissionPercentage,
    selectedTaxRateId,
    taxRates,
    promoData,
    manualDiscount,
  ]);

  /**
   * Initialize deposit amount
   */
  useEffect(() => {
    if (depositAmount === 0 && pricingCalculation.defaultDeposit > 0) {
      setDepositAmount(Number(pricingCalculation.defaultDeposit.toFixed(2)));
    }
  }, [pricingCalculation.defaultDeposit]);

  /**
   * Handle promo code validation
   */
  const handleValidatePromo = async () => {
    if (!promoCodeInput.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a promo code',
        variant: 'destructive',
      });
      return;
    }

    setIsValidatingPromo(true);
    setPromoCode(promoCodeInput.toUpperCase());

    setTimeout(() => {
      setIsValidatingPromo(false);
      if (promoData) {
        toast({
          title: 'Success!',
          description: `Promo code applied: ${promoData.discountType === 'percentage' ? `${promoData.discountValue}%` : `$${promoData.discountValue}`} off`,
        });
      } else {
        toast({
          title: 'Invalid Code',
          description: 'This promo code is not valid or has expired',
          variant: 'destructive',
        });
        setPromoCode('');
      }
    }, 1000);
  };

  /**
   * Handle booking submission
   */
  const handleSubmit = async (status: 'Draft' | 'Quotation' | 'Confirmed') => {
    try {
      // Validate required data
      if (!client || !tripDetails) {
        toast({
          title: 'Error',
          description: 'Missing required booking information',
          variant: 'destructive',
        });
        return;
      }

      if (passengers.length === 0) {
        toast({
          title: 'Error',
          description: 'At least one passenger is required',
          variant: 'destructive',
        });
        return;
      }

      if (status === 'Confirmed' && !termsAccepted) {
        toast({
          title: 'Error',
          description: 'Please accept terms and conditions',
          variant: 'destructive',
        });
        return;
      }

      // Validate payment schedule
      if (depositAmount > pricingCalculation.totalAmount) {
        toast({
          title: 'Error',
          description: 'Deposit amount cannot exceed total amount',
          variant: 'destructive',
        });
        return;
      }

      setIsSubmitting(true);

      // Prepare booking data (camelCase)
      const bookingData = {
        // Client information
        clientId: client.type === 'B2C' ? client.id : undefined,
        operatorsClientId: client.type === 'B2B' ? client.id : undefined,

        // Trip details
        travelStartDate: tripDetails.travelStartDate,
        travelEndDate: tripDetails.travelEndDate,
        destinationCityId: tripDetails.destinationCityId,
        numAdults: tripDetails.numAdults,
        numChildren: tripDetails.numChildren,
        childrenAges: tripDetails.childrenAges,

        // Pricing
        totalCost: pricingCalculation.servicesCost,
        markupPercentage: pricingCalculation.markupPercentage,
        profitAmount: pricingCalculation.profitAmount,
        commissionPercentage: pricingCalculation.commissionPercentage,
        discountAmount: pricingCalculation.totalDiscount,
        taxAmount: pricingCalculation.taxAmount,
        totalSellingPrice: pricingCalculation.totalAmount,
        currency: 'TRY', // Default currency

        // Tax and discounts
        taxRateId: selectedTaxRateId ? parseInt(selectedTaxRateId) : undefined,
        promoCodeId: promoData?.id,
        campaignId: campaignId ? parseInt(campaignId) : undefined,

        // Payment schedule
        depositAmount: depositAmount || 0,
        depositDueDate: depositDueDate || undefined,
        balanceDueDate: balanceDueDate || undefined,

        // Status and source
        status,
        bookingSource,
        referralSource: referralSource || undefined,
        priority,

        // Cancellation policy
        cancellationPolicyId: cancellationPolicyId ? parseInt(cancellationPolicyId) : undefined,

        // Emergency contact
        emergencyContactName: tripDetails.emergencyContactName,
        emergencyContactPhone: tripDetails.emergencyContactPhone,
        emergencyContactRelationship: tripDetails.emergencyContactRelationship,

        // Group booking
        isGroupBooking: tripDetails.isGroupBooking,
        groupName: tripDetails.groupName,
        groupLeaderName: tripDetails.groupLeaderName,
        groupLeaderContact: tripDetails.groupLeaderContact,

        // Notes
        specialRequests: tripDetails.specialRequests || clientNotes,
        internalNotes: internalNotes,
      };

      // Prepare passengers data (camelCase)
      const passengersData = passengers.map(p => ({
        passengerType: p.passengerType,
        title: p.title,
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: p.dateOfBirth,
        age: p.age,
        gender: p.gender,
        nationality: p.nationality,
        passportNumber: p.passportNumber,
        passportExpiryDate: p.passportExpiryDate,
        passportIssueCountry: p.passportIssueCountry,
        isLeadPassenger: p.isLeadPassenger,
        email: p.email,
        phone: p.phone,
        dietaryRequirements: p.dietaryRequirements?.join(', '),
        medicalConditions: p.medicalConditions,
        accessibilityNeeds: p.accessibilityNeeds,
        specialNotes: p.specialNotes,
        roomNumber: p.roomNumber,
        bedTypePreference: p.bedTypePreference,
      }));

      // Prepare services data (camelCase)
      const servicesData = services.map(s => ({
        serviceType: s.serviceType,
        serviceDate: s.serviceDate,
        serviceDescription: s.serviceDescription,
        quantity: s.quantity,
        costAmount: s.costAmount,
        costCurrency: s.costCurrency,
        exchangeRate: s.exchangeRate,
        costInBaseCurrency: s.costInBaseCurrency,
        sellingPrice: s.sellingPrice,
        sellingCurrency: s.sellingCurrency,
        serviceNotes: s.serviceNotes,
        hotelId: s.hotelId,
        transferRouteId: s.transferRouteId,
        vehicleRentalId: s.vehicleRentalId,
        tourCompanyId: s.tourCompanyId,
        guideId: s.guideId,
        restaurantId: s.restaurantId,
        entranceFeeId: s.entranceFeeId,
        extraExpenseId: s.extraExpenseId,
        pickupLocationId: s.pickupLocationId,
        dropoffLocationId: s.dropoffLocationId,
        pickupTime: s.pickupTime,
      }));

      // Convert to snake_case for API
      const payload = {
        booking: toSnakeCase(bookingData),
        passengers: passengersData.map(p => toSnakeCase(p)),
        services: servicesData.map(s => toSnakeCase(s)),
      };

      // Submit booking
      const result = await createBooking.mutateAsync(payload);

      // Success!
      toast({
        title: 'Success!',
        description: `Booking ${result.bookingCode || result.id} created successfully`,
      });

      // Clear wizard state
      resetWizard();

      // Navigate to booking details
      router.push(`/dashboard/bookings/${result.id}`);
    } catch (error: any) {
      console.error('Booking submission error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Group services by type
   */
  const servicesByType = useMemo(() => {
    const grouped: Record<ServiceType, typeof services> = {} as any;

    services.forEach(service => {
      if (!grouped[service.serviceType]) {
        grouped[service.serviceType] = [];
      }
      grouped[service.serviceType].push(service);
    });

    return grouped;
  }, [services]);

  /**
   * Calculate balance amount
   */
  const balanceAmount = pricingCalculation.totalAmount - depositAmount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Review & Pricing</h2>
        <p className="mt-1 text-sm text-gray-500">
          Review all details, configure pricing, and confirm the booking
        </p>
      </div>

      {/* Warning if no services */}
      {services.length === 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No services have been added. Consider adding services before confirming the booking.
          </AlertDescription>
        </Alert>
      )}

      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Booking Summary
          </CardTitle>
          <CardDescription>Review all booking information</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion
            type="multiple"
            defaultValue={['client', 'trip', 'passengers', 'services']}
            className="w-full"
          >
            {/* Client Information */}
            <AccordionItem value="client">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <User className="w-4 h-4" />
                  <span className="font-medium">Client Information</span>
                  <Badge variant="outline">{client?.type}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 mt-1 text-gray-500" />
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Full Name</dt>
                      <dd className="text-sm font-medium text-gray-900">{client?.fullName}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 mt-1 text-gray-500" />
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900">{client?.email}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 mt-1 text-gray-500" />
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Phone</dt>
                      <dd className="text-sm text-gray-900">{client?.phone}</dd>
                    </div>
                  </div>
                  {client?.nationality && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Nationality</dt>
                        <dd className="text-sm text-gray-900">{client.nationality}</dd>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Trip Details */}
            <AccordionItem value="trip">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Trip Details</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 mt-1 text-gray-500" />
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Travel Dates</dt>
                      <dd className="text-sm text-gray-900">
                        {tripDetails?.travelStartDate &&
                          format(tripDetails.travelStartDate, 'MMM dd, yyyy')}{' '}
                        -{' '}
                        {tripDetails?.travelEndDate &&
                          format(tripDetails.travelEndDate, 'MMM dd, yyyy')}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 mt-1 text-gray-500" />
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Travelers</dt>
                      <dd className="text-sm text-gray-900">
                        {tripDetails?.numAdults} Adults, {tripDetails?.numChildren} Children
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Destination</dt>
                      <dd className="text-sm text-gray-900">
                        {tripDetails?.destinationCityName ||
                          `City ID: ${tripDetails?.destinationCityId}`}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 mt-1 text-gray-500" />
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Emergency Contact</dt>
                      <dd className="text-sm text-gray-900">
                        {tripDetails?.emergencyContactName} ({tripDetails?.emergencyContactPhone})
                      </dd>
                    </div>
                  </div>
                  {tripDetails?.isGroupBooking && (
                    <div className="flex items-start gap-2 col-span-2">
                      <Users className="w-4 h-4 mt-1 text-gray-500" />
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Group Booking</dt>
                        <dd className="text-sm text-gray-900">
                          {tripDetails.groupName} - Led by {tripDetails.groupLeaderName}
                        </dd>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Passengers */}
            <AccordionItem value="passengers">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <Users className="w-4 h-4" />
                  <span className="font-medium">Passengers</span>
                  <Badge variant="secondary">{passengers.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {passengers.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                          {i + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {p.title} {p.firstName} {p.lastName}
                            </span>
                            {p.isLeadPassenger && (
                              <Badge variant="default" className="text-xs">
                                Lead
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {p.passengerType} • {p.nationality} • Age {p.age}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">{p.passportNumber}</div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Services */}
            <AccordionItem value="services">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <Package className="w-4 h-4" />
                  <span className="font-medium">Services</span>
                  <Badge variant="secondary">{services.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {Object.entries(servicesByType).map(([type, typeServices]) => (
                    <div key={type}>
                      <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {SERVICE_TYPE_LABELS[type as ServiceType]} ({typeServices.length})
                      </h5>
                      <div className="space-y-2">
                        {typeServices.map((s, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-900">
                                {s.serviceDescription}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {s.serviceDate && format(s.serviceDate, 'MMM dd, yyyy')} • Qty:{' '}
                                {s.quantity}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-sm text-gray-900">
                                {s.costCurrency} {(s.costAmount * s.quantity).toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Base: TRY {(s.costInBaseCurrency * s.quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {services.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No services added yet</p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Pricing Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pricing Details
          </CardTitle>
          <CardDescription>Configure markup, commissions, taxes, and discounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pricing Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="markupPercentage">Markup Percentage (%)</Label>
              <Input
                id="markupPercentage"
                type="number"
                value={markupPercentage}
                onChange={e => setMarkupPercentage(Number(e.target.value))}
                min={0}
                max={100}
                step={0.1}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="commissionPercentage">Commission Percentage (%)</Label>
              <Input
                id="commissionPercentage"
                type="number"
                value={commissionPercentage}
                onChange={e => setCommissionPercentage(Number(e.target.value))}
                min={0}
                max={100}
                step={0.1}
                className="mt-2"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">For agent bookings</p>
            </div>

            <div>
              <Label htmlFor="taxRate">Tax Rate</Label>
              <Select value={selectedTaxRateId} onValueChange={setSelectedTaxRateId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select tax rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Tax</SelectItem>
                  {taxRates?.map(tr => (
                    <SelectItem key={tr.id} value={tr.id.toString()}>
                      {tr.name} ({tr.rate}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Promo Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="promoCode">Promo Code</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="promoCode"
                  value={promoCodeInput}
                  onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="uppercase"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleValidatePromo}
                  disabled={isValidatingPromo || !promoCodeInput.trim()}
                >
                  {isValidatingPromo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Tag className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {promoData && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Code applied:{' '}
                    {promoData.discountType === 'percentage'
                      ? `${promoData.discountValue}%`
                      : `TRY ${promoData.discountValue}`}{' '}
                    off
                  </span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="manualDiscount">Manual Discount (TRY)</Label>
              <Input
                id="manualDiscount"
                type="number"
                value={manualDiscount}
                onChange={e => setManualDiscount(Number(e.target.value))}
                min={0}
                step={0.01}
                className="mt-2"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">Additional discount override</p>
            </div>
          </div>

          <Separator />

          {/* Pricing Breakdown */}
          <div className="space-y-3 bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Services Cost:</span>
              <span className="font-medium text-gray-900">
                TRY {pricingCalculation.servicesCost.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Markup ({pricingCalculation.markupPercentage}%):
              </span>
              <span className="font-medium text-green-600">
                +TRY {pricingCalculation.markup.toFixed(2)}
              </span>
            </div>

            {pricingCalculation.commission > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Commission ({pricingCalculation.commissionPercentage}%):
                </span>
                <span className="font-medium text-red-600">
                  -TRY {pricingCalculation.commission.toFixed(2)}
                </span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-700">Subtotal:</span>
              <span className="text-gray-900">TRY {pricingCalculation.subtotal.toFixed(2)}</span>
            </div>

            {pricingCalculation.promoDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Promo Discount:</span>
                <span className="font-medium text-green-600">
                  -TRY {pricingCalculation.promoDiscount.toFixed(2)}
                </span>
              </div>
            )}

            {pricingCalculation.manualDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Manual Discount:</span>
                <span className="font-medium text-green-600">
                  -TRY {pricingCalculation.manualDiscount.toFixed(2)}
                </span>
              </div>
            )}

            {pricingCalculation.taxAmount > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax ({pricingCalculation.taxRate}%):</span>
                  <span className="font-medium text-gray-900">
                    +TRY {pricingCalculation.taxAmount.toFixed(2)}
                  </span>
                </div>
              </>
            )}

            <Separator className="my-2" />

            <div className="flex justify-between text-lg font-bold">
              <span className="text-gray-900">Total Amount:</span>
              <span className="text-blue-600">TRY {pricingCalculation.totalAmount.toFixed(2)}</span>
            </div>

            {pricingCalculation.profitAmount > 0 && (
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600">Net Profit:</span>
                <span className="font-medium text-green-700">
                  TRY {pricingCalculation.profitAmount.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Payment Schedule
          </CardTitle>
          <CardDescription>Configure deposit and balance payment terms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="depositAmount">Deposit Amount (TRY)</Label>
              <Input
                id="depositAmount"
                type="number"
                value={depositAmount}
                onChange={e => setDepositAmount(Number(e.target.value))}
                min={0}
                max={pricingCalculation.totalAmount}
                step={0.01}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Default: 30% (TRY {pricingCalculation.defaultDeposit.toFixed(2)})
              </p>
            </div>

            <div>
              <Label htmlFor="depositDueDate">Deposit Due Date</Label>
              <Input
                id="depositDueDate"
                type="date"
                value={depositDueDate}
                onChange={e => setDepositDueDate(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="balanceAmount">Balance Amount (TRY)</Label>
              <Input
                id="balanceAmount"
                type="number"
                value={balanceAmount.toFixed(2)}
                disabled
                className="mt-2 bg-gray-50"
              />
            </div>

            <div>
              <Label htmlFor="balanceDueDate">Balance Due Date</Label>
              <Input
                id="balanceDueDate"
                type="date"
                value={balanceDueDate}
                onChange={e => setBalanceDueDate(e.target.value)}
                min={depositDueDate}
                max={
                  tripDetails?.travelStartDate
                    ? format(tripDetails.travelStartDate, 'yyyy-MM-dd')
                    : undefined
                }
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Must be before travel start date</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Source, policies, and notes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="bookingSource">Booking Source *</Label>
              <Select value={bookingSource} onValueChange={setBookingSource}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BOOKING_SOURCE_OPTIONS.map(source => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="referralSource">Referral Source</Label>
              <Input
                id="referralSource"
                value={referralSource}
                onChange={e => setReferralSource(e.target.value)}
                placeholder="Who referred this booking?"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${opt.color}`}></span>
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
              <Select value={cancellationPolicyId} onValueChange={setCancellationPolicyId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select policy (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {cancellationPolicies?.map(policy => (
                    <SelectItem key={policy.id} value={policy.id.toString()}>
                      {policy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="campaign">Marketing Campaign</Label>
              <Select value={campaignId} onValueChange={setCampaignId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select campaign (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {marketingCampaigns?.map(campaign => (
                    <SelectItem key={campaign.id} value={campaign.id.toString()}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <Label htmlFor="internalNotes">Internal Notes</Label>
              <Textarea
                id="internalNotes"
                value={internalNotes}
                onChange={e => setInternalNotes(e.target.value)}
                placeholder="Notes visible only to staff..."
                className="mt-2"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="clientNotes">Client Notes</Label>
              <Textarea
                id="clientNotes"
                value={clientNotes}
                onChange={e => setClientNotes(e.target.value)}
                placeholder="Special requests visible to client..."
                className="mt-2"
                rows={4}
              />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="termsAccepted"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="termsAccepted" className="text-sm text-gray-700 cursor-pointer">
                I confirm that all information provided is accurate and I accept the terms and
                conditions for creating this booking. This booking will be processed according to
                our standard policies.
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t sticky bottom-0 bg-white p-4 shadow-lg rounded-lg">
        <Button
          variant="outline"
          onClick={previousStep}
          disabled={createBooking.isPending}
          className="w-full sm:w-auto"
        >
          Back to Services
        </Button>

        <div className="flex-1" />

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit('Draft')}
            disabled={createBooking.isPending}
            className="w-full sm:w-auto"
          >
            {createBooking.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save as Draft'
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => handleSubmit('Quotation')}
            disabled={createBooking.isPending}
            className="w-full sm:w-auto"
          >
            {createBooking.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Quotation'
            )}
          </Button>

          <Button
            onClick={() => handleSubmit('Confirmed')}
            disabled={createBooking.isPending || !termsAccepted}
            className="w-full sm:w-auto"
          >
            {createBooking.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirm Booking
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

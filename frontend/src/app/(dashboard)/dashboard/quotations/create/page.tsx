'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Calendar, Plus, Users } from 'lucide-react';
import { useQuotations, useQuotationServices } from '@/hooks/use-quotations';
import { useB2BClients } from '@/hooks/use-b2b-clients';
import { useB2CClients } from '@/hooks/use-b2c-clients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  quotationFormSchema,
  quotationDefaultValues,
  quotationStatusOptions,
  type QuotationFormData,
  type QuotationServiceFormData,
} from '@/lib/validations/quotations';
import type { QuotationServiceType } from '@/types/quotations';
import { toast } from 'sonner';
import { ServiceSelector } from '@/components/quotations/ServiceSelector';
import { DayTimelineCard } from '@/components/quotations/DayTimelineCard';

interface ServiceItem extends QuotationServiceFormData {
  id: string;
  name: string;
  description: string;
}

export default function CreateQuotationPage() {
  const router = useRouter();
  const { createQuotation, isCreating } = useQuotations();
  const { createService } = useQuotationServices();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState<QuotationServiceType>('hotel');
  const [selectedDate, setSelectedDate] = useState('');
  const [clientType, setClientType] = useState<'b2b' | 'b2c'>('b2c');

  // Fetch clients based on type
  const { b2bClients, isLoading: isLoadingB2B } = useB2BClients();
  const { b2cClients, isLoading: isLoadingB2C } = useB2CClients();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuotationFormData>({
    resolver: zodResolver(quotationFormSchema),
    defaultValues: quotationDefaultValues,
  });

  const currency = watch('currency');
  const travelDatesFrom = watch('travel_dates_from');
  const travelDatesTo = watch('travel_dates_to');

  // Reset client selection when client type changes
  useEffect(() => {
    setValue('client_id', null);
    setValue('operators_client_id', null);
  }, [clientType, setValue]);

  // Calculate days between travel dates
  const tripDays = useMemo(() => {
    if (!travelDatesFrom || !travelDatesTo) return [];

    const startDate = new Date(travelDatesFrom);
    const endDate = new Date(travelDatesTo);
    const days: { dayNumber: number; date: string; dayType: 'arrival' | 'middle' | 'departure' }[] = [];

    const currentDate = new Date(startDate);
    let dayNumber = 1;

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      let dayType: 'arrival' | 'middle' | 'departure' = 'middle';

      if (dayNumber === 1) {
        dayType = 'arrival';
      } else if (currentDate.getTime() === endDate.getTime()) {
        dayType = 'departure';
      }

      days.push({ dayNumber, date: dateStr, dayType });
      currentDate.setDate(currentDate.getDate() + 1);
      dayNumber++;
    }

    return days;
  }, [travelDatesFrom, travelDatesTo]);

  // Calculate total amount whenever services change
  useEffect(() => {
    const total = services.reduce((sum, service) => {
      return sum + (Number(service.total_price) || 0);
    }, 0);
    setTotalAmount(total);
    setValue('total_amount', total);
  }, [services, setValue]);

  const openServiceSelector = (serviceType: QuotationServiceType, date: string) => {
    setSelectedServiceType(serviceType);
    setSelectedDate(date);
    setSelectorOpen(true);
  };

  const handleServiceSelect = (selectedService: any) => {
    const numPassengers = watch('num_passengers') || 1;
    const serviceType = selectedService.serviceType;
    let unitPricePerPerson = selectedService.unitPrice || 0;
    let defaultQuantity = 1;

    // Convert to per-person pricing
    if (serviceType === 'vehicle' || serviceType === 'guide') {
      // Divide vehicle/guide price by number of passengers
      unitPricePerPerson = (selectedService.unitPrice || 0) / numPassengers;
    }

    const newService: ServiceItem = {
      id: `temp-${Date.now()}`,
      service_type: selectedService.serviceType,
      service_description: `${selectedService.name} - ${selectedService.description}`,
      name: selectedService.name,
      description: selectedService.description,
      quantity: defaultQuantity,
      unit_price: unitPricePerPerson,
      total_price: unitPricePerPerson * defaultQuantity * numPassengers,
      currency: currency || 'EUR',
      service_date: selectedDate,
    };
    setServices([...services, newService]);
  };

  const updateService = (id: string, field: string, value: any) => {
    const numPassengers = watch('num_passengers') || 1;
    setServices(
      services.map((service) => {
        if (service.id === id) {
          const updated = { ...service, [field]: value };
          // Recalculate total_price when quantity changes
          if (field === 'quantity') {
            updated.total_price = Number(updated.unit_price) * Number(value) * numPassengers;
          }
          return updated;
        }
        return service;
      })
    );
  };

  const removeService = (id: string) => {
    setServices(services.filter((service) => service.id !== id));
  };

  const getServicesForDate = (date: string) => {
    return services.filter((service) => service.service_date === date);
  };

  const onSubmit = async (data: QuotationFormData) => {
    try {
      // Validate that we have services
      if (services.length === 0) {
        toast.error('Please add at least one service to the quotation');
        return;
      }

      // Create the quotation first
      const quotationData: any = {
        quotationCode: data.quotation_code,
        travelDatesFrom: data.travel_dates_from,
        travelDatesTo: data.travel_dates_to,
        numPassengers: data.num_passengers,
        totalAmount: data.total_amount,
        currency: data.currency,
        validUntil: data.valid_until,
        status: data.status,
        notes: data.notes,
        internalNotes: data.internal_notes,
      };

      // Add client fields only if they have values
      if (data.client_id) {
        quotationData.clientId = data.client_id;
      }
      if (data.operators_client_id) {
        quotationData.operatorsClientId = data.operators_client_id;
      }

      const quotation = await createQuotation(quotationData);

      // If there are services and quotation was created, add them
      if (services.length > 0 && quotation?.id) {
        for (const service of services) {
          await createService({
            quotationId: quotation.id,
            serviceType: service.service_type,
            serviceDescription: service.service_description,
            quantity: service.quantity,
            unitPrice: service.unit_price,
            totalPrice: service.total_price,
            currency: service.currency,
            serviceDate: service.service_date,
          });
        }
      }

      toast.success('Quotation created successfully');
      router.push('/dashboard/quotations');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create quotation');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Quotation</h1>
          <p className="text-muted-foreground">Fill in the details to create a new quotation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the quotation details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quotation_code">Quotation Code (Optional)</Label>
                <Input
                  id="quotation_code"
                  {...register('quotation_code')}
                  placeholder="Leave empty to auto-generate"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for automatic generation (QU-YYYY-timestamp)
                </p>
                {errors.quotation_code && (
                  <p className="text-sm text-red-500">{errors.quotation_code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(value) => setValue('status', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {quotationStatusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_type">Client Type</Label>
                <Select
                  value={clientType}
                  onValueChange={(value) => setClientType(value as 'b2b' | 'b2c')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="b2c">B2C Client (Direct)</SelectItem>
                    <SelectItem value="b2b">B2B Client (Agent/Partner)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">
                  {clientType === 'b2b' ? 'B2B Client' : 'B2C Client'} *
                </Label>
                <Select
                  value={
                    clientType === 'b2b'
                      ? watch('operators_client_id')?.toString() || ''
                      : watch('client_id')?.toString() || ''
                  }
                  onValueChange={(value) => {
                    if (clientType === 'b2b') {
                      setValue('operators_client_id', Number(value));
                      setValue('client_id', null);
                    } else {
                      setValue('client_id', Number(value));
                      setValue('operators_client_id', null);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${clientType === 'b2b' ? 'B2B' : 'B2C'} client`} />
                  </SelectTrigger>
                  <SelectContent>
                    {clientType === 'b2b'
                      ? b2bClients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.fullName}
                            {client.partnerCompanyName && ` (${client.partnerCompanyName})`}
                          </SelectItem>
                        ))
                      : b2cClients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.fullName}
                            {client.email && ` - ${client.email}`}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
                {errors.client_id && (
                  <p className="text-sm text-red-500">{errors.client_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="travel_dates_from">Travel From</Label>
                <Input
                  id="travel_dates_from"
                  type="date"
                  {...register('travel_dates_from')}
                />
                {errors.travel_dates_from && (
                  <p className="text-sm text-red-500">{errors.travel_dates_from.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="travel_dates_to">Travel To</Label>
                <Input
                  id="travel_dates_to"
                  type="date"
                  {...register('travel_dates_to')}
                />
                {errors.travel_dates_to && (
                  <p className="text-sm text-red-500">{errors.travel_dates_to.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="num_passengers">Number of Passengers</Label>
                <Input
                  id="num_passengers"
                  type="number"
                  {...register('num_passengers', { valueAsNumber: true })}
                />
                {errors.num_passengers && (
                  <p className="text-sm text-red-500">{errors.num_passengers.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={watch('currency')}
                  onValueChange={(value) => setValue('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="TRY">TRY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valid_until">Valid Until</Label>
                <Input id="valid_until" type="date" {...register('valid_until')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Client Notes</Label>
              <Textarea id="notes" {...register('notes')} rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internal_notes">Internal Notes</Label>
              <Textarea
                id="internal_notes"
                {...register('internal_notes')}
                rows={3}
                className="bg-yellow-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Day-by-Day Itinerary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Day-by-Day Itinerary
            </CardTitle>
            <CardDescription>
              {tripDays.length > 0
                ? `${tripDays.length} day${tripDays.length !== 1 ? 's' : ''} itinerary`
                : 'Please select travel dates to plan your itinerary'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tripDays.length === 0 ? (
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  Select travel dates above to start planning the day-by-day itinerary
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {tripDays.map((day) => (
                  <DayTimelineCard
                    key={day.date}
                    dayNumber={day.dayNumber}
                    date={day.date}
                    dayType={day.dayType}
                    services={getServicesForDate(day.date)}
                    onAddService={openServiceSelector}
                    onRemoveService={removeService}
                    onUpdateService={updateService}
                    currency={currency || 'EUR'}
                    numPassengers={watch('num_passengers') || 1}
                  />
                ))}
              </div>
            )}

            {/* Total Summary */}
            {services.length > 0 && (
              <>
                <Separator className="my-6" />
                <div className="flex justify-end">
                  <div className="space-y-2 text-right">
                    <div className="text-2xl font-bold">
                      Total: {Number(totalAmount).toFixed(2)} {currency || 'EUR'}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {services.length} service{services.length !== 1 ? 's' : ''} added across{' '}
                      {tripDays.length} day{tripDays.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating || tripDays.length === 0}>
            <Save className="mr-2 h-4 w-4" />
            {isCreating ? 'Creating...' : 'Create Quotation'}
          </Button>
        </div>
      </form>

      {/* Service Selector Dialog */}
      <ServiceSelector
        serviceType={selectedServiceType}
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={handleServiceSelect}
        currency={currency || 'EUR'}
      />
    </div>
  );
}

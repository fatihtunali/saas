'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Hotel,
  User,
  UtensilsCrossed,
  Ticket,
  Package,
  Car,
  Flag,
  FileText,
} from 'lucide-react';
import { useQuotation, useQuotationServices, useQuotations } from '@/hooks/use-quotations';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  quotationFormSchema,
  quotationStatuses,
  type QuotationFormData,
  type QuotationServiceFormData,
} from '@/lib/validations/quotations';
import type { QuotationServiceType } from '@/types/quotations';
import { toast } from 'sonner';
import { ServiceSelector } from '@/components/quotations/ServiceSelector';

interface ServiceItem extends QuotationServiceFormData {
  id: string | number;
  isExisting?: boolean;
}

export default function EditQuotationPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const { quotation, isLoading: quotationLoading } = useQuotation(id);
  const {
    services: existingServices,
    isLoading: servicesLoading,
    createService,
    updateService,
    deleteService,
  } = useQuotationServices(id);
  const { updateQuotation, isUpdating } = useQuotations();

  // Debug: Log isUpdating state
  console.log('isUpdating:', isUpdating);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState<QuotationServiceType>('hotel');
  const [deletedServiceIds, setDeletedServiceIds] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuotationFormData>({
    resolver: zodResolver(quotationFormSchema),
  });

  // Debug: Log form errors
  console.log('Form errors:', errors);

  const currency = watch('currency');

  // Load existing quotation data
  useEffect(() => {
    if (quotation) {
      console.log('Loading quotation, status:', quotation.status);
      setValue('quotation_code', quotation.quotationCode || '');
      setValue('client_id', quotation.clientId || null);
      setValue('operators_client_id', quotation.operatorsClientId || null);
      setValue('travel_dates_from', quotation.travelDatesFrom?.split('T')[0] || '');
      setValue('travel_dates_to', quotation.travelDatesTo?.split('T')[0] || '');
      setValue('num_passengers', quotation.numPassengers || undefined);
      setValue('currency', quotation.currency || 'EUR');
      setValue('valid_until', quotation.validUntil?.split('T')[0] || '');
      // Convert status to lowercase to match schema validation
      setValue('status', (quotation.status || 'draft').toLowerCase() as any);
      setValue('notes', quotation.notes || '');
      setValue('internal_notes', quotation.internalNotes || '');
      setValue('total_amount', quotation.totalAmount || 0);
    }
  }, [quotation, setValue]);

  // Load existing services
  useEffect(() => {
    if (existingServices && existingServices.length > 0) {
      const mappedServices: ServiceItem[] = existingServices.map((service) => ({
        id: service.id,
        service_type: service.serviceType,
        service_description: service.serviceDescription,
        quantity: service.quantity,
        unit_price: service.unitPrice,
        total_price: service.totalPrice,
        currency: service.currency,
        service_date: service.serviceDate?.split('T')[0] || '',
        isExisting: true,
      }));
      setServices(mappedServices);
    }
  }, [existingServices]);

  // Calculate total amount whenever services change
  useEffect(() => {
    const total = services.reduce((sum, service) => {
      return sum + (Number(service.total_price) || 0);
    }, 0);
    setTotalAmount(total);
    setValue('total_amount', total);
  }, [services, setValue]);

  const openServiceSelector = (serviceType: QuotationServiceType) => {
    setSelectedServiceType(serviceType);
    setSelectorOpen(true);
  };

  const handleServiceSelect = (selectedService: any) => {
    const newService: ServiceItem = {
      id: `temp-${Date.now()}`,
      service_type: selectedService.serviceType,
      service_description: `${selectedService.name} - ${selectedService.description}`,
      quantity: 1,
      unit_price: selectedService.unitPrice || 0,
      total_price: selectedService.unitPrice || 0,
      currency: currency || 'EUR',
      service_date: '',
      isExisting: false,
    };
    setServices([...services, newService]);
  };

  const updateServiceItem = (id: string | number, field: keyof ServiceItem, value: any) => {
    setServices(
      services.map((service) => {
        if (service.id === id) {
          const updated = { ...service, [field]: value };
          // Recalculate total_price if quantity or unit_price changed
          if (field === 'quantity' || field === 'unit_price') {
            updated.total_price =
              (updated.quantity || 0) * (updated.unit_price || 0);
          }
          return updated;
        }
        return service;
      })
    );
  };

  const removeService = (serviceId: string | number) => {
    const service = services.find((s) => s.id === serviceId);
    if (service?.isExisting && typeof serviceId === 'number') {
      // Track for deletion on submit
      setDeletedServiceIds([...deletedServiceIds, serviceId]);
    }
    setServices(services.filter((s) => s.id !== serviceId));
  };

  const onSubmit = async (data: QuotationFormData) => {
    try {
      // Update the quotation
      await updateQuotation({
        id,
        data: {
          quotationCode: data.quotation_code,
          clientId: data.client_id || undefined,
          operatorsClientId: data.operators_client_id || undefined,
          travelDatesFrom: data.travel_dates_from,
          travelDatesTo: data.travel_dates_to,
          numPassengers: data.num_passengers,
          totalAmount: data.total_amount,
          currency: data.currency,
          validUntil: data.valid_until,
          status: data.status,
          notes: data.notes,
          internalNotes: data.internal_notes,
        },
      });

      // Delete removed services
      for (const serviceId of deletedServiceIds) {
        await deleteService(serviceId);
      }

      // Update or create services
      for (const service of services) {
        if (service.isExisting && typeof service.id === 'number') {
          // Update existing service
          await updateService({
            id: service.id,
            data: {
              serviceType: service.service_type,
              serviceDescription: service.service_description,
              quantity: service.quantity,
              unitPrice: service.unit_price,
              totalPrice: service.total_price,
              currency: service.currency,
              serviceDate: service.service_date,
            },
          });
        } else {
          // Create new service
          await createService({
            quotationId: id,
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

      toast.success('Quotation updated successfully');
      router.push(`/dashboard/quotations/${id}`);
    } catch (error) {
      console.error('Error updating quotation:', error);
      toast.error('Failed to update quotation');
    }
  };

  const getServiceIcon = (type: QuotationServiceType) => {
    switch (type) {
      case 'hotel':
        return <Hotel className="h-4 w-4" />;
      case 'guide':
        return <User className="h-4 w-4" />;
      case 'restaurant':
        return <UtensilsCrossed className="h-4 w-4" />;
      case 'entrance_fee':
        return <Ticket className="h-4 w-4" />;
      case 'extra':
        return <Package className="h-4 w-4" />;
      case 'vehicle':
        return <Car className="h-4 w-4" />;
      case 'tour_company':
        return <Flag className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (quotationLoading || servicesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">Quotation not found</h3>
          <Button className="mt-4" onClick={() => router.push('/dashboard/quotations')}>
            Back to Quotations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Quotation</h1>
            <p className="text-muted-foreground mt-1">
              Update quotation details and services
            </p>
          </div>
        </div>
        <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isUpdating}>
          <Save className="mr-2 h-4 w-4" />
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update the main quotation details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quotation_code">Quotation Code (Optional)</Label>
                <Input
                  id="quotation_code"
                  placeholder="QT-2025-001"
                  {...register('quotation_code')}
                />
                {errors.quotation_code && (
                  <p className="text-sm text-red-500">{errors.quotation_code.message}</p>
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
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="TRY">TRY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="travel_dates_from">Travel Start Date *</Label>
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
                <Label htmlFor="travel_dates_to">Travel End Date *</Label>
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
                  min="1"
                  {...register('num_passengers', { valueAsNumber: true })}
                />
                {errors.num_passengers && (
                  <p className="text-sm text-red-500">{errors.num_passengers.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="valid_until">Valid Until</Label>
                <Input
                  id="valid_until"
                  type="date"
                  {...register('valid_until')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(value: any) => setValue('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {quotationStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Client Notes</Label>
              <Textarea
                id="notes"
                placeholder="Notes visible to the client"
                rows={3}
                {...register('notes')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internal_notes">Internal Notes</Label>
              <Textarea
                id="internal_notes"
                placeholder="Internal notes (not visible to client)"
                rows={3}
                {...register('internal_notes')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Services Section */}
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
            <CardDescription>Add or remove services from this quotation</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="hotels" className="w-full">
              <TabsList className="grid grid-cols-4 lg:grid-cols-8">
                <TabsTrigger value="hotels" onClick={() => openServiceSelector('hotel')}>
                  <Hotel className="h-4 w-4 mr-1" />
                  Hotels
                </TabsTrigger>
                <TabsTrigger value="guides" onClick={() => openServiceSelector('guide')}>
                  <User className="h-4 w-4 mr-1" />
                  Guides
                </TabsTrigger>
                <TabsTrigger value="restaurants" onClick={() => openServiceSelector('restaurant')}>
                  <UtensilsCrossed className="h-4 w-4 mr-1" />
                  Restaurants
                </TabsTrigger>
                <TabsTrigger value="entrance_fees" onClick={() => openServiceSelector('entrance_fee')}>
                  <Ticket className="h-4 w-4 mr-1" />
                  Fees
                </TabsTrigger>
                <TabsTrigger value="extras" onClick={() => openServiceSelector('extra')}>
                  <Package className="h-4 w-4 mr-1" />
                  Extras
                </TabsTrigger>
                <TabsTrigger value="vehicles" onClick={() => openServiceSelector('vehicle')}>
                  <Car className="h-4 w-4 mr-1" />
                  Vehicles
                </TabsTrigger>
                <TabsTrigger value="tours" onClick={() => openServiceSelector('tour_company')}>
                  <Flag className="h-4 w-4 mr-1" />
                  Tours
                </TabsTrigger>
                <TabsTrigger value="other" onClick={() => openServiceSelector('other')}>
                  <FileText className="h-4 w-4 mr-1" />
                  Other
                </TabsTrigger>
              </TabsList>

              {/* Services List */}
              <div className="mt-6">
                {services.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No services added yet. Click a tab above to add a service.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getServiceIcon(service.service_type)}
                              <span className="capitalize">
                                {service.service_type.replace('_', ' ')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={service.service_description || ''}
                              onChange={(e) =>
                                updateServiceItem(service.id, 'service_description', e.target.value)
                              }
                              placeholder="Description"
                              className="min-w-[200px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="date"
                              value={service.service_date || ''}
                              onChange={(e) =>
                                updateServiceItem(service.id, 'service_date', e.target.value)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={service.quantity || ''}
                              onChange={(e) =>
                                updateServiceItem(
                                  service.id,
                                  'quantity',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              lang="en"
                              value={service.unit_price || ''}
                              onChange={(e) =>
                                updateServiceItem(
                                  service.id,
                                  'unit_price',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            {Number(service.total_price || 0).toFixed(2)} {service.currency}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeService(service.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </Tabs>

            {/* Total Amount */}
            {services.length > 0 && (
              <>
                <Separator className="my-6" />
                <div className="flex justify-end">
                  <div className="space-y-2 text-right">
                    <div className="text-2xl font-bold">
                      Total: {totalAmount.toFixed(2)} {currency || 'EUR'}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {services.length} service{services.length !== 1 ? 's' : ''} added
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
          <Button type="submit" disabled={isUpdating}>
            <Save className="mr-2 h-4 w-4" />
            {isUpdating ? 'Saving...' : 'Save Changes'}
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

'use client';
//ft

import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import { supplierSchema, SUPPLIER_TYPES, SupplierFormData } from '@/lib/validations/suppliers';
import { useSuppliers } from '@/hooks/use-suppliers';
import { useCities } from '@/lib/hooks/useBookingWizard';
import { UpdateSupplierDto } from '@/types/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CitySelector } from '@/components/shared/CitySelector';
import { useEffect } from 'react';

export default function EditSupplierPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const { useSupplier, updateSupplier, isUpdating } = useSuppliers();
  const { data: supplier, isLoading } = useSupplier(id);

  const form = useForm({
    resolver: zodResolver(supplierSchema) as any,
    defaultValues: {
      supplier_type: '',
      company_name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      city_id: undefined,
      tax_id: '',
      payment_terms: '',
      bank_account_info: '',
      notes: '',
      is_active: true,
    },
  });

  // Load supplier data when available
  useEffect(() => {
    if (supplier?.data) {
      const supplierData = supplier.data;
      form.reset({
        supplier_type: supplierData.supplierType || '',
        company_name: supplierData.companyName || '',
        contact_person: supplierData.contactPerson || '',
        email: supplierData.email || '',
        phone: supplierData.phone || '',
        address: supplierData.address || '',
        city_id: supplierData.cityId || undefined,
        tax_id: supplierData.taxId || '',
        payment_terms: supplierData.paymentTerms || '',
        bank_account_info: supplierData.bankAccountInfo || '',
        notes: supplierData.notes || '',
        is_active: supplierData.isActive ?? true,
      } as any);
    }
  }, [supplier, form]);

  const onSubmit = async (data: SupplierFormData) => {
    try {
      // Convert empty strings to undefined and transform to camelCase for API
      const processedData: UpdateSupplierDto = {
        supplierType: data.supplier_type,
        companyName: data.company_name,
        contactPerson: data.contact_person || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        cityId: data.city_id || undefined,
        taxId: data.tax_id || undefined,
        paymentTerms: data.payment_terms || undefined,
        bankAccountInfo: data.bank_account_info || undefined,
        notes: data.notes || undefined,
      };

      await updateSupplier({ id, data: processedData });
      router.push('/dashboard/services/suppliers');
    } catch (error) {
      // Error handled by useSuppliers hook
      console.error('Failed to update supplier:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading supplier...</div>
        </div>
      </div>
    );
  }

  if (!supplier?.data) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-destructive">Supplier not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Supplier</h1>
          <p className="text-muted-foreground">Update supplier information</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Supplier type and company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="supplier_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Type *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUPPLIER_TYPES.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Contact person name"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+90 555 123 4567"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="supplier@example.com"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>Supplier address and city</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Full address"
                        rows={3}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <CitySelector
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select city"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
              <CardDescription>Tax ID, payment terms, and bank details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="tax_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tax registration number"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>Tax identification or registration number</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Terms</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Net 30, 50% advance, etc."
                        rows={3}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>Payment conditions and terms</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bank_account_info"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Account Information</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Bank name, IBAN, SWIFT, account number, etc."
                        rows={4}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>Banking details for payments</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Notes and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Internal notes, special conditions, etc."
                        rows={4}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>Make this supplier available for selection</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              <Save className="mr-2 h-4 w-4" />
              {isUpdating ? 'Updating...' : 'Update Supplier'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

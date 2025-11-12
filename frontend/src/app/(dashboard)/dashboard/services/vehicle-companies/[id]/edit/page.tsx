'use client';
//ft

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import { vehicleCompanySchema, VehicleCompanyFormData } from '@/lib/validations/vehicle-companies';
import { useVehicleCompanies } from '@/hooks/use-vehicle-companies';
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
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { PhoneInput } from '@/components/forms/PhoneInput';

export default function EditVehicleCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = parseInt(params.id as string);
  const { updateVehicleCompany, isUpdating, useVehicleCompany } = useVehicleCompanies();
  const { data: company, isLoading } = useVehicleCompany(companyId);

  const form = useForm({
    resolver: zodResolver(vehicleCompanySchema) as any,
    defaultValues: {
      company_name: '',
      supplier_id: null,
      contact_person: '',
      phone: '',
      email: '',
      is_active: true,
    },
  });

  // Populate form when company data is loaded
  useEffect(() => {
    if (company) {
      const formData = {
        company_name: company.company_name,
        supplier_id: company.supplier_id ?? null,
        contact_person: company.contact_person || '',
        phone: company.phone || '',
        email: company.email || '',
        is_active: company.is_active,
      } as any;
      form.reset(formData);
    }
  }, [company, form]);

  const onSubmit = async (data: VehicleCompanyFormData) => {
    try {
      // Convert empty strings to null for optional fields
      const processedData = {
        ...data,
        supplier_id: data.supplier_id || null,
        contact_person: data.contact_person || null,
        phone: data.phone || null,
        email: data.email || null,
      };

      // @ts-expect-error - Type mismatch between form data and API schema
      await updateVehicleCompany({ id: companyId, data: processedData });
      router.push(`/dashboard/services/vehicle-companies/${companyId}`);
    } catch (error) {
      // Error handled by useVehicleCompanies hook
      console.error('Failed to update vehicle company:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-muted-foreground">Vehicle company not found</p>
          </CardContent>
        </Card>
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
          <h1 className="text-3xl font-bold">Edit Vehicle Company</h1>
          <p className="text-muted-foreground">Update vehicle company information</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Company details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <FormField
                control={form.control}
                name="contact_person"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter contact person name"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <PhoneInput {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="company@example.com"
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
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>Make this company available for bookings</FormDescription>
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
              {isUpdating ? 'Updating...' : 'Update Vehicle Company'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

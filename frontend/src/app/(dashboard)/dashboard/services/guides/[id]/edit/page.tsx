'use client';
//ft

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import { guideSchema, CURRENCIES, GuideFormData } from '@/lib/validations/guides';
import { useGuides } from '@/hooks/use-guides';
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
import { ImageUploader } from '@/components/shared/ImageUploader';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditGuidePage() {
  const router = useRouter();
  const params = useParams();
  const guideId = parseInt(params.id as string);
  const { updateGuide, isUpdating, useGuide } = useGuides();
  const { data: guide, isLoading } = useGuide(guideId);

  const form = useForm({
    resolver: zodResolver(guideSchema) as any,
    defaultValues: {
      guide_name: '',
      supplier_id: null,
      phone: '',
      email: '',
      languages: '',
      daily_rate: null,
      half_day_rate: null,
      night_rate: null,
      transfer_rate: null,
      currency: 'TRY',
      specializations: '',
      license_number: '',
      profile_picture_url: '',
      notes: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (guide) {
      const itemData = guide;
      const formData = {
        guide_name: itemData.guideName,
        supplier_id: itemData.supplierId ?? null,
        phone: itemData.phone || '',
        email: itemData.email || '',
        languages: itemData.languages || '',
        daily_rate: itemData.dailyRate ? Number(itemData.dailyRate) : null,
        half_day_rate: itemData.halfDayRate ? Number(itemData.halfDayRate) : null,
        night_rate: itemData.nightRate ? Number(itemData.nightRate) : null,
        transfer_rate: itemData.transferRate ? Number(itemData.transferRate) : null,
        currency: itemData.currency || 'TRY',
        specializations: itemData.specializations || '',
        license_number: itemData.licenseNumber || '',
        profile_picture_url: itemData.profilePictureUrl || '',
        notes: itemData.notes || '',
        is_active: itemData.isActive,
      } as any;
      form.reset(formData);
    }
  }, [guide, form]);

  const onSubmit = async (data: GuideFormData) => {
    try {
      const processedData = {
        dailyRate: data.daily_rate ? Number(data.daily_rate) : null,
        email: data.email || null,
        halfDayRate: data.half_day_rate ? Number(data.half_day_rate) : null,
        languages: data.languages || null,
        licenseNumber: data.license_number || null,
        nightRate: data.night_rate ? Number(data.night_rate) : null,
        notes: data.notes || null,
        phone: data.phone || null,
        profilePictureUrl: data.profile_picture_url || null,
        specializations: data.specializations || null,
        supplierId: data.supplier_id || null,
        transferRate: data.transfer_rate ? Number(data.transfer_rate) : null,
      };

      // @ts-expect-error - Type mismatch between form data and API schema
      await updateGuide({ id: guideId, data: processedData });
      router.push(`/dashboard/services/guides/${guideId}`);
    } catch (error) {
      console.error('Failed to update guide:', error);
    }
  };

  const currency = form.watch('currency') || 'TRY';

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

  if (!guide) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-muted-foreground">Guide not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Guide</h1>
          <p className="text-muted-foreground">Update guide information</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Guide name and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="guide_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guide Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
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
                        <Input
                          placeholder="+90 555 123 4567"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="guide@example.com"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="languages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Languages</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="English, Turkish, German"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>Comma-separated list</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="license_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Number</FormLabel>
                      <FormControl>
                        <Input placeholder="License number" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="specializations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specializations</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Historical sites, Nature tours, Cultural tours"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>Comma-separated list</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Guide rates for different services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select value={field.value || 'TRY'} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCIES.map(curr => (
                          <SelectItem key={curr} value={curr}>
                            {curr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="daily_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Rate</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            value={field.value || ''}
                            onChange={e =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                            }
                          />
                          <div className="w-16 flex items-center justify-center border rounded-md bg-muted">
                            <span className="text-sm font-medium">{currency}</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="half_day_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Half Day Rate</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            value={field.value || ''}
                            onChange={e =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                            }
                          />
                          <div className="w-16 flex items-center justify-center border rounded-md bg-muted">
                            <span className="text-sm font-medium">{currency}</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="night_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Night Rate</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            value={field.value || ''}
                            onChange={e =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                            }
                          />
                          <div className="w-16 flex items-center justify-center border rounded-md bg-muted">
                            <span className="text-sm font-medium">{currency}</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transfer_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transfer Rate</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            value={field.value || ''}
                            onChange={e =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                            }
                          />
                          <div className="w-16 flex items-center justify-center border rounded-md bg-muted">
                            <span className="text-sm font-medium">{currency}</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Profile picture and notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="profile_picture_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Picture</FormLabel>
                    <FormControl>
                      <ImageUploader value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      <FormDescription>Make this guide available for bookings</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

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
              {isUpdating ? 'Updating...' : 'Update Guide'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

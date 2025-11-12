'use client';
//ft

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  Globe,
  Languages,
  Award,
  Trash2,
  DollarSign,
  Clock,
  Moon,
  Car,
} from 'lucide-react';
import { useGuides } from '@/hooks/use-guides';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function GuideDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const guideId = parseInt(params.id as string);
  const { useGuide, deleteGuide, isDeleting } = useGuides();
  const { data: guide, isLoading } = useGuide(guideId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteGuide(guideId);
    setDeleteDialogOpen(false);
    router.push('/dashboard/services/guides');
  };

  // Parse JSON fields if needed
  const parseJsonField = (field: string | null): string[] => {
    if (!field) return [];
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // If it's not JSON, split by comma
      return field
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
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

  const languages = parseJsonField(guide.languages);
  const specializations = parseJsonField(guide.specializations);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{guide.guide_name}</h1>
              <StatusBadge status={guide.is_active ? 'Active' : 'Inactive'} />
            </div>
            {guide.license_number && (
              <p className="text-sm text-muted-foreground mt-1">License: {guide.license_number}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/services/guides/${guideId}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Profile Picture */}
      {guide.profile_picture_url && (
        <Card>
          <CardContent className="p-0">
            <img
              src={guide.profile_picture_url}
              alt={guide.guide_name}
              className="w-full h-80 object-cover rounded-lg"
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {guide.phone && (
              <>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{guide.phone}</p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {guide.email && (
              <>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{guide.email}</p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {languages.length > 0 && (
              <div className="flex items-start gap-3">
                <Languages className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium mb-2">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang, index) => (
                      <Badge key={index} variant="outline">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Specializations */}
        <Card>
          <CardHeader>
            <CardTitle>Specializations</CardTitle>
          </CardHeader>
          <CardContent>
            {specializations.length > 0 ? (
              <div className="flex items-start gap-3">
                <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    {specializations.map((spec, index) => (
                      <Badge key={index} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specializations listed</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pricing Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Information
          </CardTitle>
          <CardDescription>Service rates in {guide.currency || 'TRY'}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Type</TableHead>
                <TableHead className="text-right">Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guide.daily_rate && (
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Daily Rate (Full Day)
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {guide.daily_rate.toFixed(2)} {guide.currency || 'TRY'}
                  </TableCell>
                </TableRow>
              )}
              {guide.half_day_rate && (
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Half Day Rate
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {guide.half_day_rate.toFixed(2)} {guide.currency || 'TRY'}
                  </TableCell>
                </TableRow>
              )}
              {guide.night_rate && (
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-muted-foreground" />
                      Night Rate
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {guide.night_rate.toFixed(2)} {guide.currency || 'TRY'}
                  </TableCell>
                </TableRow>
              )}
              {guide.transfer_rate && (
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      Transfer Rate
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {guide.transfer_rate.toFixed(2)} {guide.currency || 'TRY'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Notes */}
      {guide.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{guide.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Back Button */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={() => router.push('/dashboard/services/guides')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Guides List
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Guide"
        description="Are you sure you want to delete this guide? This action cannot be undone and will remove all associated data."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}

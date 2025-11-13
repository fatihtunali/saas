'use client';
//ft

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, MapPin, Trash2, Clock, Calendar, Ticket } from 'lucide-react';
import { useEntranceFees } from '@/hooks/use-entrance-fees';
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

export default function EntranceFeeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const entranceFeeId = parseInt(params.id as string);
  const { useEntranceFee, deleteEntranceFee, isDeleting } = useEntranceFees();
  const { data: entranceFee, isLoading } = useEntranceFee(entranceFeeId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteEntranceFee(entranceFeeId);
    setDeleteDialogOpen(false);
    router.push('/dashboard/services/entrance-fees');
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

  if (!entranceFee) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-muted-foreground">Entrance fee not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold">{entranceFee.siteName}</h1>
              <StatusBadge status={entranceFee.isActive ? 'Active' : 'Inactive'} />
            </div>
            <p className="text-muted-foreground mt-1">Entrance Fee Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/services/entrance-fees/${entranceFeeId}/edit`)}
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

      {/* Site Image */}
      {entranceFee.pictureUrl && (
        <Card>
          <CardContent className="p-0">
            <img
              src={entranceFee.pictureUrl}
              alt={entranceFee.siteName}
              className="w-full h-80 object-cover rounded-lg"
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm text-muted-foreground">
                  {entranceFee.cityName || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visit Information */}
        <Card>
          <CardHeader>
            <CardTitle>Visit Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {entranceFee.openingHours && (
              <>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Opening Hours</p>
                    <p className="text-sm text-muted-foreground">{entranceFee.openingHours}</p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {entranceFee.bestVisitTime && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Best Visit Time</p>
                  <p className="text-sm text-muted-foreground">{entranceFee.bestVisitTime}</p>
                </div>
              </div>
            )}

            {!entranceFee.openingHours && !entranceFee.bestVisitTime && (
              <p className="text-sm text-muted-foreground">No visit information available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pricing Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Pricing Information
          </CardTitle>
          <CardDescription>Entry prices in {entranceFee.currency || 'EUR'}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visitor Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entranceFee.adultPrice !== null && (
                <TableRow>
                  <TableCell className="font-medium">Adult</TableCell>
                  <TableCell className="text-right">
                    {Number(entranceFee.adultPrice || 0).toFixed(2)} {entranceFee.currency || 'EUR'}
                  </TableCell>
                </TableRow>
              )}
              {entranceFee.childPrice !== null && (
                <TableRow>
                  <TableCell className="font-medium">Child</TableCell>
                  <TableCell className="text-right">
                    {Number(entranceFee.childPrice || 0).toFixed(2)} {entranceFee.currency || 'EUR'}
                  </TableCell>
                </TableRow>
              )}
              {entranceFee.studentPrice !== null && (
                <TableRow>
                  <TableCell className="font-medium">Student</TableCell>
                  <TableCell className="text-right">
                    {Number(entranceFee.studentPrice || 0).toFixed(2)}{' '}
                    {entranceFee.currency || 'EUR'}
                  </TableCell>
                </TableRow>
              )}
              {entranceFee.seniorPrice !== null && (
                <TableRow>
                  <TableCell className="font-medium">Senior</TableCell>
                  <TableCell className="text-right">
                    {Number(entranceFee.seniorPrice || 0).toFixed(2)}{' '}
                    {entranceFee.currency || 'EUR'}
                  </TableCell>
                </TableRow>
              )}
              {entranceFee.adultPrice === null &&
                entranceFee.childPrice === null &&
                entranceFee.studentPrice === null &&
                entranceFee.seniorPrice === null && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No pricing information available
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Notes */}
      {entranceFee.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{entranceFee.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Back Button */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={() => router.push('/dashboard/services/entrance-fees')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Entrance Fees List
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Entrance Fee"
        description="Are you sure you want to delete this entrance fee? This action cannot be undone and will remove all associated data."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}

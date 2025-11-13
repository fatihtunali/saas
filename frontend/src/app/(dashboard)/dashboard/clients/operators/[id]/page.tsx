'use client';
//ft

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Building2,
  CreditCard,
  Trash2,
  DollarSign,
} from 'lucide-react';
import { useOperators } from '@/hooks/use-operators';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils/formatters';

export default function OperatorDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const operatorId = parseInt(params.id as string);
  const { useOperator, deleteOperator, isDeleting } = useOperators();
  const { data: operator, isLoading } = useOperator(operatorId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteOperator(operatorId);
    setDeleteDialogOpen(false);
    router.push('/dashboard/clients/operators');
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

  if (!operator) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-muted-foreground">Operator not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const operatorData = operator.data;

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
              <h1 className="text-3xl font-bold">{operatorData.companyName}</h1>
              <StatusBadge status={operatorData.isActive ? 'Active' : 'Inactive'} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">Operator ID: {operatorData.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/clients/operators/${operatorId}/edit`)}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{operatorData.contactEmail}</p>
              </div>
            </div>

            {operatorData.contactPhone && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{operatorData.contactPhone}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {operatorData.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{operatorData.address}</p>
                </div>
              </div>
            )}

            {(operatorData.city || operatorData.country) && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">City & Country</p>
                    <p className="text-sm text-muted-foreground">
                      {[operatorData.city, operatorData.country].filter(Boolean).join(', ') || '-'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {operatorData.taxId && (
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Tax ID</p>
                  <p className="text-sm text-muted-foreground">{operatorData.taxId}</p>
                </div>
              </div>
            )}

            <Separator />
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Base Currency</p>
                <p className="text-sm text-muted-foreground">{operatorData.baseCurrency}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Created At</p>
              <p className="text-sm text-muted-foreground">{formatDate(operatorData.createdAt)}</p>
            </div>
            <Separator />
            <div>
              <p className="font-medium">Last Updated</p>
              <p className="text-sm text-muted-foreground">{formatDate(operatorData.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Operator"
        description={`Are you sure you want to delete ${operatorData.companyName}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}

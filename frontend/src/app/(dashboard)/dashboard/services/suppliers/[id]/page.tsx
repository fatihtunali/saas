'use client';
//ft

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  MapPin,
  Phone,
  Mail,
  User,
  Trash2,
  Building2,
  CreditCard,
  FileText,
} from 'lucide-react';
import { useSuppliers } from '@/hooks/use-suppliers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function SupplierDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const supplierId = parseInt(params.id as string);
  const { useSupplier, deleteSupplier, isDeleting } = useSuppliers();
  const { data: supplier, isLoading } = useSupplier(supplierId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteSupplier(supplierId);
    setDeleteDialogOpen(false);
    router.push('/dashboard/services/suppliers');
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

  if (!supplier) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-muted-foreground">Supplier not found</p>
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
              <h1 className="text-3xl font-bold">{supplier.data.companyName}</h1>
              <StatusBadge status={supplier.data.isActive ? 'Active' : 'Inactive'} />
            </div>
            {supplier.data.supplierType && (
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{supplier.data.supplierType}</Badge>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/services/suppliers/${supplierId}/edit`)}
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
            {supplier.data.contactPerson && (
              <>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Contact Person</p>
                    <p className="text-sm text-muted-foreground">{supplier.data.contactPerson}</p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {supplier.data.email && (
              <>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{supplier.data.email}</p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {supplier.data.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{supplier.data.phone}</p>
                </div>
              </div>
            )}

            {!supplier.data.contactPerson && !supplier.data.email && !supplier.data.phone && (
              <p className="text-sm text-muted-foreground">No contact information available</p>
            )}
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {supplier.data.city && (
              <>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">City</p>
                    <p className="text-sm text-muted-foreground">
                      {supplier.data.city?.cityName || 'N/A'}
                    </p>
                  </div>
                </div>
                {supplier.data.address && <Separator />}
              </>
            )}

            {supplier.data.address && (
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{supplier.data.address}</p>
                </div>
              </div>
            )}

            {!supplier.data.city && !supplier.data.address && (
              <p className="text-sm text-muted-foreground">No location information available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Information */}
      {(supplier.data.taxId || supplier.data.bankAccountInfo || supplier.data.paymentTerms) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {supplier.data.taxId && (
              <div>
                <p className="text-sm font-medium mb-1">Tax ID</p>
                <p className="text-sm text-muted-foreground">{supplier.data.taxId}</p>
              </div>
            )}

            {supplier.data.paymentTerms && (
              <>
                {supplier.data.taxId && <Separator />}
                <div>
                  <p className="text-sm font-medium mb-1">Payment Terms</p>
                  <p className="text-sm text-muted-foreground">{supplier.data.paymentTerms}</p>
                </div>
              </>
            )}

            {supplier.data.bankAccountInfo && (
              <>
                {(supplier.data.taxId || supplier.data.paymentTerms) && <Separator />}
                <div>
                  <p className="text-sm font-medium mb-1">Bank Account Information</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {supplier.data.bankAccountInfo}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {supplier.data.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Internal Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{supplier.data.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Back Button */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={() => router.push('/dashboard/services/suppliers')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Suppliers List
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Supplier"
        description="Are you sure you want to delete this supplier? This action cannot be undone and will remove all associated data."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}

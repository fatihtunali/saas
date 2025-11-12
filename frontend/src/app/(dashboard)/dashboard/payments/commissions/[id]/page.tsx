'use client';
//ft

import { use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle2,
  DollarSign,
  Percent,
  Calendar,
  Users,
} from 'lucide-react';
import { useCommissions } from '@/hooks/use-commissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useState } from 'react';
import { CurrencyDisplay } from '@/components/features/payments/CurrencyDisplay';
import { COMMISSION_TYPES } from '@/lib/validations/commissions';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CommissionDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const commissionId = parseInt(resolvedParams.id);
  const { useCommission, deleteCommission, updateCommission } = useCommissions();
  const { data: commission, isLoading } = useCommission(commissionId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteCommission(commissionId);
    setDeleteDialogOpen(false);
    router.push('/dashboard/payments/commissions');
  };

  const handleApprove = async () => {
    if (!commission) return;
    await updateCommission({
      id: commissionId,
      data: { status: 'approved' },
    });
    setApproveDialogOpen(false);
  };

  const handleMarkAsPaid = async () => {
    if (!commission) return;
    await updateCommission({
      id: commissionId,
      data: {
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0],
      },
    });
    setMarkPaidDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!commission) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Commission not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variant = status === 'paid' ? 'default' : status === 'approved' ? 'secondary' : 'outline';
    return <Badge variant={variant}>{status.toUpperCase()}</Badge>;
  };

  const typeConfig = COMMISSION_TYPES.find(t => t.value === commission.commission_type);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Commission #{commission.id}</h1>
              {getStatusBadge(commission.status)}
            </div>
            <p className="text-muted-foreground">Commission Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          {commission.status === 'pending' && (
            <Button variant="default" onClick={() => setApproveDialogOpen(true)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve
            </Button>
          )}
          {commission.status === 'approved' && (
            <Button variant="default" onClick={() => setMarkPaidDialogOpen(true)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark as Paid
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/payments/commissions/${commissionId}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Commission Calculation */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Commission Breakdown
          </CardTitle>
          <CardDescription>How this commission was calculated</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Base Amount</p>
              <p className="text-xl font-bold">
                <CurrencyDisplay
                  amount={commission.commission_base_amount}
                  currency={commission.currency}
                />
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Commission Rate</p>
              <p className="text-xl font-bold flex items-center gap-1">
                <Percent className="h-5 w-5" />
                {commission.commission_percentage}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Commission Amount</p>
              <p className="text-2xl font-bold text-primary">
                <CurrencyDisplay
                  amount={commission.commission_amount}
                  currency={commission.currency}
                />
              </p>
            </div>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-center">
              <span className="font-mono">
                <CurrencyDisplay
                  amount={commission.commission_base_amount}
                  currency={commission.currency}
                />
              </span>
              {' × '}
              <span className="font-mono">{commission.commission_percentage}%</span>
              {' = '}
              <span className="font-mono font-bold">
                <CurrencyDisplay
                  amount={commission.commission_amount}
                  currency={commission.currency}
                />
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Commission Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Commission Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Commission Type</p>
              <Badge variant="outline" className="mt-1">
                {typeConfig?.label || commission.commission_type}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Booking ID</p>
              <Button
                variant="link"
                className="h-auto p-0 font-mono font-medium"
                onClick={() => router.push(`/dashboard/bookings/${commission.booking_id}`)}
              >
                #{commission.booking_id}
              </Button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recipient</p>
              {commission.user_id && <p className="font-medium">User #{commission.user_id}</p>}
              {commission.partner_operator_id && (
                <p className="font-medium">Partner #{commission.partner_operator_id}</p>
              )}
              {!commission.user_id && !commission.partner_operator_id && (
                <p className="text-muted-foreground">Not specified</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Currency</p>
              <Badge>{commission.currency}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              {getStatusBadge(commission.status)}
            </div>
            {commission.due_date && (
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium">{new Date(commission.due_date).toLocaleDateString()}</p>
              </div>
            )}
            {commission.paid_date && (
              <div>
                <p className="text-sm text-muted-foreground">Paid Date</p>
                <p className="font-medium">{new Date(commission.paid_date).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{new Date(commission.created_at).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {commission.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{commission.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
          <CardDescription>Track commission payment progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  commission.status === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-green-500 text-white'
                }`}
              >
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Pending</p>
                <p className="text-sm text-muted-foreground">
                  Commission created and awaiting approval
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  commission.status === 'approved' || commission.status === 'paid'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Approved</p>
                <p className="text-sm text-muted-foreground">
                  {commission.status === 'approved' || commission.status === 'paid'
                    ? 'Commission approved and ready for payment'
                    : 'Awaiting approval'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  commission.status === 'paid'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Paid</p>
                <p className="text-sm text-muted-foreground">
                  {commission.status === 'paid'
                    ? `Paid on ${new Date(commission.paid_date!).toLocaleDateString()}`
                    : 'Not yet paid'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span>{new Date(commission.created_at).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated:</span>
            <span>{new Date(commission.updated_at).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Commission"
        description="Are you sure you want to delete this commission record? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />

      <ConfirmDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        title="Approve Commission"
        description="Are you sure you want to approve this commission? This will allow it to be paid."
        confirmText="Approve"
        onConfirm={handleApprove}
      />

      <ConfirmDialog
        open={markPaidDialogOpen}
        onOpenChange={setMarkPaidDialogOpen}
        title="Mark as Paid"
        description="Are you sure you want to mark this commission as paid? This will set the payment date to today."
        confirmText="Mark as Paid"
        onConfirm={handleMarkAsPaid}
      />
    </div>
  );
}

'use client';
//ft

import { use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { useRefunds } from '@/hooks/use-refunds';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useState } from 'react';
import { CurrencyDisplay } from '@/components/features/payments/CurrencyDisplay';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RefundDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const refundId = parseInt(resolvedParams.id);
  const { useRefund, deleteRefund, updateRefund } = useRefunds();
  const { data: refund, isLoading } = useRefund(refundId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteRefund(refundId);
    setDeleteDialogOpen(false);
    router.push('/dashboard/payments/refunds');
  };

  const handleApprove = async () => {
    if (!refund) return;
    await updateRefund({
      id: refundId,
      data: {
        refund_status: 'approved',
        approved_date: new Date().toISOString().split('T')[0],
        approved_by: 'Admin', // Should be current user
      },
    });
    setApproveDialogOpen(false);
  };

  const handleReject = async () => {
    if (!refund) return;
    await updateRefund({
      id: refundId,
      data: {
        refund_status: 'rejected',
        approved_by: 'Admin', // Should be current user
      },
    });
    setRejectDialogOpen(false);
  };

  const handleMarkAsProcessed = async () => {
    if (!refund) return;
    await updateRefund({
      id: refundId,
      data: {
        refund_status: 'processed',
        processed_date: new Date().toISOString().split('T')[0],
        processed_by: 'Admin', // Should be current user
      },
    });
    setProcessDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!refund) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Refund not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variant =
      status === 'processed'
        ? 'default'
        : status === 'approved'
          ? 'secondary'
          : status === 'rejected'
            ? 'destructive'
            : 'outline';
    return <Badge variant={variant}>{status.toUpperCase()}</Badge>;
  };

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
              <h1 className="text-3xl font-bold">Refund #{refund.id}</h1>
              {getStatusBadge(refund.refund_status)}
            </div>
            <p className="text-muted-foreground">Refund Request Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          {refund.refund_status === 'requested' && (
            <>
              <Button variant="default" onClick={() => setApproveDialogOpen(true)}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button variant="destructive" onClick={() => setRejectDialogOpen(true)}>
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </>
          )}
          {refund.refund_status === 'approved' && (
            <Button variant="default" onClick={() => setProcessDialogOpen(true)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Mark as Processed
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/payments/refunds/${refundId}/edit`)}
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

      {/* Refund Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Refund Amount
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Amount to Refund</p>
              <p className="text-2xl font-bold">
                <CurrencyDisplay amount={refund.refund_amount} currency={refund.currency} />
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Refund Method</p>
              <Badge variant="outline">
                {refund.refund_method.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Currency</p>
              <Badge>{refund.currency}</Badge>
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
              <p className="text-sm text-muted-foreground">Requested Date</p>
              <p className="font-medium">{new Date(refund.requested_date).toLocaleDateString()}</p>
            </div>
            {refund.approved_date && (
              <div>
                <p className="text-sm text-muted-foreground">Approved Date</p>
                <p className="font-medium">{new Date(refund.approved_date).toLocaleDateString()}</p>
              </div>
            )}
            {refund.processed_date && (
              <div>
                <p className="text-sm text-muted-foreground">Processed Date</p>
                <p className="font-medium">
                  {new Date(refund.processed_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Approval Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Timeline</CardTitle>
          <CardDescription>Track the refund request progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  refund.refund_status !== 'requested'
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-500 text-white'
                }`}
              >
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Requested</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(refund.requested_date).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  refund.refund_status === 'approved' || refund.refund_status === 'processed'
                    ? 'bg-green-500 text-white'
                    : refund.refund_status === 'rejected'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                }`}
              >
                {refund.refund_status === 'rejected' ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {refund.refund_status === 'rejected' ? 'Rejected' : 'Approved'}
                </p>
                {refund.approved_date ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {new Date(refund.approved_date).toLocaleString()}
                    </p>
                    {refund.approved_by && (
                      <p className="text-sm text-muted-foreground">By: {refund.approved_by}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Pending approval</p>
                )}
              </div>
            </div>

            {refund.refund_status !== 'rejected' && (
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    refund.refund_status === 'processed'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Processed</p>
                  {refund.processed_date ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {new Date(refund.processed_date).toLocaleString()}
                      </p>
                      {refund.processed_by && (
                        <p className="text-sm text-muted-foreground">By: {refund.processed_by}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not yet processed</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Related Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Original Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Booking ID</p>
              <Button
                variant="link"
                className="h-auto p-0 font-mono font-medium"
                onClick={() => router.push(`/dashboard/bookings/${refund.booking_id}`)}
              >
                #{refund.booking_id}
              </Button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Original Payment ID</p>
              <Button
                variant="link"
                className="h-auto p-0 font-mono font-medium"
                onClick={() =>
                  router.push(`/dashboard/payments/receivables/${refund.client_payment_id}`)
                }
              >
                #{refund.client_payment_id}
              </Button>
            </div>
            {refund.refund_reference && (
              <div>
                <p className="text-sm text-muted-foreground">Refund Reference</p>
                <p className="font-mono text-sm">{refund.refund_reference}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Refund Reason</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{refund.refund_reason}</p>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {refund.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{refund.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span>{new Date(refund.created_at).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated:</span>
            <span>{new Date(refund.updated_at).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Refund"
        description="Are you sure you want to delete this refund record? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />

      <ConfirmDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        title="Approve Refund"
        description="Are you sure you want to approve this refund request? This will allow the refund to be processed."
        confirmText="Approve"
        onConfirm={handleApprove}
      />

      <ConfirmDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        title="Reject Refund"
        description="Are you sure you want to reject this refund request? This action cannot be undone."
        confirmText="Reject"
        onConfirm={handleReject}
        variant="destructive"
      />

      <ConfirmDialog
        open={processDialogOpen}
        onOpenChange={setProcessDialogOpen}
        title="Mark as Processed"
        description="Are you sure you want to mark this refund as processed? This indicates the refund has been completed."
        confirmText="Mark as Processed"
        onConfirm={handleMarkAsProcessed}
      />
    </div>
  );
}

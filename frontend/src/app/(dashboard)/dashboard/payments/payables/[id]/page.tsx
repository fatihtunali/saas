'use client';
//ft

import { use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Building2,
  CreditCard,
  Calendar,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';
import { useSupplierPayments } from '@/hooks/use-supplier-payments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useState } from 'react';
import { PaymentStatusBadge } from '@/components/features/payments/PaymentStatusBadge';
import { PaymentMethodBadge } from '@/components/features/payments/PaymentMethodBadge';
import { CurrencyDisplay } from '@/components/features/payments/CurrencyDisplay';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SupplierPaymentDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const paymentId = parseInt(resolvedParams.id);
  const { useSupplierPayment, deleteSupplierPayment, updateSupplierPayment } =
    useSupplierPayments();
  const { data: payment, isLoading } = useSupplierPayment(paymentId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteSupplierPayment(paymentId);
    setDeleteDialogOpen(false);
    router.push('/dashboard/payments/payables');
  };

  const handleMarkAsPaid = async () => {
    if (!payment) return;
    await updateSupplierPayment({
      id: paymentId,
      data: {
        status: 'paid',
        payment_date: new Date().toISOString().split('T')[0],
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

  if (!payment) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Supplier payment not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOverdue = payment.status === 'pending' && new Date(payment.due_date) < new Date();

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
              <h1 className="text-3xl font-bold">Supplier Payment #{payment.id}</h1>
              <PaymentStatusBadge status={payment.status} type="supplier" />
            </div>
            <p className="text-muted-foreground">Payment Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          {payment.status === 'pending' && (
            <Button variant="default" onClick={() => setMarkPaidDialogOpen(true)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark as Paid
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/payments/payables/${paymentId}/edit`)}
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

      {/* Warning for Overdue */}
      {isOverdue && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <p className="text-destructive font-medium">
              This payment is overdue. Due date was{' '}
              {new Date(payment.due_date).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Payment Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-2xl font-bold">
                <CurrencyDisplay amount={payment.amount} currency={payment.currency} />
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <PaymentMethodBadge method={payment.payment_method} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <PaymentStatusBadge status={payment.status} type="supplier" />
              </div>
            </div>
            {payment.exchange_rate !== 1 && (
              <div>
                <p className="text-sm text-muted-foreground">Exchange Rate</p>
                <p className="font-medium">{payment.exchange_rate}</p>
              </div>
            )}
            {payment.amount_in_base_currency &&
              payment.amount_in_base_currency !== payment.amount && (
                <div>
                  <p className="text-sm text-muted-foreground">Amount in Base Currency</p>
                  <p className="font-medium">
                    <CurrencyDisplay amount={payment.amount_in_base_currency} currency="TRY" />
                  </p>
                </div>
              )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="font-medium">{new Date(payment.due_date).toLocaleDateString()}</p>
            </div>
            {payment.payment_date && (
              <div>
                <p className="text-sm text-muted-foreground">Payment Date</p>
                <p className="font-medium">{new Date(payment.payment_date).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{new Date(payment.created_at).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Related Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Booking & Supplier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Booking ID</p>
              <Button
                variant="link"
                className="h-auto p-0 font-mono font-medium"
                onClick={() => router.push(`/dashboard/bookings/${payment.booking_id}`)}
              >
                #{payment.booking_id}
              </Button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Supplier ID</p>
              <p className="font-medium">#{payment.supplier_id}</p>
            </div>
            {payment.booking_service_id && (
              <div>
                <p className="text-sm text-muted-foreground">Booking Service ID</p>
                <p className="font-medium">#{payment.booking_service_id}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {payment.payment_reference && (
              <div>
                <p className="text-sm text-muted-foreground">Payment Reference</p>
                <p className="font-mono text-sm">{payment.payment_reference}</p>
              </div>
            )}
            {payment.bank_account_id && (
              <div>
                <p className="text-sm text-muted-foreground">Bank Account ID</p>
                <Button
                  variant="link"
                  className="h-auto p-0 font-medium"
                  onClick={() =>
                    router.push(`/dashboard/payments/bank-accounts/${payment.bank_account_id}`)
                  }
                >
                  #{payment.bank_account_id}
                </Button>
              </div>
            )}
            {payment.paid_by && (
              <div>
                <p className="text-sm text-muted-foreground">Paid By</p>
                <p className="font-medium">{payment.paid_by}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {payment.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{payment.notes}</p>
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
            <span>{new Date(payment.created_at).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated:</span>
            <span>{new Date(payment.updated_at).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Supplier Payment"
        description="Are you sure you want to delete this payment record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />

      {/* Mark as Paid Confirmation Dialog */}
      <ConfirmDialog
        open={markPaidDialogOpen}
        onOpenChange={setMarkPaidDialogOpen}
        title="Mark as Paid"
        description="Are you sure you want to mark this payment as paid? This will update the payment status and set the payment date to today."
        confirmText="Mark as Paid"
        cancelText="Cancel"
        onConfirm={handleMarkAsPaid}
      />
    </div>
  );
}

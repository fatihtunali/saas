'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useBookingPayments, useBooking } from '@/lib/hooks/useBookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CreditCard,
  Plus,
  DollarSign,
  Calendar,
  FileText,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Receipt,
  Banknote,
  Building,
  Wallet,
} from 'lucide-react';
import type { BookingPayment, Booking } from '@/types/bookings';

// Utility Functions
function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string): string {
  try {
    return format(new Date(date), 'MMM dd, yyyy');
  } catch {
    return date;
  }
}

function formatDateTime(date: string): string {
  try {
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  } catch {
    return date;
  }
}

// Payment Status Badge
function PaymentStatusBadge({ status }: { status: 'completed' | 'pending' | 'failed' }) {
  const colors = {
    completed: 'bg-green-100 text-green-800 border-green-300',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    failed: 'bg-red-100 text-red-800 border-red-300',
  };

  const icons = {
    completed: <CheckCircle className="h-3 w-3" />,
    pending: <Clock className="h-3 w-3" />,
    failed: <AlertCircle className="h-3 w-3" />,
  };

  return (
    <Badge variant="outline" className={colors[status]}>
      {icons[status]}
      <span className="ml-1 capitalize">{status}</span>
    </Badge>
  );
}

// Payment Method Icon
function PaymentMethodIcon({ method }: { method: string }) {
  const lowerMethod = method.toLowerCase();

  if (
    lowerMethod.includes('card') ||
    lowerMethod.includes('credit') ||
    lowerMethod.includes('debit')
  ) {
    return <CreditCard className="h-4 w-4" />;
  }
  if (lowerMethod.includes('cash')) {
    return <Banknote className="h-4 w-4" />;
  }
  if (lowerMethod.includes('bank') || lowerMethod.includes('transfer')) {
    return <Building className="h-4 w-4" />;
  }
  return <Wallet className="h-4 w-4" />;
}

// Payment Row Component
interface PaymentRowProps {
  payment: BookingPayment;
  onDownloadReceipt: (payment: BookingPayment) => void;
}

function PaymentRow({ payment, onDownloadReceipt }: PaymentRowProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="p-3 rounded-lg bg-primary/10">
          <PaymentMethodIcon method={payment.paymentMethod} />
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="text-sm font-medium">{formatDate(payment.paymentDate)}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="text-sm font-bold text-primary">
              {formatCurrency(payment.amountInBaseCurrency)}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Method</p>
            <div className="flex items-center gap-1">
              <PaymentMethodIcon method={payment.paymentMethod} />
              <p className="text-sm font-medium">{payment.paymentMethod}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Reference</p>
            <p className="text-sm font-mono">{payment.paymentReference || '-'}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <PaymentStatusBadge status={payment.status} />
          </div>
        </div>
      </div>

      <Button variant="ghost" size="sm" onClick={() => onDownloadReceipt(payment)} className="ml-2">
        <Receipt className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Record Payment Dialog Component
interface RecordPaymentDialogProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RecordPaymentFormData) => void;
}

interface RecordPaymentFormData {
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  reference: string;
  notes: string;
}

function RecordPaymentDialog({ booking, open, onOpenChange, onSubmit }: RecordPaymentDialogProps) {
  const [formData, setFormData] = useState<RecordPaymentFormData>({
    amount: 0,
    paymentMethod: 'Cash',
    paymentDate: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      amount: 0,
      paymentMethod: 'Cash',
      paymentDate: new Date().toISOString().split('T')[0],
      reference: '',
      notes: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a new payment for booking {booking.bookingCode}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount *
              </label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount || ''}
                onChange={e =>
                  setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Remaining balance:{' '}
                {formatCurrency(
                  (booking.totalWithTax || booking.totalSellingPrice) - (booking.paidAmount || 0)
                )}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="paymentMethod" className="text-sm font-medium">
                Payment Method *
              </label>
              <select
                id="paymentMethod"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={formData.paymentMethod}
                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                required
              >
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
                <option value="Online Payment">Online Payment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="paymentDate" className="text-sm font-medium">
                Payment Date *
              </label>
              <Input
                id="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={e => setFormData({ ...formData, paymentDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="reference" className="text-sm font-medium">
                Reference Number
              </label>
              <Input
                id="reference"
                type="text"
                placeholder="Transaction reference or receipt number"
                value={formData.reference}
                onChange={e => setFormData({ ...formData, reference: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <Textarea
                id="notes"
                placeholder="Additional notes about this payment"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Record Payment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Main PaymentsTab Component
interface PaymentsTabProps {
  bookingId: string;
}

export default function PaymentsTab({ bookingId }: PaymentsTabProps) {
  const { data: booking } = useBooking(bookingId);
  const { data: payments = [], isLoading } = useBookingPayments(bookingId);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);

  // Calculate payment statistics
  const stats = useMemo(() => {
    if (!booking) return null;

    const totalAmount = booking.totalWithTax || booking.totalSellingPrice;
    const paidAmount = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amountInBaseCurrency, 0);
    const pendingAmount = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amountInBaseCurrency, 0);
    const balanceAmount = totalAmount - paidAmount;
    const paymentProgress = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

    // Determine payment status
    let paymentStatus: 'paid' | 'partial' | 'pending' | 'overdue' = 'pending';
    if (paidAmount >= totalAmount) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0) {
      paymentStatus = 'partial';
    } else if (booking.status === 'CANCELLED') {
      paymentStatus = 'pending';
    }

    return {
      totalAmount,
      paidAmount,
      pendingAmount,
      balanceAmount,
      paymentProgress,
      paymentStatus,
      depositAmount: totalAmount * 0.3, // Assuming 30% deposit
      depositDue: booking.travelStartDate,
      balanceDue: booking.travelStartDate,
    };
  }, [booking, payments]);

  // Handlers
  const handleRecordPayment = (data: RecordPaymentFormData) => {
    console.log('Record payment:', data);
    // TODO: Implement API call to record payment
  };

  const handleDownloadReceipt = (payment: BookingPayment) => {
    console.log('Download receipt for payment:', payment.id);
    // TODO: Implement receipt download
  };

  const handleGenerateReceipt = () => {
    console.log('Generate receipt for all payments');
    // TODO: Implement receipt generation
  };

  // Loading state
  if (isLoading || !booking || !stats) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Empty state
  if (payments.length === 0) {
    return (
      <div className="space-y-6">
        {/* Payment Summary - always show */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(stats.paidAmount)}
              </div>
              <Progress value={stats.paymentProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {formatCurrency(stats.balanceAmount)}
              </div>
              {stats.balanceDue && (
                <p className="text-sm text-muted-foreground mt-2">
                  Due: {formatDate(stats.balanceDue)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No payments recorded</p>
            <p className="text-sm text-muted-foreground mb-4">
              Record the first payment for this booking
            </p>
            <Button onClick={() => setRecordPaymentOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </CardContent>
        </Card>

        <RecordPaymentDialog
          booking={booking}
          open={recordPaymentOpen}
          onOpenChange={setRecordPaymentOpen}
          onSubmit={handleRecordPayment}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payments</h2>
          <p className="text-sm text-muted-foreground">
            {payments.length} payment{payments.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerateReceipt}>
            <Download className="mr-2 h-4 w-4" />
            Generate Receipt
          </Button>
          <Button onClick={() => setRecordPaymentOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            <p className="text-sm text-muted-foreground mt-1">Booking total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(stats.paidAmount)}
            </div>
            <Progress value={stats.paymentProgress} className="mt-2" />
            <p className="text-sm text-muted-foreground mt-1">
              {stats.paymentProgress.toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {formatCurrency(stats.balanceAmount)}
            </div>
            {stats.balanceDue && stats.balanceAmount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Due: {formatDate(stats.balanceDue)}
              </p>
            )}
            {stats.balanceAmount <= 0 && (
              <Badge variant="default" className="mt-2 bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Fully Paid
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deposit & Balance Info */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Schedule</CardTitle>
          <CardDescription>Deposit and balance payment information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Deposit (30%)</h4>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(stats.depositAmount)}</p>
              {stats.depositDue && (
                <p className="text-sm text-muted-foreground mt-1">
                  Due: {formatDate(stats.depositDue)}
                </p>
              )}
              {stats.paidAmount >= stats.depositAmount && (
                <Badge variant="default" className="mt-2 bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Paid
                </Badge>
              )}
            </div>

            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Balance Payment</h4>
              </div>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.totalAmount - stats.depositAmount)}
              </p>
              {stats.balanceDue && (
                <p className="text-sm text-muted-foreground mt-1">
                  Due: {formatDate(stats.balanceDue)}
                </p>
              )}
              {stats.balanceAmount <= 0 && (
                <Badge variant="default" className="mt-2 bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Paid
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Payments */}
      {stats.pendingAmount > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-900">Pending Payments</p>
                <p className="text-sm text-yellow-700">
                  {formatCurrency(stats.pendingAmount)} in pending payments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>All recorded payments for this booking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payments.map(payment => (
              <PaymentRow
                key={payment.id}
                payment={payment}
                onDownloadReceipt={handleDownloadReceipt}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      <RecordPaymentDialog
        booking={booking}
        open={recordPaymentOpen}
        onOpenChange={setRecordPaymentOpen}
        onSubmit={handleRecordPayment}
      />
    </div>
  );
}

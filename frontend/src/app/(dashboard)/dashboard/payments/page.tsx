'use client';
//ft

import { useRouter } from 'next/navigation';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Building2,
  Users,
  FileText,
  Percent,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaymentSummaryCard } from '@/components/features/payments/PaymentSummaryCard';

export default function PaymentsDashboardPage() {
  const router = useRouter();

  // Mock data - replace with actual API calls
  const metrics = {
    totalReceivables: 125000,
    totalPayables: 85000,
    netCashFlow: 40000,
    bankBalance: 250000,
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Financial Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of all payment activities and financial metrics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PaymentSummaryCard
          title="Total Receivables"
          amount={metrics.totalReceivables}
          currency="TRY"
          icon="trending-up"
          variant="success"
          description="Pending + This Month"
          trend="up"
          trendValue="+12% from last month"
        />
        <PaymentSummaryCard
          title="Total Payables"
          amount={metrics.totalPayables}
          currency="TRY"
          icon="trending-down"
          variant="warning"
          description="Pending + Overdue"
          trend="down"
          trendValue="+8% from last month"
        />
        <PaymentSummaryCard
          title="Net Cash Flow"
          amount={metrics.netCashFlow}
          currency="TRY"
          icon="dollar"
          variant="default"
          description="Receivables - Payables"
        />
        <PaymentSummaryCard
          title="Bank Balances"
          amount={metrics.bankBalance}
          currency="TRY"
          icon="dollar"
          variant="success"
          description="All accounts combined"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common payment operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => router.push('/dashboard/payments/receivables/create')}
            >
              <TrendingUp className="h-6 w-6" />
              <span>Record Payment</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => router.push('/dashboard/payments/payables/create')}
            >
              <TrendingDown className="h-6 w-6" />
              <span>Schedule Payment</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => router.push('/dashboard/payments/refunds/create')}
            >
              <FileText className="h-6 w-6" />
              <span>Process Refund</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => router.push('/dashboard/payments/bank-accounts/create')}
            >
              <Building2 className="h-6 w-6" />
              <span>Add Bank Account</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Module Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => router.push('/dashboard/payments/bank-accounts')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bank Accounts
            </CardTitle>
            <CardDescription>Manage company bank accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">5 Active</p>
            <p className="text-sm text-muted-foreground">4 currencies supported</p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => router.push('/dashboard/payments/receivables')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Client Payments
            </CardTitle>
            <CardDescription>Track receivables from clients</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">125,000 TRY</p>
            <p className="text-sm text-muted-foreground">23 pending payments</p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => router.push('/dashboard/payments/payables')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              Supplier Payments
            </CardTitle>
            <CardDescription>Manage payables to suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">85,000 TRY</p>
            <p className="text-sm text-muted-foreground">12 pending, 3 overdue</p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => router.push('/dashboard/payments/refunds')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Refunds
            </CardTitle>
            <CardDescription>Process and track refunds</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">15,000 TRY</p>
            <p className="text-sm text-muted-foreground">5 pending approval</p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => router.push('/dashboard/payments/commissions')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-purple-600" />
              Commissions
            </CardTitle>
            <CardDescription>Track and manage commissions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">28,000 TRY</p>
            <p className="text-sm text-muted-foreground">18 pending, 45 paid</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

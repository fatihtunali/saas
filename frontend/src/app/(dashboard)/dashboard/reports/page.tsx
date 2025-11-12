'use client';
//ft

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  CreditCard,
  Percent,
  Calendar,
  CheckCircle,
  MapPin,
  XCircle,
  GitBranch,
  Activity,
  User,
  Building,
  Car,
  Users,
  History,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportHeader } from '@/components/features/reports/ReportHeader';
import { ALL_REPORTS, REPORT_CATEGORIES } from '@/types/reports';

const ICON_MAP: Record<string, any> = {
  TrendingUp,
  DollarSign,
  Receipt,
  CreditCard,
  Percent,
  Calendar,
  CheckCircle,
  MapPin,
  XCircle,
  GitBranch,
  Activity,
  User,
  Building,
  Car,
  Users,
  History,
  AlertTriangle,
};

export default function ReportsPage() {
  const getReportsByCategory = (category: string) => {
    return ALL_REPORTS.filter(report => report.category === category);
  };

  return (
    <div className="container mx-auto py-6">
      <ReportHeader
        title="Reports & Analytics"
        description="Comprehensive business intelligence and reporting for your tour operations"
        helpText="Access detailed reports across financial, booking, operations, and client categories. Click on any report to view detailed analytics with export capabilities."
      />

      <div className="space-y-8">
        {REPORT_CATEGORIES.map(category => {
          const categoryReports = getReportsByCategory(category.id);
          const CategoryIcon = ICON_MAP[category.icon];

          return (
            <div key={category.id}>
              <div className="flex items-center gap-2 mb-4">
                {CategoryIcon && <CategoryIcon className="h-6 w-6 text-primary" />}
                <h2 className="text-2xl font-bold">{category.label}</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryReports.map(report => {
                  const ReportIcon = ICON_MAP[report.icon];

                  return (
                    <Link key={report.id} href={report.path}>
                      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-2">
                                {ReportIcon && <ReportIcon className="h-5 w-5" />}
                                {report.title}
                              </CardTitle>
                              <CardDescription className="mt-2">
                                {report.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Button variant="outline" className="w-full">
                            View Report
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Quick Access</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/reports/financial/revenue">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Revenue Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-muted-foreground">Most Popular</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/reports/financial/receivables-aging">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Receivables Aging</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-muted-foreground">Financial Control</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/reports/bookings/by-date">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Bookings by Date</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-muted-foreground">Booking Analysis</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/reports/clients/revenue-analysis">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Client Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <span className="text-xs text-muted-foreground">Top Clients</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

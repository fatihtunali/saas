//ft
/**
 * Activity Log Page
 * Phase 9: User Management & Permissions
 */

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ActivityLogTimeline } from '@/components/features/users';
import { useMyActivity } from '@/lib/hooks/use-profile';
import { ArrowLeft, Activity, Download, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { ActivityLogFilters } from '@/types/users';

export default function ActivityPage() {
  const [filters, setFilters] = useState<Omit<ActivityLogFilters, 'user_id'>>({
    page: 1,
    limit: 50,
  });

  const { data, isLoading } = useMyActivity(filters);

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export activity log');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Settings
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
            <p className="text-muted-foreground mt-1">
              View your recent actions and system activity
            </p>
          </div>

          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={filters.module || 'all'}
            onValueChange={value =>
              setFilters(prev => ({
                ...prev,
                module: value === 'all' ? undefined : value,
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="dashboard">Dashboard</SelectItem>
              <SelectItem value="bookings">Bookings</SelectItem>
              <SelectItem value="clients">Clients</SelectItem>
              <SelectItem value="services">Services</SelectItem>
              <SelectItem value="payments">Payments</SelectItem>
              <SelectItem value="reports">Reports</SelectItem>
              <SelectItem value="users">Users</SelectItem>
              <SelectItem value="settings">Settings</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.action || 'all'}
            onValueChange={value =>
              setFilters(prev => ({
                ...prev,
                action: value === 'all' ? undefined : value,
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="view">View</SelectItem>
              <SelectItem value="export">Export</SelectItem>
            </SelectContent>
          </Select>

          {(filters.module || filters.action) && (
            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  page: 1,
                  limit: 50,
                })
              }
            >
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Activity Timeline */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Your Activity</h3>
            <p className="text-sm text-muted-foreground">
              {data?.pagination ? `${data.pagination.total} activities recorded` : 'Loading...'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <ActivitySkeleton />
        ) : data?.activities && data.activities.length > 0 ? (
          <>
            <ActivityLogTimeline
              activities={data.activities}
              showDetails={true}
              maxHeight="800px"
            />

            {/* Pagination */}
            {data.pagination && data.pagination.total_pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {data.pagination.page} of {data.pagination.total_pages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFilters(prev => ({
                        ...prev,
                        page: Math.max(1, (prev.page || 1) - 1),
                      }))
                    }
                    disabled={data.pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFilters(prev => ({
                        ...prev,
                        page: (prev.page || 1) + 1,
                      }))
                    }
                    disabled={data.pagination.page === data.pagination.total_pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No activity found</p>
            {(filters.module || filters.action) && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() =>
                  setFilters({
                    page: 1,
                    limit: 50,
                  })
                }
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

'use client';
//ft

import { DashboardGrid } from '@/components/features/dashboard/DashboardGrid';
import { MetricsSection } from '@/components/features/dashboard/MetricsSection';
import { ChartsSection } from '@/components/features/dashboard/ChartsSection';
import { QuickActions } from '@/components/features/dashboard/QuickActions';
import { UpcomingTours } from '@/components/features/dashboard/UpcomingTours';
import { RecentActivity } from '@/components/features/dashboard/RecentActivity';
import { GlobalSearch } from '@/components/features/dashboard/GlobalSearch';

/**
 * Dashboard Page
 *
 * Main dashboard page with metrics, charts, activity feed, and quick actions.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6 pb-8">
      {/* Global Search Dialog - Accessible via Cmd+K or Ctrl+K */}
      <GlobalSearch />

      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your Tour Operations dashboard</p>
      </div>

      {/* Dashboard Grid Layout */}
      <DashboardGrid>
        {/* Metrics Section - 4 cards in a row */}
        <DashboardGrid.MetricsSection>
          <MetricsSection />
        </DashboardGrid.MetricsSection>

        {/* Charts Section - 2 charts side by side */}
        <DashboardGrid.ChartsSection>
          <ChartsSection />
        </DashboardGrid.ChartsSection>

        {/* Bottom Section - Activity (2/3) + Quick Actions (1/3) */}
        <DashboardGrid.BottomSection>
          {/* Recent Activity Section */}
          <DashboardGrid.ActivitySection>
            <RecentActivity limit={10} defaultTab="bookings" />
          </DashboardGrid.ActivitySection>

          {/* Quick Actions Section */}
          <DashboardGrid.QuickActionsSection sticky>
            <div className="space-y-6">
              <QuickActions />
              <UpcomingTours />
            </div>
          </DashboardGrid.QuickActionsSection>
        </DashboardGrid.BottomSection>
      </DashboardGrid>
    </div>
  );
}

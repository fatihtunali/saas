//ft
/**
 * Settings Dashboard Page
 * Phase 9: User Management & Permissions
 */

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/lib/hooks/use-profile';
import { useMyActivity } from '@/lib/hooks/use-profile';
import { useIsAdmin } from '@/lib/hooks/use-permissions';
import Link from 'next/link';
import {
  User,
  Lock,
  Activity,
  Settings as SettingsIcon,
  ChevronRight,
  Shield,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: activityData } = useMyActivity({ limit: 5 });
  const isAdmin = useIsAdmin();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile, security, and preferences</p>
      </div>

      {/* Profile Summary */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              {profileLoading ? (
                <>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">{profile?.full_name}</h2>
                  <p className="text-muted-foreground">{profile?.email}</p>
                  {profile?.last_login && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Last login:{' '}
                      {formatDistanceToNow(new Date(profile.last_login), { addSuffix: true })}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Access Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SettingCard
          icon={User}
          title="Profile"
          description="Update your personal information"
          href="/dashboard/settings/profile"
        />
        <SettingCard
          icon={Lock}
          title="Security"
          description="Change password and security settings"
          href="/dashboard/settings/security"
        />
        <SettingCard
          icon={Activity}
          title="Activity Log"
          description="View your recent activity"
          href="/dashboard/settings/activity"
        />
      </div>

      {/* Admin Settings */}
      {isAdmin && (
        <Card className="p-6 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Administrator Settings</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Access advanced system settings and user management
              </p>
              <Link href="/dashboard/users">
                <Button variant="outline" size="sm">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      {activityData?.activities && activityData.activities.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <Link href="/dashboard/settings/activity">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {activityData.activities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {activity.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.module} •{' '}
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

interface SettingCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

function SettingCard({ icon: Icon, title, description, href }: SettingCardProps) {
  return (
    <Link href={href}>
      <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </div>
      </Card>
    </Link>
  );
}

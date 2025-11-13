'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  // Wait for hydration before checking auth
  useEffect(() => {
    if (_hasHydrated) {
      setIsReady(true);

      // Only redirect after hydration is complete
      if (!isAuthenticated) {
        router.push('/login');
      }
    }
  }, [_hasHydrated, isAuthenticated, router]);

  // Show nothing while hydrating or redirecting
  if (!isReady || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="pl-64 transition-all duration-300">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="p-6">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs />
          </div>

          {/* Page Content */}
          {children}
        </main>
      </div>
    </div>
  );
}

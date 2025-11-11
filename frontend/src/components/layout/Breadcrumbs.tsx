'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export function Breadcrumbs() {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Add home/dashboard
    breadcrumbs.push({
      label: 'Dashboard',
      href: '/dashboard',
    });

    // Skip the first 'dashboard' since we already added it
    const relevantPaths = paths.slice(1);

    let currentPath = '/dashboard';
    relevantPaths.forEach(path => {
      currentPath += `/${path}`;
      // Convert path to readable label (e.g., 'new-booking' -> 'New Booking')
      const label = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbs.push({
        label,
        href: currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on dashboard home
  if (pathname === '/dashboard') {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-primary-600 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbs.slice(1).map((item, index) => {
        const isLast = index === breadcrumbs.length - 2;
        return (
          <Fragment key={item.href}>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-gray-900">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-primary-600 transition-colors">
                {item.label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}

'use client';
//ft

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, Globe } from 'lucide-react';

/**
 * Clients Landing Page
 *
 * Provides quick navigation to different client types:
 * - B2B Clients (Travel Agencies)
 * - B2C Clients (Individual Customers)
 * - Operators (Tour Operator Companies)
 */
export default function ClientsPage() {
  const router = useRouter();

  const clientTypes = [
    {
      title: 'B2B Clients',
      description: 'Manage travel agencies and business partners',
      icon: Building2,
      href: '/dashboard/clients/b2b',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'B2C Clients',
      description: 'Manage individual customers and travelers',
      icon: Users,
      href: '/dashboard/clients/b2c',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Operators',
      description: 'Manage tour operator companies (Super Admin only)',
      icon: Globe,
      href: '/dashboard/clients/operators',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
        <p className="mt-2 text-gray-600">
          Select a client type to manage your business relationships
        </p>
      </div>

      {/* Client Type Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {clientTypes.map(type => (
          <Card
            key={type.href}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(type.href)}
          >
            <CardHeader>
              <div
                className={`w-12 h-12 rounded-lg ${type.bgColor} flex items-center justify-center mb-4`}
              >
                <type.icon className={`w-6 h-6 ${type.color}`} />
              </div>
              <CardTitle>{type.title}</CardTitle>
              <CardDescription>{type.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={e => {
                  e.stopPropagation();
                  router.push(type.href);
                }}
              >
                View {type.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats Section (Optional) */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <p className="text-sm text-gray-600">Total B2B Clients</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">0</div>
              <p className="text-sm text-gray-600">Total B2C Clients</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <p className="text-sm text-gray-600">Total Operators</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

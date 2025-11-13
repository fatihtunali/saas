'use client';

import React, { useState } from 'react';
import {
  Clock,
  FileText,
  DollarSign,
  Upload,
  Mail,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Settings,
  Download,
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Types
interface TimelineEvent {
  id: string;
  type:
    | 'booking_created'
    | 'status_change'
    | 'payment'
    | 'document'
    | 'service'
    | 'passenger'
    | 'email'
    | 'note'
    | 'voucher';
  title: string;
  description: string;
  userName: string;
  userId: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

interface TimelineTabProps {
  bookingId: string;
}

// Mock hook - replace with actual implementation
const useBookingTimeline = (bookingId: string, filterType: string) => {
  const [timeline] = useState<TimelineEvent[]>([
    {
      id: '1',
      type: 'booking_created',
      title: 'Booking Created',
      description: 'Booking BKG-2025-001 was created',
      userName: 'Admin User',
      userId: '1',
      createdAt: '2025-01-05T09:00:00Z',
    },
    {
      id: '2',
      type: 'passenger',
      title: 'Passenger Added',
      description: 'Added passenger: John Smith',
      userName: 'Admin User',
      userId: '1',
      createdAt: '2025-01-05T09:15:00Z',
    },
    {
      id: '3',
      type: 'service',
      title: 'Service Added',
      description: 'Added service: Grand Hyatt Hotel - 3 nights',
      userName: 'Admin User',
      userId: '1',
      createdAt: '2025-01-05T09:30:00Z',
    },
    {
      id: '4',
      type: 'status_change',
      title: 'Status Changed',
      description: 'Status changed from Pending to Confirmed',
      userName: 'John Doe',
      userId: '2',
      createdAt: '2025-01-06T10:00:00Z',
      metadata: { from: 'Pending', to: 'Confirmed' },
    },
    {
      id: '5',
      type: 'payment',
      title: 'Payment Received',
      description: 'Payment of $500 received via Credit Card',
      userName: 'System',
      userId: 'system',
      createdAt: '2025-01-06T14:30:00Z',
      metadata: { amount: 500, method: 'Credit Card' },
    },
    {
      id: '6',
      type: 'email',
      title: 'Email Sent',
      description: 'Booking confirmation email sent to client',
      userName: 'System',
      userId: 'system',
      createdAt: '2025-01-06T14:35:00Z',
      metadata: { template: 'Booking Confirmation' },
    },
    {
      id: '7',
      type: 'document',
      title: 'Document Uploaded',
      description: 'Uploaded document: hotel_voucher_grand_hyatt.pdf',
      userName: 'John Doe',
      userId: '2',
      createdAt: '2025-01-10T10:30:00Z',
    },
    {
      id: '8',
      type: 'voucher',
      title: 'Voucher Generated',
      description: 'Hotel voucher generated and sent to client',
      userName: 'System',
      userId: 'system',
      createdAt: '2025-01-10T11:00:00Z',
    },
    {
      id: '9',
      type: 'note',
      title: 'Note Added',
      description: 'Client requested early check-in',
      userName: 'Jane Smith',
      userId: '3',
      createdAt: '2025-01-11T15:20:00Z',
    },
    {
      id: '10',
      type: 'payment',
      title: 'Payment Received',
      description: 'Final payment of $500 received via Bank Transfer',
      userName: 'System',
      userId: 'system',
      createdAt: '2025-01-12T09:00:00Z',
      metadata: { amount: 500, method: 'Bank Transfer' },
    },
  ]);

  // Filter timeline based on selected type
  const filteredTimeline =
    filterType === 'all'
      ? timeline
      : timeline.filter(event => {
          switch (filterType) {
            case 'booking':
              return ['booking_created', 'status_change', 'service', 'passenger'].includes(
                event.type
              );
            case 'payment':
              return event.type === 'payment';
            case 'communication':
              return ['email', 'note'].includes(event.type);
            case 'document':
              return ['document', 'voucher'].includes(event.type);
            default:
              return true;
          }
        });

  return {
    timeline: filteredTimeline,
    isLoading: false,
    error: null,
  };
};

// Helper function to get event icon
const getEventIcon = (type: TimelineEvent['type']) => {
  const iconClass = 'h-4 w-4';

  switch (type) {
    case 'booking_created':
      return <Calendar className={iconClass} />;
    case 'status_change':
      return <CheckCircle className={iconClass} />;
    case 'payment':
      return <DollarSign className={iconClass} />;
    case 'document':
      return <Upload className={iconClass} />;
    case 'service':
      return <Settings className={iconClass} />;
    case 'passenger':
      return <User className={iconClass} />;
    case 'email':
      return <Mail className={iconClass} />;
    case 'note':
      return <MessageSquare className={iconClass} />;
    case 'voucher':
      return <FileText className={iconClass} />;
    default:
      return <AlertCircle className={iconClass} />;
  }
};

// Helper function to get event color
const getEventColor = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'booking_created':
      return 'bg-blue-500';
    case 'status_change':
      return 'bg-green-500';
    case 'payment':
      return 'bg-emerald-500';
    case 'document':
    case 'voucher':
      return 'bg-purple-500';
    case 'service':
    case 'passenger':
      return 'bg-orange-500';
    case 'email':
      return 'bg-cyan-500';
    case 'note':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

export function TimelineTab({ bookingId }: TimelineTabProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const { timeline, isLoading, error } = useBookingTimeline(bookingId, filterType);

  // Handle export timeline
  const handleExport = async () => {
    try {
      // TODO: Implement export logic
      console.log('Exporting timeline');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading timeline...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-destructive">Failed to load timeline</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="booking">Booking Changes</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
                <SelectItem value="communication">Communications</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Timeline
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity Timeline ({timeline.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No events found</p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              {/* Events */}
              <div className="space-y-6">
                {timeline.map((event, index) => (
                  <div key={event.id} className="relative flex gap-4">
                    {/* Icon */}
                    <div
                      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background ${getEventColor(
                        event.type
                      )}`}
                    >
                      <div className="text-white">{getEventIcon(event.type)}</div>
                    </div>

                    {/* Content */}
                    <Card className="flex-1">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{event.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {event.type.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            {event.metadata && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                {event.metadata.from && event.metadata.to && (
                                  <span>
                                    {event.metadata.from} → {event.metadata.to}
                                  </span>
                                )}
                                {event.metadata.amount && (
                                  <span className="font-semibold text-green-600">
                                    ${event.metadata.amount}
                                  </span>
                                )}
                                {event.metadata.method && <span> via {event.metadata.method}</span>}
                                {event.metadata.template && (
                                  <span>Template: {event.metadata.template}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground text-right whitespace-nowrap">
                            <p>{format(new Date(event.createdAt), 'MMM dd, yyyy')}</p>
                            <p className="text-xs">{format(new Date(event.createdAt), 'HH:mm')}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">by {event.userName}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

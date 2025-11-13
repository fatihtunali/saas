'use client';

import React, { useState } from 'react';
import {
  Mail,
  Send,
  MessageSquare,
  Paperclip,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Repeat,
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Types
interface Communication {
  id: string;
  type: 'email' | 'sms';
  subject: string;
  message: string;
  recipient: string;
  status: 'sent' | 'failed' | 'opened' | 'pending';
  sentAt: string;
  sentBy: string;
  attachments?: { name: string; size: number; url: string }[];
  template?: string;
}

interface InternalNote {
  id: string;
  content: string;
  userName: string;
  userId: string;
  createdAt: string;
}

interface CommunicationTabProps {
  bookingId: string;
  clientEmail: string;
  clientName: string;
}

// Mock hooks - replace with actual implementations
const useBookingCommunications = (bookingId: string) => {
  const [communications] = useState<Communication[]>([
    {
      id: '1',
      type: 'email',
      subject: 'Booking Confirmation - BKG-2025-001',
      message:
        'Dear John Smith, Your booking has been confirmed. Please find the details attached.',
      recipient: 'john.smith@example.com',
      status: 'opened',
      sentAt: '2025-01-06T14:35:00Z',
      sentBy: 'Admin User',
      template: 'Booking Confirmation',
      attachments: [
        { name: 'booking_confirmation.pdf', size: 125000, url: '/files/confirmation.pdf' },
      ],
    },
    {
      id: '2',
      type: 'email',
      subject: 'Payment Reminder - Invoice #2025-001',
      message: 'This is a friendly reminder about your pending payment of $500.',
      recipient: 'john.smith@example.com',
      status: 'sent',
      sentAt: '2025-01-08T10:00:00Z',
      sentBy: 'System',
      template: 'Payment Reminder',
    },
    {
      id: '3',
      type: 'email',
      subject: 'Your Hotel Vouchers',
      message: 'Please find attached your hotel vouchers for your upcoming stay.',
      recipient: 'john.smith@example.com',
      status: 'opened',
      sentAt: '2025-01-10T11:15:00Z',
      sentBy: 'John Doe',
      template: 'Send Vouchers',
      attachments: [
        { name: 'hotel_voucher.pdf', size: 245000, url: '/files/voucher.pdf' },
        { name: 'transfer_voucher.pdf', size: 198000, url: '/files/transfer.pdf' },
      ],
    },
    {
      id: '4',
      type: 'email',
      subject: 'Thank You for Your Booking',
      message: 'Thank you for choosing our services. We hope you have a wonderful trip!',
      recipient: 'john.smith@example.com',
      status: 'sent',
      sentAt: '2025-01-12T16:00:00Z',
      sentBy: 'Admin User',
      template: 'Thank You',
    },
  ]);

  return {
    communications,
    isLoading: false,
    error: null,
  };
};

const useBookingNotes = (bookingId: string) => {
  const [notes] = useState<InternalNote[]>([
    {
      id: '1',
      content: 'Client requested early check-in at 10 AM. Confirmed with hotel.',
      userName: 'Jane Smith',
      userId: '3',
      createdAt: '2025-01-11T15:20:00Z',
    },
    {
      id: '2',
      content: 'Vegetarian meals requested for all tours. Noted in system.',
      userName: 'John Doe',
      userId: '2',
      createdAt: '2025-01-09T11:30:00Z',
    },
    {
      id: '3',
      content: 'Client is a repeat customer. Offer 10% discount on next booking.',
      userName: 'Admin User',
      userId: '1',
      createdAt: '2025-01-05T14:00:00Z',
    },
  ]);

  return {
    notes,
    isLoading: false,
    error: null,
  };
};

// Email templates
const EMAIL_TEMPLATES = {
  confirmation: {
    subject: 'Booking Confirmation - [BOOKING_ID]',
    body: `Dear [CLIENT_NAME],

Thank you for your booking! We are pleased to confirm your reservation.

Booking ID: [BOOKING_ID]
Total Amount: [TOTAL_AMOUNT]

Your booking details are attached to this email.

If you have any questions, please don't hesitate to contact us.

Best regards,
[COMPANY_NAME]`,
  },
  payment_reminder: {
    subject: 'Payment Reminder - Invoice #[INVOICE_NUMBER]',
    body: `Dear [CLIENT_NAME],

This is a friendly reminder about your pending payment for booking [BOOKING_ID].

Amount Due: [AMOUNT_DUE]
Due Date: [DUE_DATE]

Please complete the payment at your earliest convenience.

Best regards,
[COMPANY_NAME]`,
  },
  vouchers: {
    subject: 'Your Travel Vouchers - [BOOKING_ID]',
    body: `Dear [CLIENT_NAME],

Please find attached your travel vouchers for booking [BOOKING_ID].

Please present these vouchers to the respective service providers.

Have a wonderful trip!

Best regards,
[COMPANY_NAME]`,
  },
  itinerary: {
    subject: 'Your Travel Itinerary - [BOOKING_ID]',
    body: `Dear [CLIENT_NAME],

Please find attached your complete travel itinerary for booking [BOOKING_ID].

Review the details carefully and contact us if you have any questions.

Best regards,
[COMPANY_NAME]`,
  },
  custom: {
    subject: '',
    body: '',
  },
};

// Helper function to get status icon
const getStatusIcon = (status: Communication['status']) => {
  switch (status) {
    case 'sent':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'opened':
      return <Mail className="h-4 w-4 text-blue-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

// Helper function to get status badge variant
const getStatusVariant = (
  status: Communication['status']
): 'default' | 'destructive' | 'outline' | 'secondary' => {
  switch (status) {
    case 'sent':
    case 'opened':
      return 'default';
    case 'failed':
      return 'destructive';
    case 'pending':
      return 'secondary';
    default:
      return 'outline';
  }
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export function CommunicationTab({
  bookingId,
  clientEmail,
  clientName,
}: CommunicationTabProps) {
  const {
    communications,
    isLoading: loadingComms,
    error: commsError,
  } = useBookingCommunications(bookingId);
  const { notes, isLoading: loadingNotes, error: notesError } = useBookingNotes(bookingId);

  // Email form state
  const [template, setTemplate] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSending, setIsSending] = useState(false);

  // Note form state
  const [noteContent, setNoteContent] = useState<string>('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Handle template change
  const handleTemplateChange = (value: string) => {
    setTemplate(value);
    if (value && EMAIL_TEMPLATES[value as keyof typeof EMAIL_TEMPLATES]) {
      const selectedTemplate = EMAIL_TEMPLATES[value as keyof typeof EMAIL_TEMPLATES];
      setSubject(
        selectedTemplate.subject
          .replace('[BOOKING_ID]', bookingId)
          .replace('[CLIENT_NAME]', clientName)
      );
      setMessage(
        selectedTemplate.body
          .replace('[BOOKING_ID]', bookingId)
          .replace('[CLIENT_NAME]', clientName)
      );
    }
  };

  // Handle send email
  const handleSendEmail = async () => {
    if (!subject || !message) {
      alert('Please fill in subject and message');
      return;
    }

    setIsSending(true);
    try {
      // TODO: Implement actual send email logic
      console.log('Sending email:', { subject, message, to: clientEmail });
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Email sent successfully!');
      setSubject('');
      setMessage('');
      setTemplate('');
    } catch (error) {
      console.error('Send email failed:', error);
      alert('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  // Handle resend email
  const handleResendEmail = async (communicationId: string) => {
    try {
      // TODO: Implement actual resend logic
      console.log('Resending email:', communicationId);
      alert('Email resent successfully!');
    } catch (error) {
      console.error('Resend failed:', error);
      alert('Failed to resend email');
    }
  };

  // Handle add note
  const handleAddNote = async () => {
    if (!noteContent.trim()) {
      alert('Please enter note content');
      return;
    }

    setIsAddingNote(true);
    try {
      // TODO: Implement actual add note logic
      console.log('Adding note:', noteContent);
      await new Promise(resolve => setTimeout(resolve, 500));
      setNoteContent('');
      alert('Note added successfully!');
    } catch (error) {
      console.error('Add note failed:', error);
      alert('Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  // Handle attachments
  const handleAttachments = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log('Attachments selected:', files);
      // TODO: Implement attachment handling
    }
  };

  if (loadingComms || loadingNotes) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading communications...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (commsError || notesError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-destructive">Failed to load communications</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Send Email Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template">Email Template</Label>
              <Select value={template} onValueChange={handleTemplateChange}>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmation">Booking Confirmation</SelectItem>
                  <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
                  <SelectItem value="vouchers">Send Vouchers</SelectItem>
                  <SelectItem value="itinerary">Send Itinerary</SelectItem>
                  <SelectItem value="custom">Custom Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="recipient">To</Label>
              <Input id="recipient" value={clientEmail} readOnly className="bg-muted" />
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Enter email subject"
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={8}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Enter your message"
              />
            </div>

            <div>
              <Label htmlFor="attachments">Attachments</Label>
              <Input
                id="attachments"
                type="file"
                multiple
                onChange={handleAttachments}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">Max 5 files, 10MB each</p>
            </div>

            <Button onClick={handleSendEmail} disabled={isSending} className="w-full">
              {isSending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Communication History ({communications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {communications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No communications yet</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {communications.map(comm => (
                <AccordionItem key={comm.id} value={comm.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 w-full text-left">
                      {getStatusIcon(comm.status)}
                      <Badge variant={getStatusVariant(comm.status)} className="text-xs">
                        {comm.status}
                      </Badge>
                      <span className="flex-1 font-medium">{comm.subject}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(comm.sentAt), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{comm.message}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>To: {comm.recipient}</span>
                        <span>Sent by: {comm.sentBy}</span>
                      </div>

                      {comm.template && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Template: {comm.template}
                          </Badge>
                        </div>
                      )}

                      {comm.attachments && comm.attachments.length > 0 && (
                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">
                            Attachments:
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {comm.attachments.map((file, i) => (
                              <Badge key={i} variant="outline" className="gap-1">
                                <Paperclip className="h-3 w-3" />
                                {file.name}
                                <span className="text-muted-foreground ml-1">
                                  ({formatFileSize(file.size)})
                                </span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResendEmail(comm.id)}
                        >
                          <Repeat className="h-3 w-3 mr-1" />
                          Resend
                        </Button>
                        <Button size="sm" variant="ghost">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Internal Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Internal Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Add internal notes (not visible to client)..."
                rows={4}
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
              />
              <Button onClick={handleAddNote} disabled={isAddingNote} size="sm">
                {isAddingNote ? 'Adding...' : 'Add Note'}
              </Button>
            </div>

            {/* Existing Notes */}
            <div className="space-y-2">
              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No internal notes yet
                </p>
              ) : (
                notes.map(note => (
                  <Card key={note.id}>
                    <CardContent className="pt-4">
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(note.createdAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                        <p className="text-xs text-muted-foreground">by {note.userName}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

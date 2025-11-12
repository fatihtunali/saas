'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Trash2,
  Upload,
  Eye,
  FileIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Types
interface Document {
  id: string;
  fileName: string;
  fileType: string;
  category: string;
  uploadedAt: string;
  uploadedBy: string;
  fileSize: number;
  filePath: string;
}

interface DocumentsTabProps {
  bookingId: string;
}

// Mock hook - replace with actual implementation
const useBookingDocuments = (bookingId: string) => {
  const [documents] = useState<Document[]>([
    {
      id: '1',
      fileName: 'hotel_voucher_grand_hyatt.pdf',
      fileType: 'application/pdf',
      category: 'Vouchers',
      uploadedAt: '2025-01-10T10:30:00Z',
      uploadedBy: 'John Doe',
      fileSize: 245000,
      filePath: '/uploads/vouchers/hotel_voucher_grand_hyatt.pdf',
    },
    {
      id: '2',
      fileName: 'invoice_2025_001.pdf',
      fileType: 'application/pdf',
      category: 'Invoices',
      uploadedAt: '2025-01-09T14:20:00Z',
      uploadedBy: 'Admin',
      fileSize: 189000,
      filePath: '/uploads/invoices/invoice_2025_001.pdf',
    },
    {
      id: '3',
      fileName: 'passport_john_smith.jpg',
      fileType: 'image/jpeg',
      category: 'Passport copies',
      uploadedAt: '2025-01-08T09:15:00Z',
      uploadedBy: 'Jane Smith',
      fileSize: 512000,
      filePath: '/uploads/passports/passport_john_smith.jpg',
    },
    {
      id: '4',
      fileName: 'transfer_voucher.pdf',
      fileType: 'application/pdf',
      category: 'Vouchers',
      uploadedAt: '2025-01-10T11:00:00Z',
      uploadedBy: 'John Doe',
      fileSize: 198000,
      filePath: '/uploads/vouchers/transfer_voucher.pdf',
    },
    {
      id: '5',
      fileName: 'contract_signed.pdf',
      fileType: 'application/pdf',
      category: 'Contracts',
      uploadedAt: '2025-01-05T16:45:00Z',
      uploadedBy: 'Admin',
      fileSize: 456000,
      filePath: '/uploads/contracts/contract_signed.pdf',
    },
  ]);

  return {
    documents,
    isLoading: false,
    error: null,
  };
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Helper function to get file icon
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return <ImageIcon className="h-5 w-5 text-blue-500" />;
  }
  return <FileText className="h-5 w-5 text-red-500" />;
};

// Document Card Component
const DocumentCard: React.FC<{ document: Document; onDelete: (id: string) => void }> = ({
  document,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        {getFileIcon(document.fileType)}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{document.fileName}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span>{formatFileSize(document.fileSize)}</span>
            <span>•</span>
            <span>{format(new Date(document.uploadedAt), 'MMM dd, yyyy')}</span>
            <span>•</span>
            <span>by {document.uploadedBy}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" title="Preview">
          <Eye className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" title="Download">
          <Download className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete(document.id)} title="Delete">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
};

export default function DocumentsTab({ bookingId }: DocumentsTabProps) {
  const { documents, isLoading, error } = useBookingDocuments(bookingId);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploading, setUploading] = useState(false);

  // Group documents by category
  const groupedDocuments = documents.reduce(
    (acc, doc) => {
      if (!acc[doc.category]) {
        acc[doc.category] = [];
      }
      acc[doc.category].push(doc);
      return acc;
    },
    {} as Record<string, Document[]>
  );

  // Handle file upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // TODO: Implement actual file upload logic
      console.log('Uploading files:', files);
      await new Promise(resolve => setTimeout(resolve, 1000));
      // TODO: Refresh documents list
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  // Handle document delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      // TODO: Implement actual delete logic
      console.log('Deleting document:', id);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  // Handle download all
  const handleDownloadAll = async () => {
    try {
      // TODO: Implement bulk download logic
      console.log('Downloading all documents');
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading documents...</p>
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
            <p className="text-center text-destructive">Failed to load documents</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vouchers">Vouchers</SelectItem>
                  <SelectItem value="Invoices">Invoices</SelectItem>
                  <SelectItem value="Receipts">Receipts</SelectItem>
                  <SelectItem value="Contracts">Contracts</SelectItem>
                  <SelectItem value="Passport copies">Passport copies</SelectItem>
                  <SelectItem value="Tickets">Tickets</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <div className="space-y-2">
                <Input
                  type="file"
                  multiple
                  onChange={handleUpload}
                  disabled={uploading}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">
                  Supported: PDF, DOC, DOCX, JPG, PNG (Max 10MB per file)
                </p>
              </div>
              {uploading && <p className="text-sm text-primary mt-2">Uploading...</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Documents ({documents.length})</CardTitle>
            <Button variant="outline" onClick={handleDownloadAll} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {Object.entries(groupedDocuments).map(([category, docs]) => (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{category}</span>
                      <Badge variant="secondary">{docs.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {docs.map(doc => (
                        <DocumentCard key={doc.id} document={doc} onDelete={handleDelete} />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

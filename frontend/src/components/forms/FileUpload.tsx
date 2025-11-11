'use client';

import * as React from 'react';
import { Upload, X, File, FileText, Image as ImageIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * FileUpload Component
 *
 * A file upload component with drag & drop support and file previews.
 *
 * Features:
 * - Drag and drop file upload
 * - Click to browse files
 * - Multiple file support
 * - File type validation
 * - File size validation
 * - Preview for images
 * - Progress indication (optional)
 * - Remove files
 *
 * @example
 * ```tsx
 * <FileUpload
 *   accept="image/*,.pdf"
 *   maxSize={5 * 1024 * 1024} // 5MB
 *   multiple
 *   onChange={setFiles}
 * />
 * ```
 */

export interface FileUploadProps {
  /** Callback when files change */
  onChange?: (files: File[]) => void;
  /** Accept file types (MIME types or extensions) */
  accept?: string;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Allow multiple files */
  multiple?: boolean;
  /** Maximum number of files */
  maxFiles?: number;
  /** Disable the upload */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** Error state */
  error?: boolean;
  /** Helper text */
  helperText?: string;
}

interface UploadedFile {
  file: File;
  preview?: string;
  id: string;
}

export function FileUpload({
  onChange,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  maxFiles = 10,
  disabled = false,
  className,
  error = false,
  helperText,
}: FileUploadProps) {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File ${file.name} exceeds maximum size of ${formatFileSize(maxSize)}`;
    }

    // Check file type if accept is specified
    if (accept) {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileType = file.type;
      const fileExtension = '.' + file.name.split('.').pop();

      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension.toLowerCase() === type.toLowerCase();
        }
        if (type.endsWith('/*')) {
          return fileType.startsWith(type.slice(0, -1));
        }
        return fileType === type;
      });

      if (!isAccepted) {
        return `File ${file.name} type not accepted`;
      }
    }

    return null;
  };

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: UploadedFile[] = [];
    let errors: string[] = [];

    // Check max files
    if (!multiple && fileList.length > 1) {
      setErrorMessage('Only one file allowed');
      return;
    }

    if (files.length + fileList.length > maxFiles) {
      setErrorMessage(`Maximum ${maxFiles} files allowed`);
      return;
    }

    Array.from(fileList).forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
        return;
      }

      const uploadedFile: UploadedFile = {
        file,
        id: Math.random().toString(36).substring(7),
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => {
          uploadedFile.preview = e.target?.result as string;
          setFiles(prev => [...prev]);
        };
        reader.readAsDataURL(file);
      }

      newFiles.push(uploadedFile);
    });

    if (errors.length > 0) {
      setErrorMessage(errors.join(', '));
      return;
    }

    setErrorMessage('');
    const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
    setFiles(updatedFiles);
    onChange?.(updatedFiles.map(f => f.file));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleRemove = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    onChange?.(updatedFiles.map(f => f.file));
  };

  const handleBrowseClick = () => {
    inputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (file.type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragging && 'border-primary bg-primary/5',
          error && 'border-red-500',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer hover:border-primary/50'
        )}
        onClick={!disabled ? handleBrowseClick : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm font-medium mb-1">
          {isDragging ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-xs text-muted-foreground mb-4">or click to browse</p>
        {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
      </div>

      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(uploadedFile => (
            <div
              key={uploadedFile.id}
              className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50"
            >
              {uploadedFile.preview ? (
                <img
                  src={uploadedFile.preview}
                  alt={uploadedFile.file.name}
                  className="h-10 w-10 object-cover rounded"
                />
              ) : (
                <div className="h-10 w-10 flex items-center justify-center bg-muted rounded">
                  {getFileIcon(uploadedFile.file)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(uploadedFile.file.size)}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(uploadedFile.id)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

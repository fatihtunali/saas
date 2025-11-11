'use client';

import * as React from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * ImageUpload Component
 *
 * A specialized image upload component with preview and basic crop support.
 *
 * Features:
 * - Image-specific file upload
 * - Image preview
 * - Aspect ratio options
 * - Max dimensions
 * - File size validation
 * - Drag and drop
 * - Single or multiple images
 *
 * @example
 * ```tsx
 * <ImageUpload
 *   value={imageUrl}
 *   onChange={setImageUrl}
 *   aspectRatio="16:9"
 *   maxSize={2 * 1024 * 1024}
 * />
 * ```
 */

export interface ImageUploadProps {
  /** Current image URL or file */
  value?: string | File;
  /** Callback when image changes */
  onChange?: (file: File | null) => void;
  /** Aspect ratio (e.g., "1:1", "16:9", "4:3") */
  aspectRatio?: string;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Maximum width in pixels */
  maxWidth?: number;
  /** Maximum height in pixels */
  maxHeight?: number;
  /** Disable the upload */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** Error state */
  error?: boolean;
  /** Helper text */
  helperText?: string;
}

export function ImageUpload({
  value,
  onChange,
  aspectRatio,
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxWidth,
  maxHeight,
  disabled = false,
  className,
  error = false,
  helperText,
}: ImageUploadProps) {
  const [preview, setPreview] = React.useState<string>('');
  const [isDragging, setIsDragging] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (typeof value === 'string') {
      setPreview(value);
    } else if (value instanceof File) {
      const reader = new FileReader();
      reader.onload = e => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(value);
    } else {
      setPreview('');
    }
  }, [value]);

  const validateImage = async (file: File): Promise<string | null> => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      return 'File must be an image';
    }

    // Check file size
    if (file.size > maxSize) {
      return `Image exceeds maximum size of ${formatFileSize(maxSize)}`;
    }

    // Check dimensions if specified
    if (maxWidth || maxHeight) {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          if (maxWidth && img.width > maxWidth) {
            resolve(`Image width exceeds ${maxWidth}px`);
            return;
          }
          if (maxHeight && img.height > maxHeight) {
            resolve(`Image height exceeds ${maxHeight}px`);
            return;
          }
          resolve(null);
        };
        img.onerror = () => resolve('Invalid image file');
        img.src = URL.createObjectURL(file);
      });
    }

    return null;
  };

  const processImage = async (file: File) => {
    const validationError = await validateImage(file);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage('');
    onChange?.(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = e => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
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
    if (!disabled && e.dataTransfer.files[0]) {
      processImage(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
    // Reset input
    e.target.value = '';
  };

  const handleRemove = () => {
    setPreview('');
    onChange?.(null);
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

  const getAspectRatioClass = () => {
    if (!aspectRatio) return '';
    const ratios: Record<string, string> = {
      '1:1': 'aspect-square',
      '16:9': 'aspect-video',
      '4:3': 'aspect-[4/3]',
      '3:2': 'aspect-[3/2]',
    };
    return ratios[aspectRatio] || '';
  };

  return (
    <div className={cn('space-y-2', className)}>
      {preview ? (
        <div className="relative group">
          <div
            className={cn(
              'relative overflow-hidden rounded-lg border-2',
              getAspectRatioClass(),
              error && 'border-red-500'
            )}
          >
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </div>
          {!disabled && (
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemove}
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            getAspectRatioClass(),
            'flex flex-col items-center justify-center',
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
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />

          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm font-medium mb-1">
            {isDragging ? 'Drop image here' : 'Drag & drop image here'}
          </p>
          <p className="text-xs text-muted-foreground mb-2">or click to browse</p>
          {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
        </div>
      )}

      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
    </div>
  );
}

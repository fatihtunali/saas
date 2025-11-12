'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

export function ImageUploader({
  value,
  onChange,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!acceptedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload an image.');
        return;
      }

      // Validate file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setError(`File size must be less than ${maxSizeMB}MB`);
        return;
      }

      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onChange(result);
      };
      reader.readAsDataURL(file);
    },
    [maxSizeMB, acceptedTypes, onChange]
  );

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    setError(null);
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative w-full h-48 border rounded-lg overflow-hidden">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Click to upload image</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to {maxSizeMB}MB</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept={acceptedTypes.join(',')}
            onChange={handleFileChange}
          />
        </label>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

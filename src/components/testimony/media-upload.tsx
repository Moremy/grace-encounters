'use client';

import * as React from 'react';
import { Upload, X, FileText, Music, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/lib/testimony/schemas';

interface MediaUploadProps {
  mediaType: 'PDF' | 'AUDIO' | 'VIDEO';
  onFileSelect: (file: File | null) => void;
  maxSize: number;
}

const ACCEPT_MAP: Record<string, string> = {
  PDF: 'application/pdf',
  AUDIO: 'audio/mpeg,audio/ogg',
  VIDEO: 'video/mp4,video/webm',
};

const ICON_MAP: Record<string, React.ReactNode> = {
  PDF: <FileText className="h-8 w-8 text-navy/60" />,
  AUDIO: <Music className="h-8 w-8 text-navy/60" />,
  VIDEO: <Video className="h-8 w-8 text-navy/60" />,
};

export function MediaUpload({ mediaType, onFileSelect, maxSize }: MediaUploadProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const accept = ACCEPT_MAP[mediaType] ?? '';

  function handleFile(file: File) {
    setError(null);

    const acceptedTypes = accept.split(',');
    if (!acceptedTypes.includes(file.type)) {
      setError(`Invalid file type. Please upload a valid ${mediaType.toLowerCase()} file.`);
      return;
    }

    if (file.size > maxSize) {
      setError(`File too large. Maximum size is ${formatFileSize(maxSize)}.`);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleRemove() {
    setSelectedFile(null);
    setError(null);
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  if (selectedFile) {
    return (
      <div className="rounded-md border border-navy/20 bg-ivory/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {ICON_MAP[mediaType]}
            <div>
              <p className="text-sm font-medium text-navy">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed p-8 transition-colors cursor-pointer ${
          isDragging
            ? 'border-gold bg-gold/5'
            : 'border-navy/30 hover:border-navy/50'
        }`}
      >
        <Upload className="h-8 w-8 text-navy/40" />
        <div className="text-center">
          <p className="text-sm font-medium text-navy">
            Drop your {mediaType.toLowerCase()} file here or click to browse
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Max size: {formatFileSize(maxSize)}
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

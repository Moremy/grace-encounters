'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MediaUpload } from '@/components/testimony/media-upload';

const CATEGORIES = [
  { value: '', label: 'Select a category...' },
  { value: 'HEALING', label: 'Healing' },
  { value: 'SALVATION', label: 'Salvation' },
  { value: 'DELIVERANCE', label: 'Deliverance' },
  { value: 'PROVISION', label: 'Provision' },
  { value: 'RESTORATION', label: 'Restoration' },
  { value: 'FAITH', label: 'Faith' },
  { value: 'OTHER', label: 'Other' },
];

const MEDIA_TYPE_OPTIONS = [
  { value: 'TEXT', label: 'Text' },
  { value: 'PDF', label: 'PDF' },
  { value: 'AUDIO', label: 'Audio' },
  { value: 'VIDEO', label: 'Video' },
];

const MAX_SIZES: Record<string, number> = {
  PDF: 10 * 1024 * 1024,
  AUDIO: 50 * 1024 * 1024,
  VIDEO: 200 * 1024 * 1024,
};

interface TestimonyFormClientProps {
  action: (formData: FormData) => Promise<void>;
}

export function TestimonyFormClient({ action }: TestimonyFormClientProps) {
  const [mediaType, setMediaType] = React.useState('TEXT');
  const [mediaUrl, setMediaUrl] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  function handleFileSelect(file: File | null) {
    setSelectedFile(file);
    // Clear mediaUrl when file is removed
    if (!file) {
      setMediaUrl('');
    }
  }

  async function handleSubmit(formData: FormData) {
    // If there is a selected file, upload it first
    if (selectedFile && mediaType !== 'TEXT') {
      const uploadData = new FormData();
      uploadData.append('file', selectedFile);

      try {
        const response = await fetch('/api/testimonies/upload', {
          method: 'POST',
          body: uploadData,
        });

        if (response.ok) {
          const result = await response.json();
          formData.set('mediaUrl', result.url);
        }
      } catch {
        // Upload failed - form will submit without mediaUrl
      }
    }

    formData.set('mediaType', mediaType);
    await action(formData);
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Media Type Selector */}
      <div className="space-y-2">
        <Label>Media Type</Label>
        <div className="flex flex-wrap gap-2">
          {MEDIA_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setMediaType(option.value);
                setSelectedFile(null);
                setMediaUrl('');
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                mediaType === option.value
                  ? 'bg-navy text-ivory'
                  : 'bg-navy/5 text-navy hover:bg-navy/10'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* File Upload - shown for non-text types */}
      {mediaType !== 'TEXT' && (
        <div className="space-y-2">
          <Label>Upload {mediaType} File</Label>
          <MediaUpload
            mediaType={mediaType as 'PDF' | 'AUDIO' | 'VIDEO'}
            onFileSelect={handleFileSelect}
            maxSize={MAX_SIZES[mediaType] ?? 10 * 1024 * 1024}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. How God Healed My Marriage"
          required
          minLength={5}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Short Summary</Label>
        <textarea
          id="excerpt"
          name="excerpt"
          placeholder="A brief summary of your testimony (10-200 characters)"
          required
          minLength={10}
          maxLength={200}
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Full Testimony</Label>
        <textarea
          id="content"
          name="content"
          placeholder="Share the full story of what God has done..."
          required
          minLength={50}
          rows={10}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          name="category"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          name="tags"
          placeholder="e.g. faith, healing, family"
        />
        <p className="text-xs text-muted-foreground">
          Separate tags with commas
        </p>
      </div>

      {/* Hidden inputs */}
      <input type="hidden" name="mediaType" value={mediaType} />
      <input type="hidden" name="mediaUrl" value={mediaUrl} />

      <Button type="submit" variant="sacred">
        Submit Testimony
      </Button>
    </form>
  );
}

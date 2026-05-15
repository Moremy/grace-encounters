'use client';

import * as React from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TranscriptToggleProps {
  url: string;
}

export function TranscriptToggle({ url }: TranscriptToggleProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="rounded-lg border border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-navy hover:text-gold transition-colors"
      >
        <span className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {isOpen ? 'Hide Transcript' : 'Show Transcript'}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {isOpen && (
        <div className="border-t px-4 py-4">
          <p className="mb-3 text-sm text-muted-foreground">
            The transcript is available as a downloadable document.
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              View Full Transcript
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}

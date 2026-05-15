'use client';

import * as React from 'react';
import { Check, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { markDayComplete, saveReflectionNote } from '@/lib/bible-study/actions';

interface DailyReadingProps {
  day: {
    id: string;
    dayNumber: number;
    title: string;
    scripture: string;
    scriptureReference: string;
    reflection: string | null;
  };
  progress: {
    completed: boolean;
    notes: string | null;
  } | null;
  planId: string;
}

export function DailyReading({ day, progress, planId }: DailyReadingProps) {
  const [notes, setNotes] = React.useState(progress?.notes ?? '');
  const [isCompleted, setIsCompleted] = React.useState(
    progress?.completed ?? false,
  );

  async function handleMarkComplete() {
    await markDayComplete(planId, day.dayNumber);
    setIsCompleted(true);
  }

  async function handleSaveNotes() {
    await saveReflectionNote(planId, day.dayNumber, notes);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-widest text-gold font-medium">
          {day.scriptureReference}
        </p>
        <h3 className="mt-2 font-serif text-xl text-navy">{day.title}</h3>
      </div>

      <blockquote className="border-l-4 border-gold/40 pl-4">
        <p className="font-serif text-lg italic text-navy">{day.scripture}</p>
      </blockquote>

      {day.reflection && (
        <div className="rounded-md bg-muted/50 p-4">
          <p className="text-sm font-medium text-navy mb-1">Reflection</p>
          <p className="text-sm text-muted-foreground">{day.reflection}</p>
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="reflection-notes"
          className="text-sm font-medium text-navy"
        >
          Your Notes
        </label>
        <textarea
          id="reflection-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write your reflection notes here..."
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold min-h-[100px]"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSaveNotes}
        >
          <Save className="mr-2 h-4 w-4" />
          Save Notes
        </Button>
      </div>

      <Button
        type="button"
        variant={isCompleted ? 'outline' : 'sacred'}
        onClick={handleMarkComplete}
        disabled={isCompleted}
        className={isCompleted ? 'border-green-500 text-green-600' : ''}
      >
        <Check className="mr-2 h-4 w-4" />
        {isCompleted ? 'Completed' : 'Mark as Complete'}
      </Button>
    </div>
  );
}

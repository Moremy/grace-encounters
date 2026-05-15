import type { Metadata } from 'next';

import { Reveal } from '@/components/brand/reveal';
import { Button } from '@/components/ui/button';
import { createCampaign } from '@/lib/donation/actions';

export const metadata: Metadata = {
  title: 'Create Campaign - Admin',
  description: 'Create a new donation campaign.',
};

export default function NewCampaignPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const error =
    typeof searchParams.error === 'string'
      ? decodeURIComponent(searchParams.error)
      : null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Reveal>
        <h1 className="font-serif text-2xl text-navy">Create Campaign</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set up a new donation campaign with a goal and timeline.
        </p>
      </Reveal>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Reveal>
        <form action={createCampaign} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-navy">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              minLength={5}
              maxLength={200}
              className="mt-1 w-full rounded-md border border-border bg-background py-2 px-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              placeholder="e.g. Building Fund 2024"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-navy">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              minLength={20}
              maxLength={5000}
              rows={5}
              className="mt-1 w-full rounded-md border border-border bg-background py-2 px-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              placeholder="Describe the purpose and goals of this campaign..."
            />
          </div>

          <div>
            <label htmlFor="goalAmount" className="block text-sm font-medium text-navy">
              Goal Amount ($)
            </label>
            <input
              id="goalAmount"
              name="goalAmount"
              type="number"
              required
              min={100}
              className="mt-1 w-full max-w-xs rounded-md border border-border bg-background py-2 px-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              placeholder="10000"
            />
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-navy">
              Image URL (optional)
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              className="mt-1 w-full rounded-md border border-border bg-background py-2 px-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-navy">
                Start Date
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                required
                className="mt-1 w-full rounded-md border border-border bg-background py-2 px-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-navy">
                End Date (optional)
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                className="mt-1 w-full rounded-md border border-border bg-background py-2 px-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          <Button type="submit" variant="sacred">
            Create Campaign
          </Button>
        </form>
      </Reveal>
    </div>
  );
}

import Link from 'next/link';
import { CounsellingCategory, CounsellingContactMethod } from '@prisma/client';

import { createCounsellingRequest } from '@/lib/counselling/actions';

function formatLabel(value: string) {
  return value
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function NewCounsellingRequestPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">
            Private Counselling
          </p>

          <h1 className="mt-2 font-serif text-3xl font-bold text-navy">Request Counselling</h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            Share your request privately. Only authorized ministry admins can review counselling
            requests.
          </p>
        </div>

        <Link
          href="/dashboard/counselling"
          className="rounded-lg border border-navy/20 px-5 py-3 text-sm font-semibold text-navy transition hover:bg-navy/5"
        >
          Back to Counselling
        </Link>
      </div>

      {searchParams?.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {decodeURIComponent(searchParams.error)}
        </div>
      ) : null}

      <form
        action={createCounsellingRequest}
        className="space-y-6 rounded-2xl border border-gold/20 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label htmlFor="category" className="text-sm font-semibold text-navy">
              Counselling Category
            </label>

            <select
              id="category"
              name="category"
              required
              className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            >
              <option value="">Select category</option>
              {Object.values(CounsellingCategory).map((category) => (
                <option key={category} value={category}>
                  {formatLabel(category)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="contactMethod" className="text-sm font-semibold text-navy">
              Preferred Contact Method
            </label>

            <select
              id="contactMethod"
              name="contactMethod"
              required
              className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            >
              <option value="">Select method</option>
              {Object.values(CounsellingContactMethod).map((method) => (
                <option key={method} value={method}>
                  {formatLabel(method)}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label htmlFor="contactDetails" className="text-sm font-semibold text-navy">
              Contact Details
            </label>

            <input
              id="contactDetails"
              name="contactDetails"
              type="text"
              required
              placeholder="Phone number, WhatsApp number, email, or preferred meeting details"
              className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </div>

          <div className="lg:col-span-2">
            <label htmlFor="description" className="text-sm font-semibold text-navy">
              Describe Your Request
            </label>

            <textarea
              id="description"
              name="description"
              rows={8}
              required
              placeholder="Briefly explain what kind of counselling support you need."
              className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </div>
        </div>

        <div className="rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm text-navy">
          Counselling requests are private. They are visible only to you and authorized admins.
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-ivory transition hover:bg-navy/90"
          >
            Submit Request
          </button>

          <Link
            href="/dashboard/counselling"
            className="rounded-lg border border-navy/20 px-6 py-3 text-sm font-semibold text-navy transition hover:bg-navy/5"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

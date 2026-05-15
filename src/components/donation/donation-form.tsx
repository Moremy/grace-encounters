'use client';

import * as React from 'react';
import { CreditCard, Smartphone, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];

interface Campaign {
  id: string;
  title: string;
}

interface DonationFormProps {
  campaigns?: Campaign[];
  defaultCampaignId?: string;
}

export function DonationForm({ campaigns = [], defaultCampaignId }: DonationFormProps) {
  const [amount, setAmount] = React.useState<number>(50);
  const [customAmount, setCustomAmount] = React.useState('');
  const [isCustom, setIsCustom] = React.useState(false);
  const [provider, setProvider] = React.useState<'STRIPE' | 'MPESA' | 'PAYPAL'>('STRIPE');
  const [recurring, setRecurring] = React.useState(false);
  const [recurringInterval, setRecurringInterval] = React.useState<string>('monthly');
  const [campaignId, setCampaignId] = React.useState(defaultCampaignId || '');
  const [phone, setPhone] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const effectiveAmount = isCustom ? Number(customAmount) || 0 : amount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (effectiveAmount < 1) return;
    setSubmitting(true);

    const providerRoute = provider.toLowerCase();
    const body: Record<string, unknown> = {
      amount: effectiveAmount,
      currency: 'USD',
      provider,
      recurring,
      recurringInterval: recurring ? recurringInterval : undefined,
      campaignId: campaignId || undefined,
    };

    if (provider === 'MPESA') {
      body.phone = phone;
    }

    try {
      setError(null);
      const res = await fetch(`/api/donations/${providerRoute}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      if (data.checkoutUrl || data.approvalUrl) {
        window.location.href = data.checkoutUrl || data.approvalUrl;
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Selection */}
      <div>
        <label className="block text-sm font-medium text-navy mb-3">
          Select Amount
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setAmount(preset);
                setIsCustom(false);
              }}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                !isCustom && amount === preset
                  ? 'bg-navy text-ivory'
                  : 'border border-border bg-background text-navy hover:bg-ivory'
              }`}
            >
              ${preset}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setIsCustom(true)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              isCustom
                ? 'bg-navy text-ivory'
                : 'border border-border bg-background text-navy hover:bg-ivory'
            }`}
          >
            Custom
          </button>
        </div>
        {isCustom && (
          <div className="mt-3">
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <input
                type="number"
                min="1"
                max="100000"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full rounded-md border border-border bg-background py-2 pl-7 pr-4 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>
        )}
      </div>

      {/* Payment Provider */}
      <div>
        <label className="block text-sm font-medium text-navy mb-3">
          Payment Method
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setProvider('STRIPE')}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              provider === 'STRIPE'
                ? 'bg-navy text-ivory'
                : 'border border-border bg-background text-navy hover:bg-ivory'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Credit Card
          </button>
          <button
            type="button"
            onClick={() => setProvider('MPESA')}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              provider === 'MPESA'
                ? 'bg-navy text-ivory'
                : 'border border-border bg-background text-navy hover:bg-ivory'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            M-Pesa
          </button>
          <button
            type="button"
            onClick={() => setProvider('PAYPAL')}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              provider === 'PAYPAL'
                ? 'bg-navy text-ivory'
                : 'border border-border bg-background text-navy hover:bg-ivory'
            }`}
          >
            <Wallet className="h-4 w-4" />
            PayPal
          </button>
        </div>

        {/* M-Pesa phone field */}
        {provider === 'MPESA' && (
          <div className="mt-3 max-w-xs">
            <label className="block text-xs text-muted-foreground mb-1">
              Phone Number (e.g. +254...)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254 7XX XXX XXX"
              className="w-full rounded-md border border-border bg-background py-2 px-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
        )}
      </div>

      {/* Recurring */}
      <div>
        <label className="flex items-center gap-2 text-sm text-navy cursor-pointer">
          <input
            type="checkbox"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
            className="rounded border-border"
          />
          Make this a recurring donation
        </label>
        {recurring && (
          <div className="mt-3 max-w-xs">
            <select
              value={recurringInterval}
              onChange={(e) => setRecurringInterval(e.target.value)}
              className="w-full rounded-md border border-border bg-background py-2 px-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}
      </div>

      {/* Campaign selector */}
      {campaigns.length > 0 && !defaultCampaignId && (
        <div>
          <label className="block text-sm font-medium text-navy mb-2">
            Donate to Campaign (optional)
          </label>
          <select
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            className="w-full max-w-xs rounded-md border border-border bg-background py-2 px-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="">General Fund</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="sacred"
        disabled={submitting || effectiveAmount < 1}
        className="w-full sm:w-auto"
      >
        {submitting ? 'Processing...' : 'Give Now'}
      </Button>
    </form>
  );
}

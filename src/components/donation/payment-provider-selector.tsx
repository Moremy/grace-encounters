'use client';

import * as React from 'react';
import { CreditCard, Smartphone, Wallet } from 'lucide-react';

type Provider = 'STRIPE' | 'MPESA' | 'PAYPAL';

interface PaymentProviderSelectorProps {
  selected: Provider;
  onSelect: (provider: Provider) => void;
}

const providers: { id: Provider; label: string; icon: React.ElementType }[] = [
  { id: 'STRIPE', label: 'Credit Card', icon: CreditCard },
  { id: 'MPESA', label: 'M-Pesa', icon: Smartphone },
  { id: 'PAYPAL', label: 'PayPal', icon: Wallet },
];

export function PaymentProviderSelector({
  selected,
  onSelect,
}: PaymentProviderSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {providers.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              selected === id
                ? 'bg-navy text-ivory'
                : 'border border-border bg-background text-navy hover:bg-ivory'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Provider-specific fields */}
      <div className="text-sm text-muted-foreground">
        {selected === 'STRIPE' && (
          <p>You will be redirected to a secure checkout to enter your card details.</p>
        )}
        {selected === 'MPESA' && (
          <div>
            <label className="block text-xs font-medium text-navy mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+254 7XX XXX XXX"
              className="w-full max-w-xs rounded-md border border-border bg-background py-2 px-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              An STK push will be sent to this number.
            </p>
          </div>
        )}
        {selected === 'PAYPAL' && (
          <p>You will be redirected to PayPal to complete your donation.</p>
        )}
      </div>
    </div>
  );
}

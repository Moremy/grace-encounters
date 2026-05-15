'use client';

import { useState, useTransition } from 'react';
import { Mail } from 'lucide-react';
import { updateNotificationPreferences } from '@/lib/email/actions';

interface EmailPreferencesProps {
  initialPrefs: {
    emailNewsletter: boolean;
    prayerReminders: boolean;
    devotionalNotifications: boolean;
    eventReminders: boolean;
    donationReceipts: boolean;
  };
}

interface PreferenceToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
}

function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: PreferenceToggleProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-4">
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? 'bg-[#1e3a5f]' : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={checked}
        aria-label={`Toggle ${label}`}
      >
        <span
          className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export function EmailPreferences({ initialPrefs }: EmailPreferencesProps) {
  const [prefs, setPrefs] = useState(initialPrefs);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleChange = (
    key: keyof typeof prefs,
    value: boolean,
  ) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    setSaved(false);

    startTransition(async () => {
      try {
        await updateNotificationPreferences({ [key]: value });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch {
        // Revert on error
        setPrefs(prefs);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Mail className="h-5 w-5 text-[#1e3a5f]" />
        <h2 className="text-lg font-medium">Email Notifications</h2>
        {saved && (
          <span className="text-xs text-green-600">Saved</span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Choose which email notifications you would like to receive.
      </p>

      <div className="space-y-3">
        <PreferenceToggle
          label="Newsletter"
          description="Weekly updates, community news, and featured content."
          checked={prefs.emailNewsletter}
          onChange={(v) => handleChange('emailNewsletter', v)}
          disabled={isPending}
        />
        <PreferenceToggle
          label="Prayer Reminders"
          description="Email reminders about prayer requests from the community."
          checked={prefs.prayerReminders}
          onChange={(v) => handleChange('prayerReminders', v)}
          disabled={isPending}
        />
        <PreferenceToggle
          label="Devotional Notifications"
          description="Get notified when new devotionals are published."
          checked={prefs.devotionalNotifications}
          onChange={(v) => handleChange('devotionalNotifications', v)}
          disabled={isPending}
        />
        <PreferenceToggle
          label="Event Reminders"
          description="Reminders about upcoming events and gatherings."
          checked={prefs.eventReminders}
          onChange={(v) => handleChange('eventReminders', v)}
          disabled={isPending}
        />
        <PreferenceToggle
          label="Donation Receipts"
          description="Email receipts for your donations and contributions."
          checked={prefs.donationReceipts}
          onChange={(v) => handleChange('donationReceipts', v)}
          disabled={isPending}
        />
      </div>
    </div>
  );
}

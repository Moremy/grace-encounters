import { Bell } from 'lucide-react';
import { PushNotificationToggle } from '@/components/pwa/push-notification-toggle';
import { EmailPreferences } from '@/components/email/email-preferences';
import { getNotificationPreferences } from '@/lib/email/actions';

export const metadata = {
  title: 'Notification Settings — Light and Salt',
};

export default async function NotificationSettingsPage() {
  const prefs = await getNotificationPreferences();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Bell className="h-6 w-6 text-[#1e3a5f]" />
        <h1 className="font-serif text-2xl font-bold text-[#1e3a5f]">
          Notification Settings
        </h1>
      </div>

      <p className="text-muted-foreground">
        Manage how you receive notifications from Light and Salt.
      </p>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Push Notifications</h2>
        <PushNotificationToggle />
        <p className="text-xs text-muted-foreground">
          Push notifications let you receive updates even when you are not
          actively using the app. You can disable them at any time.
        </p>
      </div>

      <hr className="border-gray-200" />

      <EmailPreferences
        initialPrefs={{
          emailNewsletter: prefs.emailNewsletter,
          prayerReminders: prefs.prayerReminders,
          devotionalNotifications: prefs.devotionalNotifications,
          eventReminders: prefs.eventReminders,
          donationReceipts: prefs.donationReceipts,
        }}
      />
    </div>
  );
}

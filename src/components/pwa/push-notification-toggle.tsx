'use client';

import { useEffect, useState, useTransition } from 'react';
import { Bell, BellOff } from 'lucide-react';
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getUserPushSubscriptions,
} from '@/lib/push-notifications/actions';

export function PushNotificationToggle() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const checkSupport = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return;
      }
      setIsSupported(true);

      // Check if user has existing subscriptions
      try {
        const subscriptions = await getUserPushSubscriptions();
        setIsSubscribed(subscriptions.length > 0);
      } catch {
        // User might not be authenticated
      }
    };

    checkSupport();
  }, []);

  const handleToggle = () => {
    startTransition(async () => {
      if (isSubscribed) {
        // Unsubscribe
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            await subscription.unsubscribe();
            await unsubscribeFromPushNotifications(subscription.endpoint);
          }
          setIsSubscribed(false);
        } catch (err) {
          console.error('Failed to unsubscribe:', err);
        }
      } else {
        // Subscribe
        try {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') return;

          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          });

          const json = subscription.toJSON();
          await subscribeToPushNotifications({
            endpoint: subscription.endpoint,
            p256dh: json.keys?.p256dh ?? '',
            auth: json.keys?.auth ?? '',
          });
          setIsSubscribed(true);
        } catch (err) {
          console.error('Failed to subscribe:', err);
        }
      }
    });
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-3 rounded-lg border p-4 opacity-60">
        <BellOff className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">Push Notifications</p>
          <p className="text-xs text-muted-foreground">
            Not supported in this browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border p-4">
      {isSubscribed ? (
        <Bell className="h-5 w-5 text-[#1e3a5f]" />
      ) : (
        <BellOff className="h-5 w-5 text-muted-foreground" />
      )}
      <div className="flex-1">
        <p className="text-sm font-medium">Push Notifications</p>
        <p className="text-xs text-muted-foreground">
          {isSubscribed
            ? 'You will receive notifications about prayers, testimonies, and events.'
            : 'Enable notifications to stay updated.'}
        </p>
      </div>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          isSubscribed ? 'bg-[#1e3a5f]' : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={isSubscribed}
        aria-label="Toggle push notifications"
      >
        <span
          className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
            isSubscribed ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

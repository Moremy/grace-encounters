import type { Metadata } from 'next';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationItem } from '@/components/notifications/notification-item';
import { getMyNotifications, markAllAsRead } from '@/lib/notification/actions';

export const metadata: Metadata = {
  title: 'Notifications | Light Bearers',
};

export default async function NotificationsPage() {
  const notifications = await getMyNotifications();
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl tracking-tight text-navy">
          Notifications
        </h1>
        {hasUnread && (
          <form action={markAllAsRead}>
            <Button variant="ghost" size="sm" type="submit">
              Mark All as Read
            </Button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Bell className="mb-4 h-12 w-12 opacity-40" />
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
      )}
    </div>
  );
}

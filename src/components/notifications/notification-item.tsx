import * as React from 'react';
import Link from 'next/link';
import { Bell, Calendar, CheckCircle, Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { markAsRead } from '@/lib/notification/actions';

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getIcon(type: string) {
  switch (type) {
    case 'PRAYER_REPLY':
      return Heart;
    case 'TESTIMONY_APPROVED':
      return CheckCircle;
    case 'GROUP_INVITATION':
      return Users;
    case 'EVENT_REMINDER':
      return Calendar;
    default:
      return Bell;
  }
}

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    read: boolean;
    createdAt: Date;
  };
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const Icon = getIcon(notification.type);

  const content = (
    <Card
      className={`flex items-start gap-4 p-4 ${
        !notification.read
          ? 'border-l-4 border-l-gold bg-gold/5'
          : ''
      }`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15">
        <Icon className="h-4 w-4 text-gold" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="font-medium text-navy">{notification.title}</p>
        <p className="text-sm text-muted-foreground">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground">
          {timeAgo(notification.createdAt)}
        </p>
      </div>
      {!notification.read && (
        <form action={markAsRead.bind(null, notification.id)}>
          <Button variant="ghost" size="sm" type="submit">
            Mark read
          </Button>
        </form>
      )}
    </Card>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

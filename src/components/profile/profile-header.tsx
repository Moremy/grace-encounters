import * as React from 'react';

interface ProfileHeaderProps {
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileHeader({
  displayName,
  avatarUrl,
  bio,
  createdAt,
}: ProfileHeaderProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="text-center">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName ?? 'User avatar'}
          className="mx-auto h-24 w-24 rounded-full object-cover ring-2 ring-gold/30"
        />
      ) : (
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-navy text-ivory font-serif text-2xl ring-2 ring-gold/30">
          {getInitials(displayName)}
        </div>
      )}
      <h1 className="font-serif text-3xl text-navy mt-4">
        {displayName ?? 'Anonymous'}
      </h1>
      {bio && (
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">{bio}</p>
      )}
      <p className="text-xs uppercase tracking-widest text-muted-foreground mt-4">
        Member since {formattedDate}
      </p>
    </div>
  );
}

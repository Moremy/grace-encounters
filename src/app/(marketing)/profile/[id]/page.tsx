import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Reveal } from '@/components/brand/reveal';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileStats } from '@/components/profile/profile-stats';
import { getPublicProfile } from '@/lib/profile/actions';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getPublicProfile(params.id);

  if (!profile) {
    return { title: 'Profile Not Found' };
  }

  return {
    title: `${profile.displayName ?? 'Member'} | Light Bearers`,
    description: profile.bio ?? 'Community member profile.',
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const profile = await getPublicProfile(params.id);

  if (!profile) {
    notFound();
  }

  return (
    <>
      <section className="bg-ivory py-24">
        <div className="max-w-4xl mx-auto px-6">
          <Reveal>
            <ProfileHeader
              displayName={profile.displayName}
              avatarUrl={profile.avatarUrl}
              bio={profile.bio}
              createdAt={profile.createdAt}
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="max-w-4xl mx-auto px-6">
          <Reveal delay={0.1}>
            <ProfileStats
              testimoniesCount={profile.testimoniesCount}
              prayerCount={profile.prayerCount}
              groupsCount={profile.groupsCount}
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}

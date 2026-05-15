import type { Metadata } from 'next';

import { Reveal } from '@/components/brand/reveal';
import { ScriptureBanner } from '@/components/marketing/scripture-banner';
import { GroupCard } from '@/components/community/group-card';
import { getPublishedGroups } from '@/lib/community/actions';

export const metadata: Metadata = {
  title: 'Community Groups',
  description:
    'Join a community group of believers sharing faith, lifting prayers, and walking together.',
};

export default async function CommunityPage() {
  const groups = await getPublishedGroups();

  return (
    <>
      <section className="bg-ivory py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Community
          </p>
          <h1 className="mt-4 font-serif text-3xl md:text-4xl text-navy">
            Community Groups
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Find your place in fellowship. Join a group that resonates with your
            journey and connect with others who share your heart for God.
          </p>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            {groups.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  No community groups yet. Check back soon.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <ScriptureBanner
        scripture="For where two or three gather in my name, there am I with them."
        reference="Matthew 18:20"
      />
    </>
  );
}

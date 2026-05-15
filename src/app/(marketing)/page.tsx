import type { Metadata } from 'next';

import { Hero } from '@/components/marketing/hero';
import { MissionSection } from '@/components/marketing/mission-section';
import { FeaturedTestimony } from '@/components/marketing/featured-testimony';
import { DevotionalTeaser } from '@/components/marketing/devotional-teaser';
import { PrayerWallPreview } from '@/components/marketing/prayer-wall-preview';
import { ScriptureBanner } from '@/components/marketing/scripture-banner';
import { NewsletterSection } from '@/components/marketing/newsletter-section';

export const metadata: Metadata = {
  description:
    'A reverent home for testimonies, prayer, and daily devotion. Real encounters with Jesus, shared in stillness.',
};

export default function MarketingHomePage() {
  return (
    <>
      <Hero />
      <MissionSection />
      <FeaturedTestimony />
      <DevotionalTeaser />
      <PrayerWallPreview />
      <ScriptureBanner />
      <NewsletterSection />
    </>
  );
}

import type { Metadata } from 'next';

import { Hero } from '@/components/marketing/hero';
import { MissionSection } from '@/components/marketing/mission-section';
import { MinistriesSection } from '@/components/marketing/ministries-section';
import { FeaturedTestimony } from '@/components/marketing/featured-testimony';
import { DevotionalTeaser } from '@/components/marketing/devotional-teaser';
import { PrayerWallPreview } from '@/components/marketing/prayer-wall-preview';
import { ScriptureBanner } from '@/components/marketing/scripture-banner';
import { NewsletterSection } from '@/components/marketing/newsletter-section';

export const metadata: Metadata = {
  description:
    'A reverent home for testimonies, prayer, and daily devotion. Shining Truth. Transforming Lives.',
};

export default function MarketingHomePage() {
  return (
    <>
      <Hero />
      <MissionSection />
      <MinistriesSection />
      <FeaturedTestimony />
      <DevotionalTeaser />
      <PrayerWallPreview />
      <ScriptureBanner />
      <NewsletterSection />
    </>
  );
}

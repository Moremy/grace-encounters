import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Reveal } from '@/components/brand/reveal';
import { CampaignProgress } from '@/components/donation/campaign-progress';
import { DonationForm } from '@/components/donation/donation-form';
import { getCampaignBySlug } from '@/lib/donation/actions';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const campaign = await getCampaignBySlug(params.slug);
  if (!campaign) return { title: 'Campaign Not Found' };

  return {
    title: `Donate: ${campaign.title}`,
    description: campaign.description.slice(0, 160),
  };
}

export default async function CampaignDonatePage({ params }: PageProps) {
  const campaign = await getCampaignBySlug(params.slug);

  if (!campaign) {
    notFound();
  }

  return (
    <>
      {/* Hero */}
      <section className="relative bg-ivory py-24">
        {campaign.imageUrl ? (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={campaign.imageUrl}
              alt=""
              className="h-full w-full object-cover opacity-10"
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent" />
        )}
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Campaign
          </p>
          <h1 className="mt-4 font-serif text-3xl md:text-4xl text-navy">
            {campaign.title}
          </h1>
        </div>
      </section>

      {/* Progress */}
      <section className="bg-background py-12 border-t">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <CampaignProgress
              goalAmount={Number(campaign.goalAmount)}
              currentAmount={Number(campaign.currentAmount)}
              donorCount={campaign.donorCount}
            />
          </Reveal>
        </div>
      </section>

      {/* Description */}
      <section className="bg-ivory py-12 border-t">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <h2 className="font-serif text-xl text-navy mb-4">About This Campaign</h2>
            <p className="text-muted-foreground whitespace-pre-line">
              {campaign.description}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Donation Form */}
      <section className="bg-background py-16 border-t">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <h2 className="font-serif text-xl text-navy mb-6">
              Support This Campaign
            </h2>
            <DonationForm defaultCampaignId={campaign.id} />
          </Reveal>
        </div>
      </section>

      {/* Recent donors */}
      <section className="bg-ivory py-12 border-t">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <h2 className="font-serif text-xl text-navy mb-4">
              Recent Supporters
            </h2>
            <p className="text-sm text-muted-foreground">
              {campaign.donorCount > 0
                ? `${campaign.donorCount} generous ${campaign.donorCount === 1 ? 'donor has' : 'donors have'} contributed to this campaign.`
                : 'Be the first to support this campaign!'}
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from 'next';

import { Reveal } from '@/components/brand/reveal';
import { CampaignCard } from '@/components/donation/campaign-card';
import { DonationForm } from '@/components/donation/donation-form';
import { getDonationCampaigns } from '@/lib/donation/actions';

export const metadata: Metadata = {
  title: 'Donate',
  description:
    'Support the ministry of Light and Salt. Give generously and help transform lives.',
};

export default async function DonatePage() {
  const campaigns = await getDonationCampaigns();

  return (
    <>
      {/* Hero */}
      <section className="bg-ivory py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Support the Ministry
          </p>
          <h1 className="mt-4 font-serif text-3xl md:text-4xl text-navy">
            Give Generously
          </h1>
          <p className="mt-4 mx-auto max-w-2xl text-muted-foreground">
            Your giving enables us to reach more lives, strengthen communities, and share
            the love of Christ around the world.
          </p>
          <blockquote className="mt-6 mx-auto max-w-xl italic text-navy/70 border-l-4 border-gold pl-4 text-left">
            &ldquo;Each of you should give what you have decided in your heart to give,
            not reluctantly or under compulsion, for God loves a cheerful giver.&rdquo;
            <cite className="mt-1 block text-sm text-muted-foreground not-italic">
              &mdash; 2 Corinthians 9:7
            </cite>
          </blockquote>
        </div>
      </section>

      {/* Active Campaigns */}
      {campaigns.length > 0 && (
        <section className="bg-background py-16">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <h2 className="font-serif text-2xl text-navy mb-6">
                Active Campaigns
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* General Donation Form */}
      <section className="bg-ivory py-16 border-t">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <h2 className="font-serif text-2xl text-navy mb-2">
              Make a Donation
            </h2>
            <p className="text-muted-foreground mb-8">
              Choose an amount and payment method below to support the ministry.
            </p>
            <DonationForm
              campaigns={campaigns.map((c) => ({ id: c.id, title: c.title }))}
            />
          </Reveal>
        </div>
      </section>

      {/* Impact Section */}
      <section className="bg-background py-16 border-t">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="font-serif text-2xl text-navy mb-8 text-center">
              Your Impact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <p className="text-2xl font-bold text-gold">$25</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Provides study materials for one Bible study participant for a month
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <p className="text-2xl font-bold text-gold">$100</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Supports a community outreach event serving dozens of families
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <p className="text-2xl font-bold text-gold">$500</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Funds a missions trip or youth retreat for a group of young believers
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-ivory py-16 border-t">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <h2 className="font-serif text-2xl text-navy mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-navy">Is my donation tax-deductible?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Yes. Light and Salt is a registered nonprofit organization. You will
                  receive a donation receipt for tax purposes.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-navy">Is my payment secure?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Absolutely. All payments are processed through secure, encrypted
                  channels via our trusted payment partners (Stripe, M-Pesa, PayPal).
                </p>
              </div>
              <div>
                <h3 className="font-medium text-navy">Can I cancel a recurring donation?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Yes. You can manage and cancel recurring donations from your giving
                  dashboard at any time.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-navy">How is my donation used?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Donations support ministry operations, community outreach, missions,
                  youth programs, and building upkeep. Campaign-specific donations go
                  directly toward their stated purpose.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

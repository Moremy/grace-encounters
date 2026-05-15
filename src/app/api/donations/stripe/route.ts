import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { donationSchema } from '@/lib/donation/schemas';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validation = donationSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  const data = validation.data;

  // Validate campaign if provided
  if (data.campaignId) {
    const campaign = await prisma.donationCampaign.findFirst({
      where: { id: data.campaignId, active: true },
    });
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found or inactive' },
        { status: 400 },
      );
    }
  }

  const donation = await prisma.donation.create({
    data: {
      donorId: user.id,
      amount: data.amount,
      currency: data.currency,
      provider: 'STRIPE',
      campaignId: data.campaignId || null,
      status: 'PENDING',
      recurring: data.recurring,
      recurringInterval: data.recurringInterval || null,
    },
  });

  // TODO: Create Stripe Checkout Session with stripe.checkout.sessions.create()
  // const session = await stripe.checkout.sessions.create({
  //   payment_method_types: ['card'],
  //   line_items: [{ price_data: { currency: data.currency, unit_amount: data.amount * 100, product_data: { name: 'Donation' } }, quantity: 1 }],
  //   mode: data.recurring ? 'subscription' : 'payment',
  //   success_url: `${process.env.NEXT_PUBLIC_APP_URL}/donate/thank-you?session_id={CHECKOUT_SESSION_ID}`,
  //   cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/donate`,
  //   metadata: { donationId: donation.id },
  // });

  return NextResponse.json({
    success: true,
    donationId: donation.id,
    checkoutUrl: '/donate/thank-you',
  });
}

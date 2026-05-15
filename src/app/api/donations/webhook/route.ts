import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  // TODO: Validate webhook signature based on provider
  // For Stripe: stripe.webhooks.constructEvent(body, sig, webhookSecret)
  // For M-Pesa: Validate the callback using Daraja API credentials
  // For PayPal: Verify webhook notification via PayPal API

  const body = await request.json();

  const { donationId, status, providerTransactionId, provider } = body as {
    donationId?: string;
    status?: string;
    providerTransactionId?: string;
    provider?: string;
  };

  if (!donationId || !status) {
    return NextResponse.json(
      { error: 'Missing donationId or status' },
      { status: 400 },
    );
  }

  const validStatuses = ['COMPLETED', 'FAILED', 'REFUNDED'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { error: 'Invalid status' },
      { status: 400 },
    );
  }

  // Verify donation exists
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
  });

  if (!donation) {
    return NextResponse.json(
      { error: 'Donation not found' },
      { status: 404 },
    );
  }

  // Update donation status
  await prisma.donation.update({
    where: { id: donationId },
    data: {
      status: status as 'COMPLETED' | 'FAILED' | 'REFUNDED',
      providerTransactionId: providerTransactionId || undefined,
    },
  });

  // If completed and linked to a campaign, increment currentAmount
  if (status === 'COMPLETED' && donation.campaignId) {
    await prisma.donationCampaign.update({
      where: { id: donation.campaignId },
      data: {
        currentAmount: {
          increment: donation.amount,
        },
      },
    });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

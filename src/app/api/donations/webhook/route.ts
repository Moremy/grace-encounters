import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  // Validate webhook signature via shared secret header
  const webhookSecret = process.env.WEBHOOK_SECRET;
  const signature = request.headers.get('x-webhook-secret');

  if (!webhookSecret || signature !== webhookSecret) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    );
  }

  const body = await request.json();

  const { donationId, status, providerTransactionId } = body as {
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

  // Wrap status update and campaign increment in a transaction for atomicity
  await prisma.$transaction(async (tx) => {
    // Update donation status
    await tx.donation.update({
      where: { id: donationId },
      data: {
        status: status as 'COMPLETED' | 'FAILED' | 'REFUNDED',
        providerTransactionId: providerTransactionId || undefined,
      },
    });

    // Only increment campaign amount when transitioning from non-COMPLETED to COMPLETED
    if (
      status === 'COMPLETED' &&
      donation.status !== 'COMPLETED' &&
      donation.campaignId
    ) {
      await tx.donationCampaign.update({
        where: { id: donation.campaignId },
        data: {
          currentAmount: {
            increment: donation.amount,
          },
        },
      });
    }
  });

  return NextResponse.json({ success: true }, { status: 200 });
}

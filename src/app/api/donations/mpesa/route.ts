import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { donationSchema } from '@/lib/donation/schemas';
import { z } from 'zod';

const mpesaBodySchema = donationSchema.extend({
  phone: z.string().min(10, 'Valid phone number required'),
});

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
  const validation = mpesaBodySchema.safeParse(body);

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
      provider: 'MPESA',
      campaignId: data.campaignId || null,
      status: 'PENDING',
      recurring: data.recurring,
      recurringInterval: data.recurringInterval || null,
    },
  });

  // TODO: Initiate M-Pesa STK Push via Daraja API
  // const mpesaResponse = await initiateSTKPush({
  //   phoneNumber: data.phone,
  //   amount: data.amount,
  //   accountReference: donation.id,
  //   transactionDesc: 'Donation to Light and Salt',
  // });

  return NextResponse.json({
    success: true,
    donationId: donation.id,
  });
}

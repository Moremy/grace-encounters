'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { CounsellingCategory, CounsellingContactMethod } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

function isCounsellingCategory(value: string): value is CounsellingCategory {
  return Object.values(CounsellingCategory).includes(value as CounsellingCategory);
}

function isContactMethod(value: string): value is CounsellingContactMethod {
  return Object.values(CounsellingContactMethod).includes(value as CounsellingContactMethod);
}

export async function createCounsellingRequest(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in?error=Please%20sign%20in%20to%20request%20counselling');
  }

  const category = String(formData.get('category') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const contactMethod = String(formData.get('contactMethod') || '').trim();
  const contactDetails = String(formData.get('contactDetails') || '').trim();

  if (
    !isCounsellingCategory(category) ||
    !description ||
    !isContactMethod(contactMethod) ||
    !contactDetails
  ) {
    redirect('/dashboard/counselling/new?error=Please%20complete%20all%20required%20fields');
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true },
  });

  if (!profile) {
    redirect('/dashboard/counselling/new?error=Profile%20not%20found');
  }

  await prisma.counsellingRequest.create({
    data: {
      requesterId: profile.id,
      category,
      description,
      contactMethod,
      contactDetails,
      status: 'PENDING',
    },
  });

  revalidatePath('/dashboard/counselling');
  redirect('/dashboard/counselling?submitted=1');
}

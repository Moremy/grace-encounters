import { z } from 'zod';

export const donationSchema = z.object({
  amount: z.number().min(1, 'Minimum donation is $1').max(100000),
  currency: z.string().default('USD'),
  provider: z.enum(['STRIPE', 'MPESA', 'PAYPAL']),
  campaignId: z.string().optional(),
  recurring: z.boolean().default(false),
  recurringInterval: z.enum(['weekly', 'monthly', 'yearly']).optional(),
});

export const campaignSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  goalAmount: z.number().min(100),
  imageUrl: z.string().url().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
});

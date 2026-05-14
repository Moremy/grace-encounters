import { z } from 'zod';
import { TESTIMONY_CATEGORY_VALUES } from './categories';

/**
 * Submission shape. Used by the submitTestimony and resubmitTestimony actions.
 * Title and body have generous limits because testimonies are the heart of
 * the site - we do not want to truncate the work of grace.
 */
export const testimonySubmissionSchema = z.object({
  title: z.string().trim().min(8, 'Title must be at least 8 characters.').max(140, 'Title must be 140 characters or fewer.'),
  category: z.enum(TESTIMONY_CATEGORY_VALUES as unknown as [string, ...string[]]),
  body: z.string().trim().min(120, 'Please share at least 120 characters of your testimony.').max(20_000, 'Testimonies are capped at 20,000 characters.'),
  scriptureRefs: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  coverImageUrl: z.string().url().max(2048).optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
  isAnonymous: z.boolean().default(false),
});

export type TestimonySubmissionInput = z.infer<typeof testimonySubmissionSchema>;

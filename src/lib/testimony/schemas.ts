import { z } from 'zod';

export const TESTIMONY_CATEGORIES = [
  'HEALING',
  'SALVATION',
  'DELIVERANCE',
  'PROVISION',
  'RESTORATION',
  'FAITH',
  'OTHER',
] as const;

export const MEDIA_TYPES = ['TEXT', 'PDF', 'AUDIO', 'VIDEO'] as const;

export const createTestimonySchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be at most 200 characters'),
  excerpt: z
    .string()
    .min(10, 'Excerpt must be at least 10 characters')
    .max(200, 'Excerpt must be at most 200 characters'),
  content: z
    .string()
    .min(50, 'Content must be at least 50 characters')
    .max(10000, 'Content must be at most 10000 characters'),
  mediaType: z.enum(MEDIA_TYPES).optional().default('TEXT'),
  mediaUrl: z.string().url().optional().or(z.literal('')),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  category: z.enum(TESTIMONY_CATEGORIES).optional(),
  tags: z.string().optional(),
});

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'audio/mpeg',
  'audio/ogg',
  'video/mp4',
  'video/webm',
] as const;

const MAX_SIZES: Record<string, number> = {
  'application/pdf': 10 * 1024 * 1024, // 10MB
  'audio/mpeg': 50 * 1024 * 1024, // 50MB
  'audio/ogg': 50 * 1024 * 1024, // 50MB
  'video/mp4': 200 * 1024 * 1024, // 200MB
  'video/webm': 200 * 1024 * 1024, // 200MB
};

export const uploadValidationSchema = z.object({
  fileType: z.enum(ALLOWED_FILE_TYPES, {
    errorMap: () => ({
      message:
        'Invalid file type. Accepted: PDF, MP3, OGG, MP4, WebM',
    }),
  }),
  fileSize: z.number().positive(),
}).refine(
  (data) => data.fileSize <= (MAX_SIZES[data.fileType] ?? 0),
  {
    message: 'File exceeds maximum allowed size',
  },
);

export function getMaxSizeForType(fileType: string): number {
  return MAX_SIZES[fileType] ?? 0;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

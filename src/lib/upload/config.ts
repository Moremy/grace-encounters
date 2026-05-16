/**
 * Upload configuration: allowed file types, max sizes, and storage buckets.
 */

export const UPLOAD_CONFIG = {
  image: {
    maxSizeMB: 10,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'],
  },
  audio: {
    maxSizeMB: 100,
    allowedTypes: ['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/webm'],
    extensions: ['.mp3', '.m4a', '.ogg', '.wav', '.webm'],
  },
  video: {
    maxSizeMB: 500,
    allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    extensions: ['.mp4', '.webm', '.mov'],
  },
  pdf: {
    maxSizeMB: 20,
    allowedTypes: ['application/pdf'],
    extensions: ['.pdf'],
  },
} as const;

export type UploadCategory = keyof typeof UPLOAD_CONFIG;

export const STORAGE_BUCKETS = {
  testimonies: 'testimonies',
  sermons: 'sermons',
  media: 'media',
  avatars: 'avatars',
  events: 'events',
  devotionals: 'devotionals',
  blog: 'blog',
  general: 'general',
} as const;

export type StorageBucket = keyof typeof STORAGE_BUCKETS;

/**
 * Validate a file against the upload configuration for a given category.
 */
export function validateUpload(
  file: { type: string; size: number },
  category: UploadCategory,
): { valid: boolean; error?: string } {
  const config = UPLOAD_CONFIG[category];
  const maxBytes = config.maxSizeMB * 1024 * 1024;

  if (!config.allowedTypes.includes(file.type as never)) {
    return {
      valid: false,
      error: `Invalid file type for ${category}. Allowed: ${config.extensions.join(', ')}`,
    };
  }

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File too large. Maximum for ${category}: ${config.maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

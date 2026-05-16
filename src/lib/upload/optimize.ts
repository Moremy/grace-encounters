/**
 * Image upload optimization utilities.
 * Provides validation, thumbnail generation, and CDN-friendly URL construction.
 */

interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

/**
 * Validate an image file for upload.
 * @param file - The file object to validate
 * @param maxSizeMB - Maximum allowed file size in megabytes
 */
export function validateImageFile(
  file: { type: string; size: number },
  maxSizeMB: number = 10,
): ImageValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * Generate a thumbnail URL using Supabase Storage transformations.
 * @param url - Original storage URL
 * @param width - Thumbnail width in pixels
 * @param height - Thumbnail height in pixels
 */
export function generateThumbnailUrl(
  url: string,
  width: number = 200,
  height: number = 200,
): string {
  // Supabase Storage transform API pattern
  const transformParams = `width=${width}&height=${height}&resize=cover`;

  if (url.includes('/storage/v1/object/public/')) {
    return url.replace(
      '/storage/v1/object/public/',
      `/storage/v1/render/image/public/`,
    ) + `?${transformParams}`;
  }

  // Fallback: append as query params
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${transformParams}`;
}

interface OptimizedImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}

/**
 * Get an optimized image URL with CDN-friendly parameters.
 * Compatible with Next.js Image component and Supabase Storage transforms.
 */
export function getOptimizedImageUrl(
  url: string,
  options: OptimizedImageOptions = {},
): string {
  const { width, height, quality = 80, format } = options;

  const params = new URLSearchParams();
  if (width) params.set('width', String(width));
  if (height) params.set('height', String(height));
  if (quality) params.set('quality', String(quality));
  if (format) params.set('format', format);

  if (url.includes('/storage/v1/object/public/')) {
    const renderUrl = url.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/',
    );
    return `${renderUrl}?${params.toString()}`;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.toString()}`;
}

/**
 * Get responsive image srcSet for different viewport sizes.
 */
export function getResponsiveSrcSet(
  url: string,
  widths: number[] = [320, 640, 960, 1280],
  options: Omit<OptimizedImageOptions, 'width'> = {},
): string {
  return widths
    .map((w) => `${getOptimizedImageUrl(url, { ...options, width: w })} ${w}w`)
    .join(', ');
}

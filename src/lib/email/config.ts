/**
 * Email provider configuration.
 * Reads from environment variables with sensible defaults.
 */

function getUnsubscribeSecret(): string {
  const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET;
  if (secret) {
    return secret;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEWSLETTER_UNSUBSCRIBE_SECRET environment variable is required in production',
    );
  }
  // Only allow fallback in development/test environments
  return 'dev-secret-do-not-use-in-production';
}

export const emailConfig = {
  /** Resend API key for sending emails */
  apiKey: process.env.RESEND_API_KEY ?? '',
  /** Default "from" email address */
  fromAddress: process.env.EMAIL_FROM_ADDRESS ?? 'noreply@lightandsalt.church',
  /** Default "from" display name */
  fromName: process.env.EMAIL_FROM_NAME ?? 'Light Bearers',
  /** Secret used for generating unsubscribe tokens */
  unsubscribeSecret: getUnsubscribeSecret(),
  /** Whether email sending is enabled (requires API key) */
  get isEnabled() {
    return Boolean(this.apiKey);
  },
  /** Formatted "from" header value */
  get from() {
    return `${this.fromName} <${this.fromAddress}>`;
  },
};

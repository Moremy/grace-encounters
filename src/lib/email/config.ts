/**
 * Email provider configuration.
 * Reads from environment variables with sensible defaults.
 */

export const emailConfig = {
  /** Resend API key for sending emails */
  apiKey: process.env.RESEND_API_KEY ?? '',
  /** Default "from" email address */
  fromAddress: process.env.EMAIL_FROM_ADDRESS ?? 'noreply@lightandsalt.church',
  /** Default "from" display name */
  fromName: process.env.EMAIL_FROM_NAME ?? 'Light and Salt',
  /** Secret used for generating unsubscribe tokens */
  unsubscribeSecret:
    process.env.NEWSLETTER_UNSUBSCRIBE_SECRET ?? 'dev-secret-change-me',
  /** Whether email sending is enabled (requires API key) */
  get isEnabled() {
    return Boolean(this.apiKey);
  },
  /** Formatted "from" header value */
  get from() {
    return `${this.fromName} <${this.fromAddress}>`;
  },
};

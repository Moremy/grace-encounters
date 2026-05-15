import { emailConfig } from './config';
import { prisma } from '@/lib/prisma';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  recipientId?: string;
  templateSlug?: string;
}

interface SendEmailResult {
  success: boolean;
  error?: string;
}

/**
 * Email sending abstraction.
 * If RESEND_API_KEY is not configured, logs to console instead of sending.
 * All sends are logged to EmailLog for tracking.
 */
export async function sendEmail(
  options: SendEmailOptions,
): Promise<SendEmailResult> {
  const { to, subject, html, text, recipientId, templateSlug } = options;

  // Create initial log entry as QUEUED
  const emailLog = await prisma.emailLog.create({
    data: {
      recipientId: recipientId ?? null,
      recipientEmail: to,
      templateSlug: templateSlug ?? 'custom',
      subject,
      status: 'QUEUED',
    },
  });

  if (!emailConfig.isEnabled) {
    // Gracefully handle missing API key - log to console
    console.log('[Email] API key not configured. Would have sent:');
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Template: ${templateSlug ?? 'custom'}`);

    // Mark as sent in dev mode so the flow continues
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { status: 'SENT', sentAt: new Date() },
    });

    return { success: true };
  }

  try {
    // Call Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${emailConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailConfig.from,
        to: [to],
        subject,
        html,
        text: text ?? undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Resend API error: ${response.status} - ${errorData}`);
    }

    // Mark as sent
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { status: 'SENT', sentAt: new Date() },
    });

    return { success: true };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown email error';

    // Mark as failed
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { status: 'FAILED', errorMessage },
    });

    console.error('[Email] Send failed:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Email template rendering utilities.
 * Uses inline CSS for email compatibility with navy/gold/ivory theme.
 */

const COLORS = {
  navy: '#1e3a5f',
  gold: '#b8975a',
  ivory: '#f9f7f4',
  text: '#333333',
  muted: '#666666',
};

function emailLayout(content: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Light Bearers</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.ivory};font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ''}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${COLORS.ivory};">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:${COLORS.navy};padding:24px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">Light Bearers</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;color:${COLORS.text};font-size:16px;line-height:1.6;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:${COLORS.ivory};text-align:center;border-top:1px solid #e5e5e5;">
              <p style="margin:0;color:${COLORS.muted};font-size:12px;">
                Light Bearers Community<br/>
                <a href="{unsubscribe_url}" style="color:${COLORS.gold};text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export interface DonationReceiptData {
  donorName: string;
  amount: string;
  currency: string;
  date: string;
  campaignTitle?: string;
  transactionId?: string;
}

export function renderDonationReceipt(data: DonationReceiptData): {
  html: string;
  text: string;
  subject: string;
} {
  const content = `
    <h2 style="margin:0 0 16px;color:${COLORS.navy};font-size:20px;">Thank You for Your Generosity</h2>
    <p>Dear ${data.donorName},</p>
    <p>We have received your donation and are deeply grateful for your support.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;background-color:${COLORS.ivory};border-radius:4px;">
      <tr>
        <td style="padding:16px;">
          <p style="margin:0 0 8px;"><strong>Amount:</strong> ${data.currency} ${data.amount}</p>
          <p style="margin:0 0 8px;"><strong>Date:</strong> ${data.date}</p>
          ${data.campaignTitle ? `<p style="margin:0 0 8px;"><strong>Campaign:</strong> ${data.campaignTitle}</p>` : ''}
          ${data.transactionId ? `<p style="margin:0;"><strong>Transaction ID:</strong> ${data.transactionId}</p>` : ''}
        </td>
      </tr>
    </table>
    <p style="color:${COLORS.muted};font-size:14px;">This email serves as your donation receipt. Please keep it for your records.</p>
  `;

  const text = `Thank You for Your Generosity

Dear ${data.donorName},

We have received your donation of ${data.currency} ${data.amount} on ${data.date}.${data.campaignTitle ? ` Campaign: ${data.campaignTitle}.` : ''}${data.transactionId ? ` Transaction ID: ${data.transactionId}.` : ''}

Thank you for your support.

- Light Bearers Community`;

  return {
    html: emailLayout(content, 'Thank you for your generous donation'),
    text,
    subject: 'Donation Receipt - Light Bearers',
  };
}

export interface PrayerReminderData {
  userName: string;
  prayers: { title: string; excerpt: string }[];
}

export function renderPrayerReminder(data: PrayerReminderData): {
  html: string;
  text: string;
  subject: string;
} {
  const prayerList = data.prayers
    .map(
      (p) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #e5e5e5;">
        <p style="margin:0 0 4px;font-weight:600;color:${COLORS.navy};">${p.title}</p>
        <p style="margin:0;color:${COLORS.muted};font-size:14px;">${p.excerpt}</p>
      </td>
    </tr>`,
    )
    .join('');

  const content = `
    <h2 style="margin:0 0 16px;color:${COLORS.navy};font-size:20px;">Prayer Reminders</h2>
    <p>Dear ${data.userName},</p>
    <p>Here are some prayer requests from our community that need your intercession:</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;background-color:${COLORS.ivory};border-radius:4px;">
      ${prayerList}
    </table>
    <p><a href="#" style="color:${COLORS.gold};font-weight:600;">Visit the Prayer Wall</a></p>
  `;

  const textPrayers = data.prayers
    .map((p) => `- ${p.title}: ${p.excerpt}`)
    .join('\n');
  const text = `Prayer Reminders

Dear ${data.userName},

Here are some prayer requests from our community:

${textPrayers}

- Light Bearers Community`;

  return {
    html: emailLayout(content, 'Prayer requests need your intercession'),
    text,
    subject: 'Prayer Reminders - Light Bearers',
  };
}

export interface DevotionalNotificationData {
  title: string;
  excerpt: string;
  scriptureReference: string;
  slug: string;
}

export function renderDevotionalNotification(
  data: DevotionalNotificationData,
): { html: string; text: string; subject: string } {
  const content = `
    <h2 style="margin:0 0 16px;color:${COLORS.navy};font-size:20px;">New Devotional</h2>
    <h3 style="margin:0 0 8px;color:${COLORS.navy};font-size:18px;">${data.title}</h3>
    <p style="margin:0 0 16px;color:${COLORS.gold};font-style:italic;font-size:14px;">${data.scriptureReference}</p>
    <p>${data.excerpt}</p>
    <p style="margin-top:24px;">
      <a href="#" style="display:inline-block;padding:12px 24px;background-color:${COLORS.navy};color:#ffffff;text-decoration:none;border-radius:4px;font-weight:600;">Read Full Devotional</a>
    </p>
  `;

  const text = `New Devotional: ${data.title}

${data.scriptureReference}

${data.excerpt}

- Light Bearers Community`;

  return {
    html: emailLayout(content, `New devotional: ${data.title}`),
    text,
    subject: `New Devotional: ${data.title} - Light Bearers`,
  };
}

export interface EventReminderData {
  eventTitle: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

export function renderEventReminder(data: EventReminderData): {
  html: string;
  text: string;
  subject: string;
} {
  const content = `
    <h2 style="margin:0 0 16px;color:${COLORS.navy};font-size:20px;">Event Reminder</h2>
    <h3 style="margin:0 0 16px;color:${COLORS.navy};font-size:18px;">${data.eventTitle}</h3>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;background-color:${COLORS.ivory};border-radius:4px;">
      <tr>
        <td style="padding:16px;">
          <p style="margin:0 0 8px;"><strong>Date:</strong> ${data.date}</p>
          <p style="margin:0 0 8px;"><strong>Time:</strong> ${data.time}</p>
          <p style="margin:0 0 8px;"><strong>Location:</strong> ${data.location}</p>
        </td>
      </tr>
    </table>
    <p>${data.description}</p>
    <p style="margin-top:24px;">
      <a href="#" style="display:inline-block;padding:12px 24px;background-color:${COLORS.gold};color:#ffffff;text-decoration:none;border-radius:4px;font-weight:600;">View Event Details</a>
    </p>
  `;

  const text = `Event Reminder: ${data.eventTitle}

Date: ${data.date}
Time: ${data.time}
Location: ${data.location}

${data.description}

- Light Bearers Community`;

  return {
    html: emailLayout(content, `Reminder: ${data.eventTitle}`),
    text,
    subject: `Event Reminder: ${data.eventTitle} - Light Bearers`,
  };
}

export interface NewsletterEmailData {
  subject: string;
  content: string;
}

export function renderNewsletterEmail(data: NewsletterEmailData): {
  html: string;
  text: string;
  subject: string;
} {
  const htmlContent = `
    <h2 style="margin:0 0 16px;color:${COLORS.navy};font-size:20px;">${data.subject}</h2>
    ${data.content}
  `;

  return {
    html: emailLayout(htmlContent, data.subject),
    text: `${data.subject}\n\n${data.content.replace(/<[^>]*>/g, '')}\n\n- Light Bearers Community`,
    subject: `${data.subject} - Light Bearers`,
  };
}

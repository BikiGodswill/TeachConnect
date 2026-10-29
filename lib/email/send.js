// Sends one e-mail through Resend's HTTP API (no SDK needed).
// Set RESEND_API_KEY and EMAIL_FROM (e.g. "Teacher Connect <notifications@yourdomain.com>").
export const emailConfigured = () => !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM;

export async function sendEmail({ to, subject, html, text }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], subject, html, text, reply_to: process.env.EMAIL_REPLY_TO || undefined }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Provider ${res.status}: ${detail.slice(0, 200)}`);
  }
}

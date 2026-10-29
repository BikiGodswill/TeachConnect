// Builds the HTML + plain-text e-mail for one notification. No external dependencies.
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');

// Where the button in the e-mail goes. Only our own known id fields are used, never free text.
export function linkFor(type = '', data = {}) {
  const d = data || {};
  const base = siteUrl();
  if (!base) return null;
  let path = '/dashboard';
  if (d.assignment_id) path = `/learning/assignment/${d.assignment_id}`;
  else if (d.attempt_id) path = `/learning/test/${d.attempt_id}`;
  else if (d.certificate_id) path = `/learning/certificate/${d.certificate_id}`;
  else if (d.booking_id) path = `/lesson/${d.booking_id}`;
  else if (type === 'ADMIN_NEW_TEACHER' || type === 'ADMIN_VERIFICATION') path = '/admin/verification';
  else if (type === 'ADMIN_DISPUTE') path = '/admin/disputes';
  else if (type === 'ADMIN_WITHDRAWAL') path = '/admin/withdrawals';
  else if (type === 'ADMIN_SAFETY') path = '/admin/safety';
  else if (type === 'ADMIN_SCHOOL') path = '/admin/schools';
  else if (type === 'VERIFICATION') path = '/teacher/profile';
  else if (type === 'WITHDRAWAL') path = '/teacher/wallet';
  else if (type === 'NEW_MESSAGE') path = '/dashboard';
  else if (d.job_id) path = '/jobs';
  return base + path;
}

export function renderEmail({ name, subject, body, type, data }) {
  const link = linkFor(type, data);
  const first = esc((name || '').split(' ')[0] || 'there');
  const text = [`Hello ${(name || '').split(' ')[0] || 'there'},`, '', subject, body ? `\n${body}` : '', link ? `\nOpen: ${link}` : '',
    '\n—\nTeacher Connect\nYou can switch off non-essential e-mails in your profile settings.'].join('\n');
  const html = `<!doctype html><html><body style="margin:0;background:#f1f6fd;font-family:Arial,Helvetica,sans-serif;color:#0b1a3a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden" cellpadding="0" cellspacing="0">
<tr><td style="background:#0b1a3a;padding:18px 24px;color:#ffffff;font-size:18px;font-weight:bold">Teacher<span style="color:#2bb3a0">Connect</span></td></tr>
<tr><td style="padding:28px 24px">
<p style="margin:0 0 12px;font-size:15px">Hello ${first},</p>
<h1 style="margin:0 0 12px;font-size:20px">${esc(subject)}</h1>
${body ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#44506b">${esc(body)}</p>` : ''}
${link ? `<a href="${esc(link)}" style="display:inline-block;background:#2bb3a0;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:999px">Open Teacher Connect</a>` : ''}
</td></tr>
<tr><td style="padding:16px 24px;background:#f8fafc;font-size:12px;color:#7a869f">You receive this because of activity on your Teacher Connect account. You can switch off non-essential e-mails in your profile settings.</td></tr>
</table></td></tr></table></body></html>`;
  return { subject, html, text };
}

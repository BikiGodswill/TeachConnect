import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { renderEmail } from '@/lib/email/template';
import { sendEmail, emailConfigured } from '@/lib/email/send';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Sends queued notification e-mails. Callers: a Supabase Database Webhook (instant), a scheduler (every few minutes),
// or Vercel Cron. Every caller must present the shared secret; nothing else can trigger sending.
function authorised(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = req.headers.get('x-webhook-secret') || (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const a = Buffer.from(given), b = Buffer.from(secret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function run(req) {
  if (!authorised(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (!emailConfigured()) return NextResponse.json({ error: 'E-mail is not configured (RESEND_API_KEY / EMAIL_FROM).' }, { status: 503 });
  const db = createAdminClient();
  let sent = 0, failed = 0;
  for (let round = 0; round < 4; round++) {
    const { data: rows, error } = await db.rpc('claim_emails', { p_limit: 25 });
    if (error) return NextResponse.json({ error: error.message, sent, failed }, { status: 500 });
    if (!rows?.length) break;
    for (const r of rows) {
      try {
        await sendEmail({ to: r.email, ...renderEmail({ name: r.full_name, subject: r.subject, body: r.body, type: r.type, data: r.data }) });
        await db.rpc('finish_email', { p_id: r.id, p_ok: true });
        sent++;
      } catch (e) {
        await db.rpc('finish_email', { p_id: r.id, p_ok: false, p_error: String(e.message || e) });
        failed++;
      }
    }
  }
  await db.rpc('drop_unaddressable_emails');
  return NextResponse.json({ ok: true, sent, failed });
}

export const POST = run;
export const GET = run; // Vercel Cron uses GET

import { NextResponse } from 'next/server';
import { getProvider } from '@/lib/payments/provider';
import { settlePayment } from '@/lib/payments/settle';

// A payment becomes PAID only here or in /verify, and only from data fetched/verified server-side.
export async function POST(req) {
  const raw = await req.text();
  let evt;
  try { evt = await getProvider().verifyWebhook(raw, req.headers, req.url); }
  catch { return NextResponse.json({ error: 'Invalid or unverifiable webhook' }, { status: 401 }); }
  const r = await settlePayment(evt);
  if (r.code) return NextResponse.json({ error: r.message || r.state }, { status: r.code });
  return NextResponse.json({ ok: true, state: r.state });
}

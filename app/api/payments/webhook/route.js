import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getProvider } from '@/lib/payments/provider';

// The ONLY place a payment becomes PAID. The browser's "success" screen is never trusted.
export async function POST(req) {
  const raw = await req.text();
  let evt;
  try { evt = getProvider().verifyWebhook(raw, req.headers); }
  catch { return NextResponse.json({ error: 'Invalid signature' }, { status: 401 }); }

  const admin = createAdminClient();
  const { data: p } = await admin.from('payments')
    .select('id,booking_id,amount,payment_status,transaction_reference').eq('id', evt.paymentId).maybeSingle();
  if (!p) return NextResponse.json({ error: 'Unknown payment' }, { status: 404 });

  // idempotent: provider retries must not double-process
  if (p.payment_status === 'PAID' || p.payment_status === 'HELD') return NextResponse.json({ ok: true, duplicate: true });

  if (evt.status !== 'SUCCESS') {
    await admin.from('payments').update({ payment_status: 'FAILED' }).eq('id', p.id);
    return NextResponse.json({ ok: true });
  }
  // verify reference and amount against OUR record
  if (evt.reference !== p.transaction_reference || Number(evt.amount) !== Number(p.amount)) {
    await admin.from('audit_logs').insert({ action: 'PAYMENT_MISMATCH', entity: 'payments', entity_id: p.id, details: { evt } });
    return NextResponse.json({ error: 'Mismatch' }, { status: 409 });
  }

  const { error } = await admin.rpc('mark_payment_confirmed', { p_payment: p.id, p_reference: evt.reference });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await admin.from('bookings').update({ status: 'CONFIRMED' }).eq('id', p.booking_id).eq('status', 'ACCEPTED');
  await admin.from('audit_logs').insert({ action: 'PAYMENT_CONFIRMED', entity: 'payments', entity_id: p.id, details: { reference: evt.reference } });
  return NextResponse.json({ ok: true });
}

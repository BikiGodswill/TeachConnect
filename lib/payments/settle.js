import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Apply a provider-verified result to OUR records. `evt` must come from the provider (status API / signed
 * webhook), never from the browser. Idempotent. Returns { state: 'PAID'|'FAILED'|'PENDING'|'MISMATCH'|'UNKNOWN' }.
 */
export async function settlePayment(evt) {
  const admin = createAdminClient();
  const { data: p } = await admin.from('payments')
    .select('id,booking_id,amount,payment_status,transaction_reference').eq('id', evt.paymentId).maybeSingle();
  if (!p) return { state: 'UNKNOWN', code: 404 };
  if (p.payment_status === 'PAID' || p.payment_status === 'HELD') return { state: 'PAID', duplicate: true };
  if (evt.status === 'PENDING') return { state: 'PENDING' };
  if (evt.status !== 'SUCCESS') {
    await admin.from('payments').update({ payment_status: 'FAILED' }).eq('id', p.id);
    return { state: 'FAILED' };
  }
  if (evt.reference !== p.transaction_reference || Number(evt.amount) !== Number(p.amount)) {
    await admin.from('audit_logs').insert({ action: 'PAYMENT_MISMATCH', entity: 'payments', entity_id: p.id, details: { evt } });
    return { state: 'MISMATCH', code: 409 };
  }
  const { error } = await admin.rpc('mark_payment_confirmed', { p_payment: p.id, p_reference: evt.reference });
  if (error) return { state: 'ERROR', code: 500, message: error.message };
  await admin.from('bookings').update({ status: 'CONFIRMED' }).eq('id', p.booking_id).eq('status', 'ACCEPTED');
  await admin.from('audit_logs').insert({ action: 'PAYMENT_CONFIRMED', entity: 'payments', entity_id: p.id, details: { reference: evt.reference } });
  return { state: 'PAID' };
}

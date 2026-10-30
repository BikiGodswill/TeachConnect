import { NextResponse } from 'next/server';
import { createAuthClient } from '@/lib/supabase/auth-server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getProvider } from '@/lib/payments/provider';
import { settlePayment } from '@/lib/payments/settle';

// Called when the student returns from checkout. The browser only says WHICH booking; the result is
// fetched from the payment provider server-side.
export async function POST(req) {
  const db = createAuthClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  const { bookingId } = await req.json().catch(() => ({}));
  const { data: b } = await db.from('booking_details').select('id,student_id,payment_id,payment_status').eq('id', bookingId).maybeSingle();
  if (!b || b.student_id !== user.id) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  if (b.payment_status === 'PAID' || b.payment_status === 'HELD') return NextResponse.json({ state: 'PAID' });

  const provider = getProvider();
  if (!provider.getStatus) return NextResponse.json({ state: 'PENDING' });
  const { data: p } = await createAdminClient().from('payments').select('transaction_reference').eq('id', b.payment_id).maybeSingle();
  if (!p?.transaction_reference) return NextResponse.json({ state: 'PENDING' });
  try {
    const evt = await provider.getStatus(p.transaction_reference);
    evt.paymentId = b.payment_id; // trust our own mapping, not the provider echo
    const r = await settlePayment(evt);
    return NextResponse.json({ state: r.state });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}

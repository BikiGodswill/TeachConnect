import { NextResponse } from 'next/server';
import { createAuthClient } from '@/lib/supabase/auth-server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getProvider } from '@/lib/payments/provider';

export async function POST(req) {
  const db = createAuthClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });

  const { bookingId } = await req.json().catch(() => ({}));
  const { data: b } = await db.from('booking_details')
    .select('id,student_id,status,payment_id,payment_method,payment_status,amount,currency').eq('id', bookingId).maybeSingle();
  if (!b || b.student_id !== user.id) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  if (b.payment_method !== 'TEACHER_CONNECT') return NextResponse.json({ error: 'This booking is paid outside the app.' }, { status: 409 });
  if (b.status !== 'ACCEPTED') return NextResponse.json({ error: 'You can pay once the teacher accepts.' }, { status: 409 });
  if (!['UNPAID', 'PENDING', 'FAILED'].includes(b.payment_status)) return NextResponse.json({ error: 'Already paid.' }, { status: 409 });

  try {
    // amount comes from the database row, never from the browser
    const origin = new URL(req.url).origin;
    const checkout = await getProvider().createCheckout({
      paymentId: b.payment_id, amount: b.amount, currency: b.currency, returnUrl: `${origin}/student/bookings`,
    });
    const admin = createAdminClient();
    await admin.from('payments').update({ payment_status: 'PENDING', transaction_reference: checkout.reference, provider: process.env.PAYMENT_PROVIDER || 'mock' }).eq('id', b.payment_id);
    return NextResponse.json({ url: checkout.url });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

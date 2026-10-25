import { NextResponse } from 'next/server';
import { createAuthClient } from '@/lib/supabase/auth-server';

export async function POST(req) {
  const db = createAuthClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  const { paymentId } = await req.json().catch(() => ({}));
  if (!/^[0-9a-f-]{36}$/i.test(paymentId || '')) return NextResponse.json({ error: 'Invalid payment.' }, { status: 400 });
  const { error } = await db.rpc('confirm_offplatform_payment', { p_payment: paymentId });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

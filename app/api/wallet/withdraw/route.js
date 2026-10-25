import { NextResponse } from 'next/server';
import { createAuthClient } from '@/lib/supabase/auth-server';

export async function POST(req) {
  const db = createAuthClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const amount = Number(b.amount);
  if (!Number.isInteger(amount) || amount <= 0) return NextResponse.json({ error: 'Enter a valid amount.' }, { status: 400 });
  if (!['MOBILE_MONEY', 'BANK'].includes(b.destinationType)) return NextResponse.json({ error: 'Choose a destination.' }, { status: 400 });
  const ref = String(b.destinationRef || '').trim();
  if (ref.length < 6 || ref.length > 40) return NextResponse.json({ error: 'Enter a valid number or account.' }, { status: 400 });
  const { data, error } = await db.rpc('request_withdrawal', { p_amount: amount, p_type: b.destinationType, p_ref: ref });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data }, { status: 201 });
}

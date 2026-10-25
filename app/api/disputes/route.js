import { NextResponse } from 'next/server';
import { createAuthClient } from '@/lib/supabase/auth-server';

const REASONS = ['TEACHER_NO_SHOW', 'TEACHER_LATE', 'LESSON_SHORT', 'WRONG_SERVICE', 'POOR_SERVICE', 'SAFETY', 'TECHNICAL', 'OTHER'];

export async function POST(req) {
  const db = createAuthClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!/^[0-9a-f-]{36}$/i.test(b.paymentId || '') || !REASONS.includes(b.reason)) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  const { data, error } = await db.rpc('open_dispute', {
    p_payment: b.paymentId, p_reason: b.reason, p_description: String(b.description || '').slice(0, 2000), p_evidence: [],
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data }, { status: 201 });
}

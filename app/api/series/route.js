import { NextResponse } from 'next/server';
import { createAuthClient } from '@/lib/supabase/auth-server';

// Teacher accepts or declines every pending lesson of a repeating series in one go.
export async function POST(req) {
  const db = createAuthClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!/^[0-9a-f-]{36}$/i.test(b.seriesId || '') || typeof b.accept !== 'boolean') return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  const { data, error } = await db.rpc('respond_series', { p_series: b.seriesId, p_accept: b.accept });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, count: data });
}

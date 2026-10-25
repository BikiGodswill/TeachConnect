import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  if (!/^[0-9a-f-]{36}$/i.test(b.teacherId || '') || typeof b.approve !== 'boolean') return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  const { error } = await createAdminClient().rpc('review_verification', {
    p_teacher: b.teacherId, p_admin: admin.id, p_approve: b.approve, p_note: String(b.note || '').slice(0, 500),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

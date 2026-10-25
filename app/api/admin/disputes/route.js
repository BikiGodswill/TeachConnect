import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  const refund = Number(b.refund);
  if (!/^[0-9a-f-]{36}$/i.test(b.disputeId || '') || !Number.isInteger(refund) || refund < 0) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  const db = createAdminClient();
  const { error } = await db.rpc('resolve_dispute', { p_dispute: b.disputeId, p_refund: refund, p_resolution: String(b.resolution || '').slice(0, 1000) });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await db.from('audit_logs').insert({ actor_id: admin.id, action: 'DISPUTE_RESOLVED', entity: 'disputes', entity_id: b.disputeId, details: { refund } });
  return NextResponse.json({ ok: true });
}

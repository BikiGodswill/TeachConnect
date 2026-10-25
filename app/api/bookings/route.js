import { NextResponse } from 'next/server';
import { createAuthClient } from '@/lib/supabase/auth-server';

const UUID = /^[0-9a-f-]{36}$/i;
const METHODS = ['TEACHER_CONNECT', 'CASH', 'MOBILE_MONEY_DIRECT', 'BANK_TRANSFER', 'OTHER'];

export async function POST(req) {
  const db = createAuthClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });

  let b;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }

  const errors = [];
  if (!UUID.test(b.teacherId || '')) errors.push('teacher');
  if (!UUID.test(b.subjectId || '')) errors.push('subject');
  if (!['ONLINE', 'PHYSICAL'].includes(b.lessonType)) errors.push('lesson type');
  const dates = Array.isArray(b.dates) ? b.dates : b.date ? [b.date] : [];
  if (!dates.length || dates.length > 40 || !dates.every((d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d))) errors.push('dates');
  if (b.childId && !UUID.test(b.childId)) errors.push('child');
  if (b.packageId && !UUID.test(b.packageId)) errors.push('package');
  const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  if (!/^\d{2}:\d{2}$/.test(b.startTime || '')) errors.push('time');
  if (!Number.isInteger(b.duration) || b.duration < 15 || b.duration > 480) errors.push('duration');
  if (!METHODS.includes(b.paymentMethod)) errors.push('payment method');
  if (errors.length) return NextResponse.json({ error: `Invalid: ${errors.join(', ')}.` }, { status: 400 });

  // Price, discount, overlap, role, child ownership and availability rules are enforced inside the database.
  const { data, error } = await db.rpc('create_lessons', {
    p_teacher: b.teacherId, p_subject: b.subjectId, p_type: b.lessonType, p_dates: dates,
    p_start: b.startTime, p_duration: b.duration, p_location: b.location ?? null,
    p_lat: num(b.lat), p_lng: num(b.lng), p_notes: (b.notes || '').slice(0, 500), p_method: b.paymentMethod,
    p_child: b.childId || null, p_package: b.packageId || null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ids: data.ids, skipped: data.skipped, seriesId: data.seriesId }, { status: 201 });
}

import { NextResponse } from 'next/server';
import { createAuthClient } from '@/lib/supabase/auth-server';

// action -> { who, from[], to }. The database trigger enforces the same machine again.
const ACTIONS = {
  accept: { who: 'teacher', from: ['REQUESTED'], to: 'ACCEPTED' },
  reject: { who: 'teacher', from: ['REQUESTED'], to: 'REJECTED' },
  confirm: { who: 'teacher', from: ['ACCEPTED'], to: 'CONFIRMED', offPlatformOnly: true },
  start: { who: 'teacher', from: ['CONFIRMED', 'ARRIVED'], to: 'IN_PROGRESS' },
  complete: { who: 'teacher', from: ['IN_PROGRESS'], to: 'COMPLETED' },
  onway: { who: 'teacher', from: ['CONFIRMED'], to: 'TEACHER_ARRIVING', physicalOnly: true },
  arrived: { who: 'teacher', from: ['TEACHER_ARRIVING'], to: 'ARRIVED', physicalOnly: true },
  cancel: { who: 'student', from: ['REQUESTED', 'ACCEPTED', 'CONFIRMED', 'TEACHER_ARRIVING'], to: 'CANCELLED' },
};

export async function POST(req, { params }) {
  const db = createAuthClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });

  const { action } = await req.json().catch(() => ({}));
  const rule = ACTIONS[action];
  if (!rule) return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });

  const { data: b } = await db.from('booking_details').select('id,teacher_id,student_id,status,lesson_type,payment_method,payment_status').eq('id', params.id).maybeSingle();
  if (!b) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });

  const isTeacher = b.teacher_id === user.id;
  const isStudent = b.student_id === user.id;
  if ((rule.who === 'teacher' && !isTeacher) || (rule.who === 'student' && !isStudent)) {
    return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  }
  if (!rule.from.includes(b.status)) return NextResponse.json({ error: `Cannot ${action} a ${b.status.toLowerCase()} booking.` }, { status: 409 });
  if (rule.offPlatformOnly && b.payment_method === 'TEACHER_CONNECT') {
    return NextResponse.json({ error: 'In-app bookings are confirmed automatically once the student pays.' }, { status: 409 });
  }

  if (rule.physicalOnly && b.lesson_type !== 'PHYSICAL') return NextResponse.json({ error: 'This only applies to in-person lessons.' }, { status: 409 });

  // compare-and-set on the current status to avoid races
  const { data, error } = await db.from('bookings').update({ status: rule.to }).eq('id', b.id).eq('status', b.status).select('id');
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data?.length) return NextResponse.json({ error: 'The booking changed. Please refresh.' }, { status: 409 });
  return NextResponse.json({ ok: true, status: rule.to });
}

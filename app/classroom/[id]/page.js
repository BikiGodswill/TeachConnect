import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/supabase/auth-server';
import { fmtDate, fmtTime } from '@/lib/format';

export const metadata = { title: 'Classroom — Teacher Connect' };

// :id is the BOOKING id. The room name comes from the database and is only given to the two parties.
export default async function Classroom({ params }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const { db, user, profile } = await getSessionUser();
  if (!user) redirect(`/login?next=/classroom/${params.id}`);
  const { data: b } = await db.from('booking_details').select('id,subject_name,scheduled_date,start_time,lesson_type,status').eq('id', params.id).maybeSingle();
  if (!b) notFound();
  const back = profile?.role === 'TEACHER' ? '/teacher/schedule' : profile?.role === 'PARENT' ? '/parent/bookings' : '/student/bookings';
  const { data: room, error } = await db.rpc('lesson_room', { p_booking: b.id });
  const domain = (process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si').replace(/[^a-z0-9.-]/gi, '');
  const name = encodeURIComponent((profile?.full_name || 'Guest').slice(0, 40));
  return (
    <main className="min-h-screen bg-sky-50 p-5">
      <div className="mx-auto max-w-5xl space-y-4">
        <Link href={back} className="text-sm font-bold text-teal-600">← Back to my lessons</Link>
        <div className="card p-5">
          <h1 className="text-xl font-extrabold">{b.subject_name} classroom</h1>
          <p className="text-sm text-ink-600">{fmtDate(b.scheduled_date)} · {fmtTime(b.start_time)}</p>
        </div>
        {error || !room ? (
          <div className="card p-8 text-center text-sm text-ink-600">{b.lesson_type !== 'ONLINE' ? 'This is an in-person lesson, so there is no online classroom.' : 'The classroom opens once the lesson is confirmed (payment received).'}</div>
        ) : (
          <iframe title="Video classroom" allow="camera; microphone; fullscreen; display-capture" className="h-[75vh] w-full rounded-xl border-0 bg-black shadow-float"
            src={`https://${domain}/${room}#userInfo.displayName="${name}"&config.prejoinPageEnabled=true`} />
        )}
      </div>
    </main>
  );
}

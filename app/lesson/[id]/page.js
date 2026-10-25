import { notFound, redirect } from 'next/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import LessonLive from '@/components/lesson/LessonLive';
import { getSessionUser } from '@/lib/supabase/auth-server';

export const metadata = { title: 'Your lesson — Teacher Connect' };

export default async function LessonPage({ params }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const { db, user, profile } = await getSessionUser();
  if (!user) redirect(`/login?next=/lesson/${params.id}`);
  const { data: b } = await db.from('booking_details').select('*').eq('id', params.id).maybeSingle();
  if (!b) notFound();
  const isTeacher = b.teacher_id === user.id;
  // exact lesson coordinates are readable only by the booking's own parties (RLS)
  const { data: raw } = await db.from('bookings').select('latitude,longitude').eq('id', params.id).maybeSingle();
  const { data: ll } = await db.from('lesson_locations').select('latitude,longitude,updated_at').eq('booking_id', params.id).maybeSingle();
  const target = raw?.latitude != null ? { lat: raw.latitude, lng: raw.longitude } : null;
  const back = isTeacher ? '/teacher/schedule' : profile?.role === 'PARENT' ? '/parent/bookings' : '/student/bookings';
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-sky-50 px-5 py-8">
        <LessonLive b={b} isTeacher={isTeacher} target={target} initialPos={ll ? { lat: ll.latitude, lng: ll.longitude, at: ll.updated_at } : null}
          back={back} emergency={process.env.NEXT_PUBLIC_EMERGENCY_NUMBER || ''} />
      </main>
    </>
  );
}

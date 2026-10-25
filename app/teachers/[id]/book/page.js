import { notFound, redirect } from 'next/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import BookingWizard from '@/components/bookings/BookingWizard';
import { createPublicClient } from '@/lib/supabase/server';
import { getSessionUser, homeForRole } from '@/lib/supabase/auth-server';

export const metadata = { title: 'Book a lesson — Teacher Connect' };

export default async function BookPage({ params }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const { db: mine, user, profile } = await getSessionUser();
  if (!user) redirect(`/login?next=/teachers/${params.id}/book`);
  if (!['STUDENT', 'PARENT'].includes(profile?.role)) redirect(homeForRole(profile?.role));

  const db = createPublicClient();
  const isParent = profile?.role === 'PARENT';
  const [{ data: teacher }, { data: subs }, { data: avail }, { data: packages }, { data: kids }] = await Promise.all([
    db.from('teacher_cards').select('id,full_name,hourly_rate,online_rate,physical_rate,currency,offers_online,offers_physical,city').eq('id', params.id).maybeSingle(),
    db.from('teacher_subjects').select('subject_id, subjects(id,name)').eq('teacher_id', params.id),
    db.from('teacher_availability').select('day_of_week,start_time,end_time').eq('teacher_id', params.id),
    db.from('lesson_packages').select('id,title,lessons_count,lesson_minutes,discount_percent').eq('teacher_id', params.id).eq('is_active', true).order('lessons_count'),
    isParent ? mine.from('children').select('id,full_name').eq('parent_id', user.id).order('full_name') : Promise.resolve({ data: [] }),
  ]);
  if (!teacher) notFound();
  const subjects = (subs || []).map((s) => s.subjects).filter(Boolean);

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-sky-50 px-5 py-10">
        <BookingWizard teacher={teacher} subjects={subjects} availability={avail || []}
          packages={packages || []} kids={kids || []} isParent={isParent} after={isParent ? '/parent/bookings' : '/student/bookings'} />
      </main>
    </>
  );
}

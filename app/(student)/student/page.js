import Link from 'next/link';
import { getSessionUser } from '@/lib/supabase/auth-server';
import { money, fmtDate, fmtTime } from '@/lib/format';
import TeacherCard from '@/components/teachers/TeacherCard';

export const metadata = { title: 'Dashboard — Teacher Connect' };

export default async function StudentHome() {
  const { db, user, profile } = await getSessionUser();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: upcoming }, { data: active }, { data: favs }, { data: recommended }] = await Promise.all([
    db.from('booking_details').select('*').eq('student_id', user.id).in('status', ['CONFIRMED', 'ACCEPTED']).gte('scheduled_date', today).order('scheduled_date').order('start_time').limit(1),
    db.from('booking_details').select('id,status').eq('student_id', user.id).in('status', ['REQUESTED', 'ACCEPTED', 'CONFIRMED', 'IN_PROGRESS']),
    db.from('favorites').select('teacher_id').eq('student_id', user.id),
    db.from('teacher_cards').select('*').order('rating_avg', { ascending: false }).limit(3),
  ]);
  const next = upcoming?.[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold">Welcome back, {(profile?.full_name || 'there').split(' ')[0]} 👋</h1>
        <p className="mt-1 text-ink-600">Here is what is happening with your learning.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="card p-6 md:col-span-2">
          <p className="text-xs font-bold uppercase text-teal-600">Upcoming lesson</p>
          {next ? (
            <>
              <h2 className="mt-2 text-xl font-bold">{next.subject_name} with {next.teacher_name}</h2>
              <p className="mt-1 text-ink-600">{fmtDate(next.scheduled_date)} · {fmtTime(next.start_time)} · {next.lesson_type === 'ONLINE' ? 'Online' : next.location_text}</p>
              <p className="mt-3 font-heading font-extrabold">{money(next.price, next.currency)}</p>
            </>
          ) : (
            <>
              <p className="mt-2 text-ink-600">No upcoming lessons yet.</p>
              <Link href="/teachers" className="btn-teal mt-4 h-11">Find a Teacher</Link>
            </>
          )}
        </div>
        <div className="grid gap-5">
          <Stat label="Active bookings" value={active?.length || 0} href="/student/bookings" />
          <Stat label="Favorite teachers" value={favs?.length || 0} href="/student/favorites" />
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Recommended teachers</h2><Link href="/teachers" className="text-sm font-bold text-teal-600">See all</Link></div>
        {recommended?.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{recommended.map((t) => <TeacherCard key={t.id} t={t} />)}</div>
          : <p className="text-ink-600">Teachers will appear here soon.</p>}
      </section>
    </div>
  );
}

function Stat({ label, value, href }) {
  return (
    <Link href={href} className="card flex items-center justify-between p-6">
      <span className="text-sm font-semibold text-ink-600">{label}</span>
      <span className="font-heading text-3xl font-extrabold">{value}</span>
    </Link>
  );
}

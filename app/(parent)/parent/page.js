import Link from 'next/link';
import { getSessionUser } from '@/lib/supabase/auth-server';
import { fmtDate, fmtTime, money } from '@/lib/format';
import TeacherCard from '@/components/teachers/TeacherCard';

export const metadata = { title: 'Parent dashboard — Teacher Connect' };

export default async function ParentHome() {
  const { db, user, profile } = await getSessionUser();
  const today = new Date().toISOString().slice(0, 10);
  const [{ data: kids }, { data: upcoming }, { data: active }, { data: rec }] = await Promise.all([
    db.from('children').select('id,full_name,academic_level').eq('parent_id', user.id).order('full_name'),
    db.from('booking_details').select('*').eq('student_id', user.id).in('status', ['CONFIRMED', 'ACCEPTED']).gte('scheduled_date', today).order('scheduled_date').order('start_time').limit(3),
    db.from('booking_details').select('id').eq('student_id', user.id).in('status', ['REQUESTED', 'ACCEPTED', 'CONFIRMED', 'TEACHER_ARRIVING', 'ARRIVED', 'IN_PROGRESS']),
    db.from('teacher_cards').select('*').order('rating_avg', { ascending: false }).limit(3),
  ]);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold">Hello, {(profile?.full_name || 'there').split(' ')[0]} 👋</h1>
        <p className="mt-1 text-ink-600">Manage your children&apos;s lessons in one place.</p>
      </div>

      {!kids?.length && (
        <div className="card flex flex-wrap items-center justify-between gap-4 bg-brandyellow-100/60 p-6">
          <div><h2 className="font-bold">Start by adding your child</h2><p className="text-sm text-ink-600">You need a child profile before booking a lesson.</p></div>
          <Link href="/parent/children" className="btn-teal h-11">Add a child</Link>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        <div className="card p-6 md:col-span-2">
          <p className="text-xs font-bold uppercase text-teal-600">Upcoming lessons</p>
          {upcoming?.length ? (
            <ul className="mt-3 space-y-3">
              {upcoming.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 border-b border-ink-200 pb-3 last:border-0">
                  <div>
                    <p className="font-bold">{b.subject_name}{b.child_name && <span className="font-medium text-ink-600"> · {b.child_name}</span>}</p>
                    <p className="text-sm text-ink-600">{b.teacher_name} · {fmtDate(b.scheduled_date)} · {fmtTime(b.start_time)}</p>
                  </div>
                  <span className="font-heading font-extrabold">{money(b.price, b.currency)}</span>
                </li>
              ))}
            </ul>
          ) : (<><p className="mt-2 text-ink-600">No upcoming lessons yet.</p><Link href="/teachers" className="btn-teal mt-4 h-11">Find a Teacher</Link></>)}
        </div>
        <div className="grid gap-5">
          <Link href="/parent/bookings" className="card flex items-center justify-between p-6"><span className="text-sm font-semibold text-ink-600">Active bookings</span><span className="font-heading text-3xl font-extrabold">{active?.length || 0}</span></Link>
          <Link href="/parent/instant" className="card flex items-center justify-between bg-navy-gradient p-6 text-white"><span className="text-sm font-bold">Request a teacher now</span><span aria-hidden>⚡</span></Link>
        </div>
      </div>

      {kids?.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold">Your children</h2>
          <div className="flex flex-wrap gap-3">
            {kids.map((k) => <span key={k.id} className="rounded-full bg-lavender-100 px-4 py-2 text-sm font-semibold">{k.full_name}{k.academic_level && ` · ${k.academic_level}`}</span>)}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Recommended teachers</h2><Link href="/teachers" className="text-sm font-bold text-teal-600">See all</Link></div>
        {rec?.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{rec.map((t) => <TeacherCard key={t.id} t={t} />)}</div> : <p className="text-ink-600">Teachers will appear here soon.</p>}
      </section>
    </div>
  );
}

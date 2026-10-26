import Link from 'next/link';
import { getSessionUser } from '@/lib/supabase/auth-server';
import { money, fmtDate, fmtTime } from '@/lib/format';
import EarningsChart from '@/components/wallet/EarningsChart';

export const metadata = { title: 'Teacher dashboard — Teacher Connect' };

export default async function TeacherHome() {
  const { db, user, profile } = await getSessionUser();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: tp }, { data: wallet }, { data: pending }, { data: todays }, { data: upcoming }, { data: series }] = await Promise.all([
    db.from('teacher_profiles').select('rating_avg,rating_count,verification,completed_lessons,hourly_rate,online_rate,physical_rate,bio').eq('id', user.id).maybeSingle(),
    db.from('wallets').select('*').eq('teacher_id', user.id).maybeSingle(),
    db.from('booking_details').select('id').eq('teacher_id', user.id).eq('status', 'REQUESTED'),
    db.from('booking_details').select('id').eq('teacher_id', user.id).eq('scheduled_date', today).in('status', ['CONFIRMED', 'IN_PROGRESS', 'ACCEPTED']),
    db.from('booking_details').select('*').eq('teacher_id', user.id).in('status', ['CONFIRMED', 'ACCEPTED']).gte('scheduled_date', today).order('scheduled_date').order('start_time').limit(3),
    db.rpc('teacher_earnings_by_day', { p_days: 14 }),
  ]);

  const checklist = [
    ['Add a short biography', !!tp?.bio], ['Set your prices', tp?.hourly_rate != null || tp?.online_rate != null || tp?.physical_rate != null],
    ['Verify your identity', ['PENDING', 'UNDER_REVIEW', 'VERIFIED'].includes(tp?.verification)],
  ];
  const incomplete = checklist.filter(([, done]) => !done);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold">Hello, {(profile?.full_name || 'there').split(' ')[0]}</h1>
        <p className="mt-1 text-ink-600">Verification: <b>{(tp?.verification || 'NOT_SUBMITTED').replace('_', ' ')}</b></p>
      </div>

      {incomplete.length > 0 && (
        <div className="rounded-xl bg-brandyellow-100 p-5">
          <p className="font-bold">Finish your profile to start getting bookings</p>
          <ul className="mt-2 list-disc pl-5 text-sm">{incomplete.map(([l]) => <li key={l}>{l}</li>)}</ul>
          <Link href="/teacher/profile" className="btn-primary mt-4 h-10 px-5 text-xs">Complete profile</Link>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <Stat label="Today's lessons" value={todays?.length || 0} href="/teacher/schedule" />
        <Stat label="Pending requests" value={pending?.length || 0} href="/teacher/requests" accent />
        <Stat label="Rating" value={`${Number(tp?.rating_avg || 0).toFixed(1)} (${tp?.rating_count || 0})`} href="/teacher/reviews" />
        <Stat label="Total earnings" value={money(wallet?.total_earnings)} href="/teacher/wallet" />
        <Stat label="Available balance" value={money(wallet?.available_balance)} href="/teacher/wallet" />
        <Stat label="Completed lessons" value={tp?.completed_lessons || 0} href="/teacher/schedule" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="mb-4 text-lg font-bold">Earnings — last 14 days</h2>
          <EarningsChart data={series || []} />
          <Link href="/teacher/analytics" className="mt-3 inline-block text-sm font-bold text-teal-600">View full analytics →</Link>
        </section>
        <section className="card p-6">
          <h2 className="mb-4 text-lg font-bold">Upcoming lessons</h2>
          {upcoming?.length ? upcoming.map((b) => (
            <div key={b.id} className="flex items-center justify-between border-b border-ink-100 py-3 last:border-0">
              <div><p className="font-semibold">{b.subject_name} · {b.student_name}</p><p className="text-xs text-ink-600">{fmtDate(b.scheduled_date)} · {fmtTime(b.start_time)}</p></div>
              <span className="text-sm font-bold">{money(b.teacher_amount ?? b.price, b.currency)}</span>
            </div>
          )) : <p className="text-ink-600">No upcoming lessons.</p>}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, href, accent }) {
  return (
    <Link href={href} className={`card p-6 ${accent ? 'ring-2 ring-teal-500/30' : ''}`}>
      <p className="text-sm font-semibold text-ink-600">{label}</p>
      <p className="mt-2 font-heading text-2xl font-extrabold">{value}</p>
    </Link>
  );
}

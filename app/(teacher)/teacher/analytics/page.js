import { getSessionUser } from '@/lib/supabase/auth-server';
import { money } from '@/lib/format';

export const metadata = { title: 'Analytics — Teacher Connect' };

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default async function Analytics({ searchParams }) {
  const days = [30, 90, 180, 365].includes(Number(searchParams?.days)) ? Number(searchParams.days) : 90;
  const { db } = await getSessionUser();
  const { data, error } = await db.rpc('teacher_analytics', { p_days: days });
  if (error || !data) {
    return <div className="card mx-auto max-w-md p-10 text-center"><h1 className="text-xl font-bold">Analytics are unavailable right now</h1><p className="mt-2 text-sm text-ink-600">Please try again in a moment.</p></div>;
  }
  const t = data.totals || {};
  const total = (t.completed || 0) + (t.cancelled || 0);
  const completion = total ? Math.round(((t.completed || 0) / total) * 100) : null;
  const maxMonth = Math.max(1, ...data.months.map((m) => Number(m.earned)));
  const dow = Array.from({ length: 7 }, (_, i) => Number(data.weekdays.find((w) => w.dow === i)?.lessons || 0));
  const maxDow = Math.max(1, ...dow);
  const repeatRate = data.students.distinct ? Math.round((data.students.repeat / data.students.distinct) * 100) : null;

  const cards = [
    ['Completed lessons', t.completed ?? 0, 'bg-teal-100'],
    ['In-app earnings (net)', money(t.in_app_net), 'bg-navy-900 text-white'],
    ['Commission paid', money(t.commission), 'bg-brandyellow-100'],
    ['Paid outside the app', money(t.off_platform), 'bg-lavender-100'],
    ['Completion rate', completion == null ? '—' : `${completion}%`, 'bg-sky-100'],
    ['Repeat students', repeatRate == null ? '—' : `${repeatRate}%`, 'bg-peach-100'],
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold">Analytics</h1>
        <nav className="flex gap-2" aria-label="Period">
          {[30, 90, 180, 365].map((d) => (
            <a key={d} href={`/teacher/analytics?days=${d}`} className={`rounded-full px-4 py-2 text-xs font-bold ${d === days ? 'bg-navy-900 text-white' : 'bg-white shadow-card'}`}>{d === 365 ? '1 year' : `${d} days`}</a>
          ))}
        </nav>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, v, tone]) => (
          <div key={label} className={`rounded-lg p-5 shadow-card ${tone}`}><p className="text-xs font-bold opacity-70">{label}</p><p className="mt-2 font-heading text-2xl font-extrabold">{v}</p></div>
        ))}
      </div>
      {Number(t.in_dispute) > 0 && <p className="rounded-md bg-peach-100 p-4 text-sm font-semibold">{money(t.in_dispute)} is currently frozen in a dispute.</p>}
      <p className="text-xs text-ink-400">Earnings count in-app payments only, after the platform commission. Payments you recorded outside the app are shown separately and are not protected or paid out by Teacher Connect.</p>

      <section className="card p-6">
        <h2 className="mb-4 text-lg font-bold">In-app earnings by month</h2>
        <div className="flex h-48 items-end gap-3" role="img" aria-label="Monthly earnings bar chart">
          {data.months.map((m) => (
            <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-ink-600">{Number(m.earned) ? Number(m.earned).toLocaleString('en-US') : ''}</span>
              <div className="w-full rounded-t-md bg-brand-gradient transition-all" style={{ height: `${Math.max(3, (Number(m.earned) / maxMonth) * 140)}px` }} />
              <span className="text-xs font-semibold">{m.month}</span>
              <span className="text-[10px] text-ink-400">{m.lessons} lessons</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="mb-4 text-lg font-bold">By subject</h2>
          {data.subjects.length ? (
            <ul className="space-y-3">
              {data.subjects.map((s) => (
                <li key={s.subject}>
                  <div className="flex justify-between text-sm"><b>{s.subject}</b><span className="text-ink-600">{s.lessons} lessons · {money(s.earned)}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-sky-100"><div className="h-2 rounded-full bg-teal-500" style={{ width: `${(s.lessons / data.subjects[0].lessons) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-ink-600">Complete a lesson to see your subjects here.</p>}
        </section>
        <section className="card p-6">
          <h2 className="mb-4 text-lg font-bold">Busiest days</h2>
          <div className="flex h-40 items-end gap-2" role="img" aria-label="Lessons by weekday">
            {dow.map((n, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-bold">{n || ''}</span>
                <div className="w-full rounded-t-md bg-navy-700" style={{ height: `${Math.max(3, (n / maxDow) * 100)}px` }} />
                <span className="text-xs font-semibold">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

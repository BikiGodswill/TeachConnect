import { fmtDate } from '@/lib/format';

const Bar = ({ pct, tone = 'bg-brand-gradient' }) => (
  <div className="h-2 rounded-full bg-sky-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
    <div className={`h-2 rounded-full ${tone}`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
  </div>
);

// Pure display component: works in server and client trees.
export default function ProgressReport({ r }) {
  if (!r) return null;
  const tests = r.tests || [];
  const avg = tests.length ? Math.round(tests.reduce((s, t) => s + Number(t.percent || 0), 0) / tests.length) : null;
  const stat = (label, v, tone) => (
    <div className={`rounded-lg p-4 shadow-card ${tone}`}><p className="text-xs font-bold opacity-70">{label}</p><p className="mt-1 font-heading text-2xl font-extrabold">{v}</p></div>
  );
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stat('Lessons completed', r.lessons?.completed ?? 0, 'bg-teal-100')}
        {stat('Average test score', avg == null ? '—' : `${avg}%`, 'bg-lavender-100')}
        {stat('Homework graded', `${r.assignments?.graded ?? 0}/${r.assignments?.total ?? 0}`, 'bg-sky-100')}
        {stat('Average homework mark', r.assignments?.avg_percent == null ? '—' : `${r.assignments.avg_percent}%`, 'bg-brandyellow-100')}
      </div>
      {r.improvement != null && (
        <p className={`rounded-md p-3 text-sm font-semibold ${Number(r.improvement) >= 0 ? 'bg-teal-100' : 'bg-peach-100'}`}>
          {Number(r.improvement) >= 0 ? '📈 Improving' : '📉 Scores dipped'}: recent tests are {Math.abs(Number(r.improvement))} points {Number(r.improvement) >= 0 ? 'higher' : 'lower'} than earlier ones.
        </p>
      )}
      {(r.assignments?.late ?? 0) > 0 && <p className="text-xs text-ink-600">{r.assignments.late} piece{r.assignments.late > 1 ? 's' : ''} of work handed in late.</p>}

      {tests.length > 0 && (
        <section className="card p-5">
          <h3 className="mb-3 font-bold">Test scores</h3>
          <div className="flex h-32 items-end gap-2" role="img" aria-label="Test scores over time">
            {tests.map((t, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1" title={`${t.title}: ${t.percent}%`}>
                <span className="text-[10px] font-bold">{t.percent}%</span>
                <div className="w-full rounded-t bg-brand-gradient" style={{ height: `${Math.max(4, Number(t.percent) * 0.8)}px` }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {(r.plans || []).map((p) => (
        <section key={p.id} className="card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-bold">{p.title}</h3>
            <span className="text-xs font-bold text-teal-600">{p.total ? Math.round((p.done / p.total) * 100) : 0}% · {p.done}/{p.total} objectives</span>
          </div>
          {p.goal && <p className="text-sm text-ink-600">Goal: {p.goal}</p>}
          {p.target && <p className="text-xs text-ink-400">Target date {fmtDate(p.target)}</p>}
          <div className="mt-3"><Bar pct={p.total ? (p.done / p.total) * 100 : 0} /></div>
          <ul className="mt-3 space-y-1 text-sm">
            {p.objectives.map((o) => (
              <li key={o.id} className="flex items-start gap-2">
                <span aria-hidden>{o.status === 'DONE' ? '✅' : o.status === 'IN_PROGRESS' ? '🔄' : '⬜'}</span>
                <span className={o.status === 'DONE' ? 'text-ink-400 line-through' : ''}>{o.title}{o.note && <em className="ml-2 text-xs text-ink-600">— {o.note}</em>}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {(r.notes || []).length > 0 && (
        <section className="card p-5">
          <h3 className="mb-3 font-bold">Teacher comments</h3>
          <ul className="space-y-4">
            {r.notes.map((n, i) => (
              <li key={i} className="border-l-4 border-teal-500 pl-3 text-sm">
                <p className="text-xs text-ink-400">{n.teacher} · {new Date(n.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}{n.understanding && ` · understanding ${n.understanding}/5`}</p>
                {n.topics && <p><b>Covered:</b> {n.topics}</p>}
                {n.strengths && <p><b>Strengths:</b> {n.strengths}</p>}
                {n.weaknesses && <p><b>To work on:</b> {n.weaknesses}</p>}
                {n.comment && <p className="text-ink-600">{n.comment}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

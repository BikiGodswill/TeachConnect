import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSessionUser } from '@/lib/supabase/auth-server';
import { fmtDateTime } from '@/lib/format';

export const metadata = { title: 'Test results — Teacher Connect' };

export default async function TestResults({ params }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const { db, user } = await getSessionUser();
  const { data: t } = await db.from('tests').select('id,title').eq('id', params.id).eq('teacher_id', user.id).maybeSingle();
  if (!t) notFound();
  const { data: rows } = await db.rpc('test_results', { p_test: t.id });
  const done = (rows || []).filter((r) => r.status === 'SUBMITTED');
  const avg = done.length ? Math.round(done.reduce((s, r) => s + (r.max_score ? (r.score / r.max_score) * 100 : 0), 0) / done.length) : null;
  return (
    <div className="max-w-3xl space-y-6">
      <div><Link href="/teacher/tests" className="text-sm font-bold text-teal-600">← Tests</Link><h1 className="mt-2 text-3xl font-extrabold">{t.title}</h1>
        <p className="text-sm text-ink-600">{done.length} of {rows?.length || 0} submitted{avg != null && ` · average ${avg}%`}</p></div>
      {rows?.length ? rows.map((r) => (
        <div key={r.attempt_id} className="card flex items-center justify-between gap-3 p-4">
          <div><p className="font-bold">{r.learner_name}</p><p className="text-xs text-ink-600">{r.status === 'SUBMITTED' ? `Submitted ${fmtDateTime(r.submitted_at)}` : r.status === 'IN_PROGRESS' ? 'In progress' : r.due_at ? `Due ${fmtDateTime(r.due_at)}` : 'Not started'}</p></div>
          {r.status === 'SUBMITTED' ? <Link href={`/learning/test/${r.attempt_id}`} className="font-bold text-teal-600 underline">{r.score}/{r.max_score} · review</Link> : <span className="text-xs text-ink-400">—</span>}
        </div>
      )) : <div className="card p-8 text-center text-sm text-ink-600">Not assigned to anyone yet. Open a student from <Link className="font-bold underline" href="/teacher/students">My students</Link> to assign it.</div>}
    </div>
  );
}

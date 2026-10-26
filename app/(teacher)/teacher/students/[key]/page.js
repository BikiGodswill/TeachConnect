import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSessionUser } from '@/lib/supabase/auth-server';
import { parseLearnerKey } from '@/lib/learner';
import { fmtDateTime } from '@/lib/format';
import ProgressReport from '@/components/learning/ProgressReport';
import LearnerActions from '@/components/learning/LearnerActions';

export const metadata = { title: 'Student — Teacher Connect' };

export default async function StudentPage({ params }) {
  const k = parseLearnerKey(decodeURIComponent(params.key));
  if (!k) notFound();
  const { db, user } = await getSessionUser();
  const [{ data: report, error }, { data: tests }] = await Promise.all([
    db.rpc('progress_report', { p_student: k.studentId, p_child: k.childId }),
    db.from('tests').select('id,title').eq('teacher_id', user.id).order('created_at', { ascending: false }),
  ]);
  if (error || !report) notFound();
  const same = (q) => (k.childId ? q.eq('child_id', k.childId) : q.is('child_id', null)).eq('student_id', k.studentId);
  const [{ data: asg }, { data: attempts }, { data: certs }] = await Promise.all([
    same(db.from('assignments').select('id,title,due_at,assignment_submissions(submitted_at,score,graded_at)').eq('teacher_id', user.id)).order('created_at', { ascending: false }).limit(20),
    same(db.from('test_attempts').select('id,status,score,max_score,due_at,tests(title,teacher_id)')).order('assigned_at', { ascending: false }).limit(20),
    same(db.from('certificates').select('id,title,code,revoked,issued_at').eq('teacher_id', user.id)).order('issued_at', { ascending: false }),
  ]);
  const myAttempts = (attempts || []).filter((a) => a.tests?.teacher_id === user.id);

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <Link href="/teacher/students" className="text-sm font-bold text-teal-600">← My students</Link>
        <h1 className="mt-2 text-3xl font-extrabold">{report.learner}</h1>
      </div>
      <LearnerActions studentId={k.studentId} childId={k.childId} tests={tests || []} />
      <ProgressReport r={report} />

      <section className="card p-5">
        <h2 className="mb-3 font-bold">Assignments</h2>
        {asg?.length ? <ul className="divide-y divide-ink-200 text-sm">{asg.map((a) => {
          const s = a.assignment_submissions?.[0] || a.assignment_submissions;
          const state = s?.graded_at ? `Graded ${s.score}` : s?.submitted_at ? 'Submitted — needs grading' : a.due_at ? `Due ${fmtDateTime(a.due_at)}` : 'Not submitted';
          return <li key={a.id} className="flex justify-between gap-3 py-2"><Link className="font-semibold underline" href={`/learning/assignment/${a.id}`}>{a.title}</Link><span className="text-ink-600">{state}</span></li>;
        })}</ul> : <p className="text-sm text-ink-600">No assignments yet.</p>}
      </section>
      <section className="card p-5">
        <h2 className="mb-3 font-bold">Tests</h2>
        {myAttempts.length ? <ul className="divide-y divide-ink-200 text-sm">{myAttempts.map((a) => (
          <li key={a.id} className="flex justify-between gap-3 py-2"><span className="font-semibold">{a.tests?.title}</span>
            {a.status === 'SUBMITTED' ? <Link className="underline" href={`/learning/test/${a.id}`}>{a.score}/{a.max_score} · review</Link> : <span className="text-ink-600">{a.status === 'IN_PROGRESS' ? 'In progress' : 'Not started'}</span>}</li>
        ))}</ul> : <p className="text-sm text-ink-600">No tests assigned yet.</p>}
      </section>
      <section className="card p-5">
        <h2 className="mb-3 font-bold">Certificates</h2>
        {certs?.length ? <ul className="divide-y divide-ink-200 text-sm">{certs.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-2"><Link className="font-semibold underline" href={`/learning/certificate/${c.id}`}>{c.title}</Link><span className="text-ink-600">{c.code}{c.revoked && ' · revoked'}</span></li>
        ))}</ul> : <p className="text-sm text-ink-600">None issued.</p>}
      </section>
    </div>
  );
}

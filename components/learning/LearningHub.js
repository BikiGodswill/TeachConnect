import Link from 'next/link';
import AiAssistant from '@/components/learning/AiAssistant';
import ProgressReport from '@/components/learning/ProgressReport';
import { fmtDateTime } from '@/lib/format';

// Server component shared by /student/learning and /parent/learning.
export default async function LearningHub({ db, user, role, childId, kids = [] }) {
  const same = (q) => (childId ? q.eq('child_id', childId) : q.is('child_id', null)).eq('student_id', user.id);
  const [{ data: report }, { data: asg }, { data: attempts }, { data: certs }] = await Promise.all([
    db.rpc('progress_report', { p_student: user.id, p_child: childId || null }),
    same(db.from('assignments').select('id,title,due_at,max_score,teacher_id,assignment_submissions(submitted_at,score,graded_at)')).order('created_at', { ascending: false }).limit(30),
    same(db.from('test_attempts').select('id,status,score,max_score,due_at,tests(title)')).order('assigned_at', { ascending: false }).limit(30),
    same(db.from('certificates').select('id,title,code,revoked,issued_at')).order('issued_at', { ascending: false }),
  ]);
  const aiOn = !!process.env.ANTHROPIC_API_KEY && !!process.env.AI_MODEL;
  const home = role === 'PARENT' ? '/parent/learning' : '/student/learning';
  const todoAsg = (asg || []).filter((a) => !(Array.isArray(a.assignment_submissions) ? a.assignment_submissions[0] : a.assignment_submissions));
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold">Learning</h1>
        <p className="mt-1 text-sm text-ink-600">Homework, tests, learning plans and progress from your teachers.</p>
      </div>

      {role === 'PARENT' && (
        kids.length ? (
          <nav className="flex flex-wrap gap-2" aria-label="Choose a child">
            {kids.map((k) => <Link key={k.id} href={`${home}?c=${k.id}`} className={`rounded-full px-4 py-2 text-sm font-bold ${childId === k.id ? 'bg-navy-900 text-white' : 'bg-white shadow-card'}`}>{k.full_name}</Link>)}
          </nav>
        ) : <div className="card p-6 text-sm">Add a child first: <Link className="font-bold text-teal-600 underline" href="/parent/children">Add a child</Link></div>
      )}

      {(role !== 'PARENT' || childId) && (<>
        {report && <ProgressReport r={report} />}
        <section className="card p-5">
          <h2 className="mb-3 font-bold">Homework {todoAsg.length > 0 && <span className="ml-2 rounded-full bg-brandyellow-100 px-2 py-0.5 text-xs">{todoAsg.length} to do</span>}</h2>
          {asg?.length ? <ul className="divide-y divide-ink-200 text-sm">{asg.map((a) => {
            const s = Array.isArray(a.assignment_submissions) ? a.assignment_submissions[0] : a.assignment_submissions;
            return <li key={a.id} className="flex justify-between gap-3 py-2"><Link className="font-semibold underline" href={`/learning/assignment/${a.id}`}>{a.title}</Link>
              <span className="text-ink-600">{s?.graded_at ? `${s.score}/${a.max_score}` : s ? 'Submitted' : a.due_at ? `Due ${fmtDateTime(a.due_at)}` : 'To do'}</span></li>;
          })}</ul> : <p className="text-sm text-ink-600">No homework yet.</p>}
        </section>
        <section className="card p-5">
          <h2 className="mb-3 font-bold">Tests &amp; quizzes</h2>
          {attempts?.length ? <ul className="divide-y divide-ink-200 text-sm">{attempts.map((a) => (
            <li key={a.id} className="flex justify-between gap-3 py-2"><Link className="font-semibold underline" href={`/learning/test/${a.id}`}>{a.tests?.title}</Link>
              <span className="text-ink-600">{a.status === 'SUBMITTED' ? `${a.score}/${a.max_score}` : a.status === 'IN_PROGRESS' ? 'Continue' : a.due_at ? `Due ${fmtDateTime(a.due_at)}` : 'Start'}</span></li>
          ))}</ul> : <p className="text-sm text-ink-600">No tests yet.</p>}
        </section>
        <section className="card p-5">
          <h2 className="mb-3 font-bold">Certificates</h2>
          {certs?.length ? <ul className="divide-y divide-ink-200 text-sm">{certs.map((c) => (
            <li key={c.id} className="flex justify-between gap-3 py-2"><Link className="font-semibold underline" href={`/learning/certificate/${c.id}`}>{c.title}</Link><span className="text-ink-600">{c.revoked ? 'Revoked' : new Date(c.issued_at).toLocaleDateString('en-GB')}</span></li>
          ))}</ul> : <p className="text-sm text-ink-600">Certificates your teachers issue will appear here.</p>}
        </section>
      </>)}
      <AiAssistant role="student" enabled={aiOn} />
    </div>
  );
}

import Link from 'next/link';
import { getSessionUser } from '@/lib/supabase/auth-server';
import { fmtDateTime } from '@/lib/format';

export const metadata = { title: 'Assignments — Teacher Connect' };

export default async function TeacherAssignments() {
  const { db, user } = await getSessionUser();
  const { data } = await db.from('assignments').select('id,title,due_at,max_score,child_id,student_id,assignment_submissions(submitted_at,score,graded_at)').eq('teacher_id', user.id).order('created_at', { ascending: false }).limit(100);
  const rows = (data || []).map((a) => ({ ...a, s: Array.isArray(a.assignment_submissions) ? a.assignment_submissions[0] : a.assignment_submissions }));
  const needs = rows.filter((a) => a.s && !a.s.graded_at);
  const Row = ({ a }) => (
    <Link href={`/learning/assignment/${a.id}`} className="card flex items-center justify-between gap-3 p-4">
      <div><p className="font-bold">{a.title}</p><p className="text-xs text-ink-600">{a.due_at ? `Due ${fmtDateTime(a.due_at)}` : 'No deadline'}</p></div>
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${a.s?.graded_at ? 'bg-teal-100' : a.s ? 'bg-brandyellow-100' : 'bg-sky-100'}`}>{a.s?.graded_at ? `${a.s.score}/${a.max_score}` : a.s ? 'Needs grading' : 'Waiting'}</span>
    </Link>
  );
  return (
    <div className="max-w-3xl space-y-6">
      <div><h1 className="text-3xl font-extrabold">Assignments</h1><p className="mt-1 text-sm text-ink-600">Set work from a student&apos;s page. <Link href="/teacher/students" className="font-bold text-teal-600 underline">Open my students</Link></p></div>
      {needs.length > 0 && <section className="space-y-3"><h2 className="font-bold">Needs grading ({needs.length})</h2>{needs.map((a) => <Row key={a.id} a={a} />)}</section>}
      <section className="space-y-3"><h2 className="font-bold">All assignments</h2>{rows.length ? rows.map((a) => <Row key={a.id} a={a} />) : <div className="card p-8 text-center text-sm text-ink-600">No assignments yet.</div>}</section>
    </div>
  );
}

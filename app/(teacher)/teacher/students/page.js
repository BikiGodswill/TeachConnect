import Link from 'next/link';
import { getSessionUser } from '@/lib/supabase/auth-server';
import { learnerKey } from '@/lib/learner';
import { fmtDate } from '@/lib/format';

export const metadata = { title: 'My students — Teacher Connect' };

export default async function Students() {
  const { db } = await getSessionUser();
  const { data } = await db.rpc('my_learners');
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">My students</h1>
        <p className="mt-1 text-sm text-ink-600">Open a student to write lesson notes, set work, assign tests, plan their learning and issue certificates.</p>
      </div>
      {data?.length ? (
        <div className="space-y-3">
          {data.map((l) => (
            <Link key={learnerKey(l.student_id, l.child_id)} href={`/teacher/students/${learnerKey(l.student_id, l.child_id)}`} className="card flex items-center justify-between p-5">
              <div><p className="font-bold">{l.learner_name}</p><p className="text-xs text-ink-600">{l.lessons_completed} lesson{l.lessons_completed === 1 ? '' : 's'} completed{l.last_lesson && ` · last ${fmtDate(l.last_lesson)}`}</p></div>
              <span aria-hidden className="text-teal-600">→</span>
            </Link>
          ))}
        </div>
      ) : <div className="card p-10 text-center text-sm text-ink-600">Students appear here once you accept a lesson request.</div>}
    </div>
  );
}

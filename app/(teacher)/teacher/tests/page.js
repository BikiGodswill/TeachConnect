import Link from 'next/link';
import { getSessionUser } from '@/lib/supabase/auth-server';
import TestBuilder from '@/components/learning/TestBuilder';

export const metadata = { title: 'Tests — Teacher Connect' };

export default async function TeacherTests() {
  const { db, user } = await getSessionUser();
  const { data } = await db.from('tests').select('id,title,time_limit_minutes,created_at').eq('teacher_id', user.id).order('created_at', { ascending: false });
  return (
    <div className="max-w-3xl space-y-6">
      <div><h1 className="text-3xl font-extrabold">Tests &amp; quizzes</h1><p className="mt-1 text-sm text-ink-600">Multiple-choice, true/false and short-answer questions are marked automatically. Assign a test from a student&apos;s page.</p></div>
      <TestBuilder />
      <section className="space-y-3">
        <h2 className="font-bold">Your tests</h2>
        {data?.length ? data.map((t) => (
          <Link key={t.id} href={`/teacher/tests/${t.id}`} className="card flex items-center justify-between p-4"><span className="font-bold">{t.title}</span><span className="text-xs text-ink-600">{t.time_limit_minutes ? `${t.time_limit_minutes} min` : 'Untimed'}</span></Link>
        )) : <div className="card p-8 text-center text-sm text-ink-600">No tests yet.</div>}
      </section>
    </div>
  );
}

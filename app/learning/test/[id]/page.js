import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import TestTaker from '@/components/learning/TestTaker';
import { getSessionUser } from '@/lib/supabase/auth-server';

export const metadata = { title: 'Test — Teacher Connect' };

const show = (v, q) => (q.kind === 'MCQ' ? (v == null ? '—' : q.options?.[v] ?? '—') : q.kind === 'TRUE_FALSE' ? (v == null ? '—' : v ? 'True' : 'False') : (v == null || v === '' ? '—' : String(v)));
const key = (a, q) => (q.kind === 'MCQ' ? q.options?.[a] : q.kind === 'TRUE_FALSE' ? (a ? 'True' : 'False') : (Array.isArray(a) ? a.join(' / ') : String(a)));

// :id is the test ATTEMPT id.
export default async function TestPage({ params }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const { db, user, profile } = await getSessionUser();
  if (!user) redirect(`/login?next=/learning/test/${params.id}`);
  const { data: at } = await db.from('test_attempts').select('id,status,student_id,tests(title,teacher_id)').eq('id', params.id).maybeSingle();
  if (!at) notFound();
  const isOwner = at.student_id === user.id;
  const back = !isOwner ? '/teacher/tests' : profile?.role === 'PARENT' ? '/parent/learning' : '/student/learning';

  let review = null;
  if (at.status === 'SUBMITTED') {
    const { data } = await db.rpc('test_review', { p_attempt: params.id });
    review = data;
  }
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-sky-50 px-5 py-8">
        <div className="mx-auto max-w-2xl space-y-5">
          <Link href={back} className="text-sm font-bold text-teal-600">← Back</Link>
          {review ? (
            <>
              <section className="card p-6 text-center">
                <h1 className="text-2xl font-extrabold">{review.title}</h1>
                <p className="text-xs text-ink-600">{review.learner}</p>
                <p className="mt-3 font-heading text-4xl font-extrabold text-teal-600">{review.score} / {review.max}</p>
                <p className="text-sm text-ink-600">{review.max ? Math.round((review.score / review.max) * 100) : 0}%</p>
              </section>
              {review.questions.map((q) => (
                <section key={q.id} className={`card space-y-1 border-l-4 p-5 ${q.correct ? 'border-teal-500' : 'border-danger'}`}>
                  <p className="font-semibold">{q.position}. {q.prompt}</p>
                  <p className="text-sm">Answer: <b>{show(q.given, q)}</b> {q.correct ? '✅' : '❌'}</p>
                  {!q.correct && <p className="text-sm text-ink-600">Correct answer: <b>{key(q.answer, q)}</b></p>}
                </section>
              ))}
            </>
          ) : isOwner ? (
            <TestTaker attemptId={at.id} title={at.tests?.title} resuming={at.status === 'IN_PROGRESS'} />
          ) : <p className="card p-6 text-sm text-ink-600">This test has not been submitted yet.</p>}
        </div>
      </main>
    </>
  );
}

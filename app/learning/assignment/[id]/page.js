import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import AssignmentWork from '@/components/learning/AssignmentWork';
import OpenFileButton from '@/components/learning/OpenFileButton';
import { getSessionUser } from '@/lib/supabase/auth-server';
import { fmtDateTime } from '@/lib/format';

export const metadata = { title: 'Assignment — Teacher Connect' };

export default async function AssignmentPage({ params }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const { db, user, profile } = await getSessionUser();
  if (!user) redirect(`/login?next=/learning/assignment/${params.id}`);
  const { data: a } = await db.from('assignments').select('*').eq('id', params.id).maybeSingle();
  if (!a) notFound();
  const { data: sub } = await db.from('assignment_submissions').select('*').eq('assignment_id', a.id).maybeSingle();
  const isTeacher = a.teacher_id === user.id;
  const back = isTeacher ? '/teacher/assignments' : profile?.role === 'PARENT' ? '/parent/learning' : '/student/learning';
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-sky-50 px-5 py-8">
        <div className="mx-auto max-w-2xl space-y-5">
          <Link href={back} className="text-sm font-bold text-teal-600">← Back</Link>
          <section className="card space-y-2 p-6">
            <h1 className="text-2xl font-extrabold">{a.title}</h1>
            <p className="text-xs text-ink-600">{a.max_score} marks{a.due_at && ` · due ${fmtDateTime(a.due_at)}`}</p>
            {a.instructions && <p className="whitespace-pre-wrap text-sm">{a.instructions}</p>}
            {a.attachment_path && <OpenFileButton path={a.attachment_path} name={a.attachment_name} />}
          </section>
          <AssignmentWork a={a} sub={sub} isTeacher={isTeacher} />
        </div>
      </main>
    </>
  );
}

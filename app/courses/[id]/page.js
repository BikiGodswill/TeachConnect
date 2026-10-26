import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import RpcButton from '@/components/forms/RpcButton';
import { getSessionUser } from '@/lib/supabase/auth-server';

export const metadata = { title: 'Course — Teacher Connect' };
export const dynamic = 'force-dynamic';

export default async function Course({ params }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const { db, user } = await getSessionUser();
  const { data: c } = await db.from('courses').select('id,title,description,level,teacher_id,published,subjects(name)').eq('id', params.id).maybeSingle();
  if (!c) notFound();
  const [{ data: t }, { data: mats }, { data: enr }] = await Promise.all([
    db.from('teacher_cards').select('id,full_name').eq('id', c.teacher_id).maybeSingle(),
    db.from('course_materials').select('id,position,title,kind,body').eq('course_id', c.id).order('position'),
    user ? db.from('course_enrollments').select('course_id').eq('course_id', c.id).eq('student_id', user.id).maybeSingle() : { data: null },
  ]);
  const owner = user?.id === c.teacher_id;
  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] bg-sky-50 px-5 py-12">
        <div className="mx-auto max-w-2xl space-y-5">
          <Link href="/courses" className="text-sm font-bold text-teal-600">← All courses</Link>
          <section className="card space-y-2 p-6">
            <p className="text-xs font-bold uppercase text-teal-600">{c.subjects?.name || 'General'}{c.level && ` · ${c.level}`}</p>
            <h1 className="text-2xl font-extrabold">{c.title}</h1>
            {c.description && <p className="whitespace-pre-wrap text-sm">{c.description}</p>}
            {t && <p className="text-xs text-ink-600">By <Link className="font-bold underline" href={`/teachers/${t.id}`}>{t.full_name}</Link></p>}
            {!owner && !enr && (user ? <RpcButton rpc="enroll_course" args={{ p_course: c.id }} label="Enrol for free" success="You are enrolled." />
              : <Link href={`/login?next=/courses/${c.id}`} className="btn-teal h-10 px-5 text-xs">Log in to enrol</Link>)}
            {!c.published && owner && <p className="text-xs font-bold text-danger">Draft — only you can see this.</p>}
          </section>
          {(owner || enr) ? (
            <section className="space-y-3">
              <h2 className="font-bold">Materials</h2>
              {mats?.length ? mats.map((m) => (
                <div key={m.id} className="card space-y-1 p-5">
                  <p className="font-semibold">{m.position}. {m.title}</p>
                  {m.kind === 'LINK' ? <a href={m.body} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-sm font-bold text-teal-600 underline">{m.body}</a>
                    : <p className="whitespace-pre-wrap text-sm">{m.body}</p>}
                </div>)) : <p className="text-sm text-ink-600">No materials yet.</p>}
            </section>
          ) : <p className="card p-5 text-sm text-ink-600">Enrol to see the materials.</p>}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { createPublicClient } from '@/lib/supabase/server';

export const metadata = { title: 'Courses — Teacher Connect' };
export const dynamic = 'force-dynamic';

export default async function Courses() {
  const { data, error } = await createPublicClient().rpc('course_catalogue');
  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] bg-sky-50 px-5 py-12">
        <div className="mx-auto max-w-5xl space-y-6">
          <div><h1 className="text-3xl font-extrabold">Free courses</h1><p className="mt-2 text-ink-600">Study notes and resources shared by verified teachers. Enrol to unlock the materials.</p></div>
          {error ? <div className="card p-8 text-center text-sm text-ink-600">We could not load courses right now. Please try again in a moment.</div>
            : data?.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.map((c) => (
              <Link key={c.id} href={`/courses/${c.id}`} className="card space-y-2 p-6 transition hover:-translate-y-1 hover:shadow-float">
                <p className="text-xs font-bold uppercase text-teal-600">{c.subject_name || 'General'}{c.level && ` · ${c.level}`}</p>
                <h2 className="text-lg font-bold">{c.title}</h2>
                {c.description && <p className="line-clamp-3 text-sm text-ink-600">{c.description}</p>}
                <p className="text-xs text-ink-400">By {c.teacher_name} · {c.materials} material{c.materials === 1 ? '' : 's'} · {c.enrolled} enrolled</p>
              </Link>))}</div>
            : <div className="card p-10 text-center text-sm text-ink-600">No courses yet. Teachers can create one from their dashboard.</div>}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

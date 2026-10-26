import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import RpcForm from '@/components/forms/RpcForm';
import { getSessionUser } from '@/lib/supabase/auth-server';
import { fmtDate } from '@/lib/format';

export const metadata = { title: 'Teaching jobs — Teacher Connect' };
export const dynamic = 'force-dynamic';
const TYPE = { FULL_TIME: 'Full time', PART_TIME: 'Part time', CONTRACT: 'Contract' };

export default async function Jobs() {
  const { db, user, profile } = await getSessionUser();
  const { data: jobs } = await db.from('jobs').select('id,title,description,level,location,job_type,pay_note,created_at,school_profiles(name,city),subjects(name)').eq('status', 'OPEN').order('created_at', { ascending: false }).limit(100);
  let applied = new Set();
  if (profile?.role === 'TEACHER') {
    const { data } = await db.from('job_applications').select('job_id').eq('teacher_id', user.id);
    applied = new Set((data || []).map((a) => a.job_id));
  }
  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] bg-sky-50 px-5 py-12">
        <div className="mx-auto max-w-3xl space-y-6">
          <div><h1 className="text-3xl font-extrabold">Teaching jobs</h1><p className="mt-2 text-ink-600">Openings posted by verified schools. Teachers can apply in one step.</p></div>
          {jobs?.length ? jobs.map((j) => (
            <article key={j.id} className="card space-y-2 p-6">
              <h2 className="text-lg font-bold">{j.title}</h2>
              <p className="text-xs text-ink-600">{j.school_profiles?.name}{j.school_profiles?.city && ` · ${j.school_profiles.city}`} · {TYPE[j.job_type]}{j.subjects?.name && ` · ${j.subjects.name}`}{j.level && ` · ${j.level}`} · posted {fmtDate(j.created_at)}</p>
              <p className="whitespace-pre-wrap text-sm">{j.description}</p>
              {j.pay_note && <p className="text-sm font-semibold">Pay: {j.pay_note}</p>}
              {profile?.role === 'TEACHER' ? (applied.has(j.id) ? <p className="text-sm font-bold text-teal-600">You applied ✓</p>
                : <RpcForm rpc="apply_job" fixed={{ p_job: j.id }} submit="Apply" success="Application sent." fields={[{ name: 'p_message', label: 'Short message to the school', type: 'textarea', rows: 3, max: 2000 }]} />)
                : !user && <Link href={`/login?next=/jobs`} className="btn-teal h-10 px-5 text-xs">Log in as a teacher to apply</Link>}
            </article>
          )) : <div className="card p-10 text-center text-sm text-ink-600">No open jobs right now. Check back soon. Schools can <Link href="/become-a-school" className="font-bold text-teal-600 underline">register here</Link>.</div>}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

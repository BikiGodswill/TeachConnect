import Link from 'next/link';
import { getSessionUser } from '@/lib/supabase/auth-server';
import { fmtDate } from '@/lib/format';
import RpcForm from '@/components/forms/RpcForm';
import RpcButton from '@/components/forms/RpcButton';

export const metadata = { title: 'School dashboard — Teacher Connect' };

export default async function SchoolHome() {
  const { db, user } = await getSessionUser();
  const [{ data: school }, { data: jobs }, { data: subjects }] = await Promise.all([
    db.from('school_profiles').select('name,verified').eq('id', user.id).maybeSingle(),
    db.from('jobs').select('id,title,status,created_at,job_applications(count)').eq('school_id', user.id).order('created_at', { ascending: false }),
    db.from('subjects').select('id,name').order('name'),
  ]);
  const apps = (jobs || []).reduce((s, j) => s + (j.job_applications?.[0]?.count || 0), 0);
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold">{school?.name || 'Your school'}</h1>
        <p className="mt-1 text-sm text-ink-600">{school?.verified ? '✅ Verified school' : 'Waiting for verification by our team. You can post jobs once verified.'}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><p className="text-xs font-bold text-ink-600">Open jobs</p><p className="font-heading text-3xl font-extrabold">{(jobs || []).filter((j) => j.status === 'OPEN').length}</p></div>
        <div className="card p-5"><p className="text-xs font-bold text-ink-600">Applications</p><p className="font-heading text-3xl font-extrabold">{apps}</p></div>
        <Link href="/teachers" className="card p-5"><p className="text-xs font-bold text-ink-600">Find teachers</p><p className="font-heading text-xl font-extrabold text-teal-600">Browse →</p></Link>
      </div>
      {school?.verified && (
        <RpcForm rpc="post_job" title="Post a job" submit="Post job" success="Job posted." fields={[
          { name: 'p_title', label: 'Job title', required: true, max: 120 },
          { name: 'p_description', label: 'Description', type: 'textarea', required: true, max: 4000 },
          { name: 'p_subject', label: 'Subject (optional)', type: 'select', options: (subjects || []).map((s) => [s.id, s.name]) },
          { name: 'p_level', label: 'Level (e.g. Form 1–3)', max: 80 },
          { name: 'p_location', label: 'Location', max: 120 },
          { name: 'p_type', label: 'Type', type: 'select', required: true, default: 'PART_TIME', options: [['PART_TIME', 'Part time'], ['FULL_TIME', 'Full time'], ['CONTRACT', 'Contract']] },
          { name: 'p_pay', label: 'Pay (e.g. Negotiable)', max: 120 },
        ]} />
      )}
      <section className="space-y-3">
        <h2 className="font-bold">Your jobs</h2>
        {jobs?.length ? jobs.map((j) => (
          <div key={j.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <Link href={`/school/jobs/${j.id}`} className="font-bold underline">{j.title}</Link>
            <span className="text-xs text-ink-600">{j.status === 'OPEN' ? 'Open' : 'Closed'} · {j.job_applications?.[0]?.count || 0} applicant(s) · {fmtDate(j.created_at)}</span>
            {j.status === 'OPEN' && <RpcButton rpc="close_job" args={{ p_job: j.id }} label="Close" kind="ghost" confirmText="Close this job?" success="Job closed." />}
          </div>
        )) : <div className="card p-8 text-center text-sm text-ink-600">No jobs posted yet.</div>}
      </section>
    </div>
  );
}

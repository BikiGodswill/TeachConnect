import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSessionUser } from '@/lib/supabase/auth-server';
import RpcButton from '@/components/forms/RpcButton';

export const metadata = { title: 'Applicants — Teacher Connect' };

export default async function Applicants({ params }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const { db, user } = await getSessionUser();
  const { data: job } = await db.from('jobs').select('id,title').eq('id', params.id).eq('school_id', user.id).maybeSingle();
  if (!job) notFound();
  const { data: rows } = await db.rpc('job_applicants', { p_job: job.id });
  return (
    <div className="max-w-3xl space-y-6">
      <div><Link href="/school" className="text-sm font-bold text-teal-600">← Overview</Link><h1 className="mt-2 text-3xl font-extrabold">{job.title}</h1></div>
      {rows?.length ? rows.map((a) => (
        <div key={a.application_id} className="card space-y-2 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link href={`/teachers/${a.teacher_id}`} className="font-bold underline">{a.teacher_name}</Link>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold">{a.status}</span>
          </div>
          <p className="text-xs text-ink-600">Rating {Number(a.rating_avg || 0).toFixed(1)} · {a.verification === 'VERIFIED' ? '✅ Verified' : 'Not verified'}</p>
          {a.message && <p className="whitespace-pre-wrap text-sm">{a.message}</p>}
          <div className="flex flex-wrap gap-2">
            <RpcButton rpc="set_application_status" args={{ p_application: a.application_id, p_status: 'SHORTLISTED' }} label="Shortlist" kind="ghost" success="Shortlisted." />
            <RpcButton rpc="set_application_status" args={{ p_application: a.application_id, p_status: 'HIRED' }} label="Mark hired" success="Marked as hired." />
            <RpcButton rpc="set_application_status" args={{ p_application: a.application_id, p_status: 'REJECTED' }} label="Decline" kind="ghost" confirmText="Decline this applicant?" success="Declined." />
          </div>
        </div>
      )) : <div className="card p-8 text-center text-sm text-ink-600">No applications yet.</div>}
    </div>
  );
}

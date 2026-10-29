import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/supabase/auth-server';
import { createAdminClient } from '@/lib/supabase/admin';
import { VerificationActions } from '@/components/admin/AdminActions';
import { fmtDateTime } from '@/lib/format';

export const metadata = { title: 'Teacher verification — Admin' };
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function VerificationQueue() {
  const { db, profile } = await getSessionUser();
  if (profile?.role !== 'ADMIN') redirect('/');
  // No embedded joins: fetch each table on its own so one relationship problem cannot hide the queue.
  const [{ data: waiting, error: e1 }, { data: docsAll, error: e2 }] = await Promise.all([
    db.from('teacher_profiles').select('id, headline, city, years_experience, verification, updated_at').in('verification', ['PENDING', 'UNDER_REVIEW']).order('updated_at'),
    db.from('verification_documents').select('id,teacher_id,doc_type,storage_path,status,created_at').in('status', ['PENDING', 'UNDER_REVIEW']).order('created_at'),
  ]);
  if (e1 || e2) console.error('[admin/verification]', e1 || e2);
  const queryError = e1 || e2;
  const { data: ov } = await db.rpc('admin_overview');
  const counted = Number((Array.isArray(ov) ? ov[0] : ov)?.pending_verifications || 0);
  const ids = [...new Set([...(waiting || []).map((t) => t.id), ...(docsAll || []).map((d) => d.teacher_id)])];
  const [{ data: names }, { data: extra }] = ids.length ? await Promise.all([
    db.from('users').select('id,full_name').in('id', ids),
    db.from('teacher_profiles').select('id, headline, city, years_experience, verification, updated_at').in('id', ids),
  ]) : [{ data: [] }, { data: [] }];
  const nameOf = Object.fromEntries((names || []).map((u) => [u.id, u.full_name]));
  // Teachers who uploaded documents but did not press "Submit for review" are shown too, flagged.
  const teachers = (extra || []).map((t) => ({ ...t, users: { full_name: nameOf[t.id] || 'Unknown teacher' } }));
  const docs = docsAll || [];
  let admin = null;
  try { admin = createAdminClient(); } catch (e) { console.error('[admin/verification]', e.message); }
  const signed = {};
  for (const d of admin ? docs || [] : []) {
    const { data } = await admin.storage.from('verification-docs').createSignedUrl(d.storage_path, 300); // 5-minute private link
    signed[d.id] = data?.signedUrl;
  }
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Teacher verification</h1>
      {!admin && <p className="rounded-md bg-peach-100 p-3 text-sm font-semibold text-danger">Documents cannot be opened: SUPABASE_SERVICE_ROLE_KEY is not set on the server (add it in your Vercel environment variables and redeploy).</p>}
      {queryError && <p className="rounded-md bg-peach-100 p-3 text-sm font-semibold text-danger">Could not load the queue ({queryError.message}). Check that every database migration has been applied.</p>}
      {teachers?.length ? teachers.map((t) => (
        <section key={t.id} className="card space-y-4 p-6">
          <div>
            <h2 className="text-lg font-bold">{t.users?.full_name}</h2>
            {!['PENDING', 'UNDER_REVIEW'].includes(t.verification) && <p className="mt-1 inline-block rounded-full bg-brandyellow-100 px-3 py-1 text-xs font-bold">Documents uploaded, but the teacher has not pressed “Submit for review” yet</p>}
            <p className="text-sm text-ink-600">{[t.headline, t.city, t.years_experience != null && `${t.years_experience} yrs`].filter(Boolean).join(' · ')}</p>
          </div>
          <ul className="space-y-2 text-sm">
            {(docs || []).filter((d) => d.teacher_id === t.id).map((d) => (
              <li key={d.id} className="flex items-center justify-between rounded-md bg-sky-50 px-4 py-2">
                <span className="font-semibold">{d.doc_type.replaceAll('_', ' ')} <span className="font-normal text-ink-400">· {fmtDateTime(d.created_at)}</span></span>
                {signed[d.id] ? <a href={signed[d.id]} target="_blank" rel="noopener noreferrer" className="font-bold text-teal-600">Open</a> : <span className="text-ink-400">unavailable</span>}
              </li>
            ))}
          </ul>
          {['PENDING', 'UNDER_REVIEW'].includes(t.verification) ? <VerificationActions teacherId={t.id} /> : <p className="text-xs text-ink-600">You can approve once the teacher submits for review.</p>}
        </section>
      )) : <p className="text-ink-600">{counted > 0 ? `The overview counts ${counted} teacher(s) waiting, but this list could not read them. This points to a database permission (RLS) problem: re-run migration 003 and 006, then reload.` : 'No teachers are waiting for review.'}</p>}
    </div>
  );
}

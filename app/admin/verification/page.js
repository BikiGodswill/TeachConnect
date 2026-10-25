import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/supabase/auth-server';
import { createAdminClient } from '@/lib/supabase/admin';
import { VerificationActions } from '@/components/admin/AdminActions';
import { fmtDateTime } from '@/lib/format';

export const metadata = { title: 'Teacher verification — Admin' };

export default async function VerificationQueue() {
  const { db, profile } = await getSessionUser();
  if (profile?.role !== 'ADMIN') redirect('/');
  const { data: teachers } = await db.from('teacher_profiles')
    .select('id, headline, city, years_experience, users(full_name)').in('verification', ['PENDING', 'UNDER_REVIEW']).order('updated_at');
  const ids = (teachers || []).map((t) => t.id);
  const { data: docs } = ids.length
    ? await db.from('verification_documents').select('id,teacher_id,doc_type,storage_path,created_at').in('teacher_id', ids).in('status', ['PENDING', 'UNDER_REVIEW'])
    : { data: [] };
  const admin = createAdminClient();
  const signed = {};
  for (const d of docs || []) {
    const { data } = await admin.storage.from('verification-docs').createSignedUrl(d.storage_path, 300); // 5-minute private link
    signed[d.id] = data?.signedUrl;
  }
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Teacher verification</h1>
      {teachers?.length ? teachers.map((t) => (
        <section key={t.id} className="card space-y-4 p-6">
          <div>
            <h2 className="text-lg font-bold">{t.users?.full_name}</h2>
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
          <VerificationActions teacherId={t.id} />
        </section>
      )) : <p className="text-ink-600">No teachers are waiting for review.</p>}
    </div>
  );
}

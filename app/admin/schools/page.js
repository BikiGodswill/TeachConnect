import { getSessionUser } from '@/lib/supabase/auth-server';
import RpcButton from '@/components/forms/RpcButton';

export const metadata = { title: 'Schools — Admin' };

export default async function AdminSchools() {
  const { db } = await getSessionUser();
  const { data } = await db.from('school_profiles').select('id,name,city,description,verified,created_at').order('verified').order('created_at', { ascending: false });
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-3xl font-extrabold">Schools</h1>
      {data?.length ? data.map((s) => (
        <div key={s.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
          <div><p className="font-bold">{s.name} {s.verified && '✅'}</p><p className="text-xs text-ink-600">{s.city || 'No city'}{s.description && ` · ${s.description.slice(0, 120)}`}</p></div>
          <RpcButton rpc="verify_school" args={{ p_school: s.id, p_verified: !s.verified }} label={s.verified ? 'Remove verification' : 'Verify'} kind={s.verified ? 'ghost' : 'teal'} success="Updated." />
        </div>
      )) : <div className="card p-8 text-center text-sm text-ink-600">No schools have registered yet.</div>}
    </div>
  );
}

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/supabase/auth-server';
import { SafetyActions } from '@/components/admin/AdminActions';
import { fmtDateTime } from '@/lib/format';

export const metadata = { title: 'Safety — Admin' };

export default async function Safety() {
  const { db, profile } = await getSessionUser();
  if (profile?.role !== 'ADMIN') redirect('/');
  const [{ data: incidents }, { data: reports }] = await Promise.all([
    db.from('safety_incidents').select('id,booking_id,kind,message,latitude,longitude,status,created_at,reporter:users!reporter_id(full_name,phone)')
      .in('status', ['OPEN', 'ACKNOWLEDGED']).order('created_at'),
    db.from('reports').select('id,reason,description,created_at,reporter:users!reporter_id(full_name),reported:users!reported_user_id(full_name)')
      .eq('status', 'OPEN').order('created_at'),
  ]);
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-extrabold">Safety alerts</h1>
        {incidents?.length ? incidents.map((i) => (
          <article key={i.id} className={`card space-y-3 border-l-4 p-6 ${i.kind === 'SOS' ? 'border-danger' : 'border-brandyellow-500'}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold">{i.kind === 'SOS' ? '🚨 SOS' : 'Safety concern'} from {i.reporter?.full_name}</h2>
                <p className="text-xs text-ink-600">{fmtDateTime(i.created_at)} · {i.status}{i.reporter?.phone && <> · Phone <a className="font-bold underline" href={`tel:${i.reporter.phone}`}>{i.reporter.phone}</a></>}</p>
              </div>
              {i.latitude != null && (
                <a className="btn-ghost h-9 px-4 text-xs" target="_blank" rel="noopener noreferrer" href={`https://www.openstreetmap.org/?mlat=${i.latitude}&mlon=${i.longitude}#map=16/${i.latitude}/${i.longitude}`}>View location</a>
              )}
            </div>
            {i.message && <p className="rounded-md bg-sky-50 p-3 text-sm">{i.message}</p>}
            <SafetyActions kind="incident" id={i.id} status={i.status} />
          </article>
        )) : <p className="text-ink-600">No open safety alerts.</p>}
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-extrabold">User reports</h2>
        {reports?.length ? reports.map((r) => (
          <article key={r.id} className="card space-y-3 p-6">
            <p className="font-bold">{r.reporter?.full_name} reported {r.reported?.full_name}</p>
            <p className="text-xs text-ink-600">{fmtDateTime(r.created_at)} · {r.reason}</p>
            {r.description && <p className="rounded-md bg-sky-50 p-3 text-sm">{r.description}</p>}
            <SafetyActions kind="report" id={r.id} status="OPEN" />
          </article>
        )) : <p className="text-ink-600">No open reports.</p>}
      </section>
    </div>
  );
}

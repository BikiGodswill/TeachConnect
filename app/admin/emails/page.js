import { getSessionUser } from '@/lib/supabase/auth-server';
import { fmtDateTime } from '@/lib/format';

export const metadata = { title: 'E-mail log — Admin' };
export const dynamic = 'force-dynamic';

const TONE = { SENT: 'bg-teal-100', QUEUED: 'bg-sky-100', SENDING: 'bg-sky-100', FAILED: 'bg-peach-100' };

export default async function EmailLog() {
  const { db } = await getSessionUser();
  const { data, error } = await db.from('email_outbox').select('id,type,subject,status,attempts,last_error,created_at,sent_at').order('created_at', { ascending: false }).limit(100);
  const counts = (data || []).reduce((m, r) => ({ ...m, [r.status]: (m[r.status] || 0) + 1 }), {});
  const configured = !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM && !!process.env.CRON_SECRET;
  return (
    <div className="max-w-4xl space-y-6">
      <div><h1 className="text-3xl font-extrabold">E-mail log</h1><p className="mt-1 text-sm text-ink-600">The last 100 notification e-mails. Queued e-mails are sent as soon as the sender is triggered (see docs/EMAIL.md).</p></div>
      {!configured && <p className="rounded-md bg-peach-100 p-3 text-sm font-semibold text-danger">E-mail sending is not fully set up: RESEND_API_KEY, EMAIL_FROM and CRON_SECRET must all be set on the server. Messages will wait in the queue until then.</p>}
      {error && <p className="rounded-md bg-peach-100 p-3 text-sm font-semibold text-danger">Could not load the log. Run migration 012 in Supabase.</p>}
      <div className="flex flex-wrap gap-2 text-xs font-bold">{Object.entries(counts).map(([k, v]) => <span key={k} className={`rounded-full px-3 py-1 ${TONE[k] || ''}`}>{k} {v}</span>)}</div>
      {data?.length ? (
        <div className="overflow-x-auto"><table className="card w-full text-left text-sm">
          <thead><tr className="border-b border-ink-200 text-xs text-ink-600"><th className="p-3">When</th><th className="p-3">Type</th><th className="p-3">Subject</th><th className="p-3">Status</th></tr></thead>
          <tbody>{data.map((r) => (
            <tr key={r.id} className="border-b border-ink-100 align-top last:border-0">
              <td className="whitespace-nowrap p-3 text-xs">{fmtDateTime(r.created_at)}</td><td className="p-3 text-xs">{r.type}</td>
              <td className="p-3">{r.subject}{r.last_error && <p className="mt-1 text-xs text-danger">{r.last_error}</p>}</td>
              <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${TONE[r.status] || ''}`}>{r.status}</span>{r.attempts > 1 && <span className="ml-1 text-xs text-ink-400">×{r.attempts}</span>}</td>
            </tr>))}</tbody>
        </table></div>
      ) : <div className="card p-10 text-center text-sm text-ink-600">No e-mails yet.</div>}
    </div>
  );
}

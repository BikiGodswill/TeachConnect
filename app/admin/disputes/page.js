import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/supabase/auth-server';
import { DisputeActions } from '@/components/admin/AdminActions';
import { money, fmtDateTime, DISPUTE_REASONS } from '@/lib/format';

export const metadata = { title: 'Disputes — Admin' };

export default async function Disputes() {
  const { db, profile } = await getSessionUser();
  if (profile?.role !== 'ADMIN') redirect('/');
  const { data: disputes } = await db.from('disputes')
    .select('id, reason, description, amount_disputed, status, created_at, payments(amount, teacher_amount), bookings(scheduled_date, start_time, lesson_type)')
    .in('status', ['OPEN', 'UNDER_REVIEW']).order('created_at');
  const label = Object.fromEntries(DISPUTE_REASONS);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Open disputes</h1>
      {disputes?.length ? disputes.map((d) => (
        <section key={d.id} className="card space-y-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">{label[d.reason] || d.reason}</h2>
              <p className="text-xs text-ink-600">Opened {fmtDateTime(d.created_at)} · Lesson {d.bookings?.scheduled_date} ({d.bookings?.lesson_type})</p>
            </div>
            <p className="font-heading text-lg font-extrabold">{money(d.payments?.amount)}</p>
          </div>
          {d.description && <p className="rounded-md bg-sky-50 p-3 text-sm">{d.description}</p>}
          <p className="text-xs text-ink-600">A refund comes out of the teacher&apos;s share first. Teacher share: {money(d.payments?.teacher_amount)}.</p>
          <DisputeActions disputeId={d.id} amount={Number(d.payments?.amount || 0)} />
        </section>
      )) : <p className="text-ink-600">No open disputes.</p>}
    </div>
  );
}

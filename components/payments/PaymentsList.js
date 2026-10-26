import Link from 'next/link';
import { money, fmtDate, fmtTime, PAYMENT_LABEL } from '@/lib/format';

// Server component: the signed-in user's own payments (RLS limits rows to the payer).
export default async function PaymentsList({ db, userId, home }) {
  const { data, error } = await db.from('payments')
    .select('id,amount,currency,payment_method,payment_status,paid_at,refunded_amount,created_at,bookings(id,scheduled_date,start_time,subjects(name))')
    .eq('student_id', userId).order('created_at', { ascending: false }).limit(100);
  const paid = (data || []).filter((p) => ['PAID', 'HELD', 'AVAILABLE', 'PARTIALLY_REFUNDED'].includes(p.payment_status)).reduce((s, p) => s + p.amount - p.refunded_amount, 0);
  return (
    <div className="max-w-3xl space-y-6">
      <div><h1 className="text-3xl font-extrabold">Payments</h1><p className="mt-1 text-sm text-ink-600">Money paid in the app is held safely until your lesson is done and the problem-report window has passed.</p></div>
      <div className="card p-5"><p className="text-xs font-bold text-ink-600">Total paid in the app</p><p className="font-heading text-3xl font-extrabold">{money(paid)}</p></div>
      {error ? <div className="card p-8 text-center text-sm text-ink-600">We could not load your payments. Please refresh.</div>
        : data?.length ? <div className="space-y-3">{data.map((p) => (
          <div key={p.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div><p className="font-bold">{p.bookings?.subjects?.name || 'Lesson'}</p><p className="text-xs text-ink-600">{p.bookings ? `${fmtDate(p.bookings.scheduled_date)} · ${fmtTime(p.bookings.start_time)}` : ''} · {p.payment_method === 'TEACHER_CONNECT' ? 'Paid in app' : 'Paid directly to teacher'}</p></div>
            <div className="text-right"><p className="font-bold">{money(p.amount, p.currency)}</p><p className="text-xs text-ink-600">{PAYMENT_LABEL[p.payment_status] || p.payment_status}{p.refunded_amount > 0 && ` · refunded ${money(p.refunded_amount, p.currency)}`}</p></div>
          </div>))}</div>
        : <div className="card p-10 text-center text-sm text-ink-600">No payments yet. <Link className="font-bold text-teal-600 underline" href="/teachers">Find a teacher</Link> to book your first lesson.</div>}
      <p className="text-xs text-ink-400">Problem with a lesson? Open it from <Link className="underline" href={`${home}/bookings`}>My bookings</Link> within 24 hours of completion and choose “Report a problem”.</p>
    </div>
  );
}

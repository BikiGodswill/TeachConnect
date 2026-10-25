import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/supabase/auth-server';
import { WithdrawalActions } from '@/components/admin/AdminActions';
import { money, fmtDateTime } from '@/lib/format';

export const metadata = { title: 'Withdrawals — Admin' };

export default async function Withdrawals() {
  const { db, profile } = await getSessionUser();
  if (profile?.role !== 'ADMIN') redirect('/');
  const { data: rows } = await db.from('withdrawals')
    .select('id, amount, destination_type, destination_ref, status, created_at, teacher_profiles(users(full_name))')
    .in('status', ['REQUESTED', 'PROCESSING']).order('created_at');
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Pending withdrawals</h1>
      <p className="text-sm text-ink-600">Send the money from your mobile money or bank account, then mark it paid. If the payout fails, the funds return to the teacher&apos;s balance.</p>
      {rows?.length ? rows.map((w) => (
        <section key={w.id} className="card space-y-3 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold">{w.teacher_profiles?.users?.full_name}</h2>
              <p className="text-sm text-ink-600">{w.destination_type === 'MOBILE_MONEY' ? 'Mobile money' : 'Bank'} · {w.destination_ref} · {fmtDateTime(w.created_at)}</p>
            </div>
            <p className="font-heading text-xl font-extrabold">{money(w.amount)}</p>
          </div>
          <WithdrawalActions id={w.id} />
        </section>
      )) : <p className="text-ink-600">No withdrawals waiting.</p>}
    </div>
  );
}

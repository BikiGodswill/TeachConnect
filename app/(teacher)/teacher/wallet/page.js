import { getSessionUser } from '@/lib/supabase/auth-server';
import { money, fmtDateTime } from '@/lib/format';
import WalletActions from '@/components/wallet/WalletActions';

export const metadata = { title: 'Wallet — Teacher Connect' };

const TX_LABEL = { LESSON_PAYMENT: 'Lesson payment', PLATFORM_COMMISSION: 'Platform commission (already deducted)', REFUND: 'Refund', WITHDRAWAL: 'Withdrawal', ADJUSTMENT: 'Adjustment', RELEASE: 'Funds released' };

export default async function WalletPage() {
  const { db, user } = await getSessionUser();
  const { data: w } = await db.from('wallets').select('*').eq('teacher_id', user.id).maybeSingle();
  const { data: pref } = await db.from('payout_preferences').select('preference').eq('teacher_id', user.id).maybeSingle();
  const [{ data: txs }, { data: wds }] = await Promise.all([
    w ? db.from('wallet_transactions').select('*').eq('wallet_id', w.id).order('created_at', { ascending: false }).limit(50) : { data: [] },
    db.from('withdrawals').select('*').eq('teacher_id', user.id).order('created_at', { ascending: false }).limit(10),
  ]);
  const cards = [
    ['Total earnings', w?.total_earnings, 'bg-navy-900 text-white'], ['Pending', w?.pending_balance, 'bg-brandyellow-100'],
    ['Available', w?.available_balance, 'bg-teal-100'], ['Disputed', w?.disputed_balance, 'bg-peach-100'], ['Withdrawn', w?.withdrawn_balance, 'bg-lavender-100'],
  ];
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold">Wallet</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, v, tone]) => (
          <div key={label} className={`rounded-lg p-5 shadow-card ${tone}`}>
            <p className="text-xs font-bold opacity-70">{label}</p>
            <p className="mt-2 font-heading text-xl font-extrabold">{money(v)}</p>
          </div>
        ))}
      </div>

      <WalletActions available={Number(w?.available_balance || 0)} preference={pref?.preference || 'FAST'} teacherId={user.id} />

      <section>
        <h2 className="mb-4 text-lg font-bold">Transactions</h2>
        <div className="space-y-3">
          {txs?.length ? txs.map((t) => (
            <div key={t.id} className="card flex items-center justify-between p-4">
              <div><p className="font-semibold">{TX_LABEL[t.type]}</p><p className="text-xs text-ink-600">{fmtDateTime(t.created_at)}{t.note ? ` · ${t.note}` : ''}</p></div>
              <p className={`font-heading font-extrabold ${t.type === 'PLATFORM_COMMISSION' ? 'text-ink-400' : t.amount < 0 ? 'text-danger' : 'text-success'}`}>
                {t.amount > 0 ? '+' : ''}{money(t.amount)}
              </p>
            </div>
          )) : <p className="text-ink-600">No transactions yet.</p>}
        </div>
      </section>

      {wds?.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold">Withdrawals</h2>
          <div className="space-y-3">{wds.map((d) => (
            <div key={d.id} className="card flex items-center justify-between p-4"><span>{money(d.amount)} → {d.destination_ref}</span><span className="text-sm font-bold">{d.status}</span></div>
          ))}</div>
        </section>
      )}
    </div>
  );
}

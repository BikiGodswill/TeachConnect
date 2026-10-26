import { fmtDate, money } from '@/lib/format';
import RpcForm from '@/components/forms/RpcForm';
import CopyButton from '@/components/forms/CopyButton';

const LABEL = { LESSON_PAYMENT: 'Lesson cashback', REFERRAL: 'Referral bonus', MONTHLY_REWARD: 'Monthly reward', PROMOTION: 'Promotion', REDEMPTION: 'Redeemed', EXPIRATION: 'Expired', ADJUSTMENT: 'Adjustment' };

export default async function RewardsPanel({ db, userId }) {
  const [{ data: acct }, { data: tx }, { data: ref }] = await Promise.all([
    db.from('reward_accounts').select('balance').eq('user_id', userId).maybeSingle(),
    db.from('reward_transactions').select('id,type,amount,created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
    db.rpc('my_referral'),
  ]);
  return (
    <div className="max-w-2xl space-y-6">
      <div><h1 className="text-3xl font-extrabold">Rewards</h1><p className="mt-1 text-sm text-ink-600">You earn a small cashback after each in-app lesson is settled, and a bonus when a friend you invite pays for their first lesson.</p></div>
      <div className="card bg-brand-gradient p-6 text-white"><p className="text-xs font-bold uppercase opacity-80">Reward balance</p><p className="font-heading text-4xl font-extrabold">{money(acct?.balance || 0)}</p>
        <p className="mt-2 text-xs opacity-80">Spending rewards on lessons is coming soon. Your balance is kept safe until then.</p></div>
      {ref && (
        <section className="card space-y-3 p-6">
          <h2 className="font-bold">Invite friends</h2>
          <p className="text-sm text-ink-600">Share your code. {ref.referred} friend{ref.referred === 1 ? '' : 's'} joined with it so far.</p>
          <div className="flex flex-wrap items-center gap-3"><span className="rounded-md bg-sky-100 px-4 py-2 font-mono text-lg font-bold">{ref.code}</span><CopyButton text={ref.code} label="Copy code" /></div>
        </section>
      )}
      {ref && !ref.used_code && (
        <RpcForm rpc="apply_referral" title="Have a friend's code?" submit="Apply code" success="Code applied." fields={[{ name: 'p_code', label: 'Referral code', required: true, max: 20 }]} />
      )}
      <section className="space-y-2"><h2 className="font-bold">History</h2>
        {tx?.length ? tx.map((t) => <div key={t.id} className="card flex justify-between p-4 text-sm"><span>{LABEL[t.type] || t.type} <span className="text-xs text-ink-400">· {fmtDate(t.created_at)}</span></span><b className={t.amount < 0 ? 'text-danger' : 'text-teal-600'}>{t.amount > 0 ? '+' : ''}{money(t.amount)}</b></div>)
          : <div className="card p-8 text-center text-sm text-ink-600">No rewards yet. They appear after your first paid lesson settles.</div>}
      </section>
    </div>
  );
}

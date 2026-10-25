'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

const PREFS = [['FAST', 'Fast — 24 hours'], ['STANDARD', 'Standard — 3 days'], ['WEEKLY', 'Weekly — 7 days'], ['BIWEEKLY', 'Biweekly — 14 days'], ['MONTHLY', 'Monthly — 30 days']];
const input = 'mt-1 h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm outline-none focus:border-teal-500';

export default function WalletActions({ available, preference, teacherId }) {
  const router = useRouter();
  const [pref, setPref] = useState(preference);
  const [busy, setBusy] = useState(false);

  async function savePref(value) {
    setPref(value);
    const { error } = await createClient().from('payout_preferences').upsert({ teacher_id: teacherId, preference: value, updated_at: new Date().toISOString() });
    if (error) return toast.error('Could not save.');
    toast.success('Applies to lessons completed from now on.');
  }

  async function withdraw(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const res = await fetch('/api/wallet/withdraw', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(f.get('amount')), destinationType: f.get('type'), destinationRef: f.get('ref') }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast.error(json.error || 'Withdrawal failed.');
    toast.success('Withdrawal requested.'); e.target.reset(); router.refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form onSubmit={withdraw} className="card space-y-3 p-6">
        <h2 className="text-lg font-bold">Withdraw funds</h2>
        <p className="text-xs text-ink-600">Available now: <b>{available.toLocaleString('en-US')} FCFA</b></p>
        <label className="block text-xs font-bold text-ink-600">Amount (FCFA)<input name="amount" type="number" min="1" max={available} required className={input} /></label>
        <label className="block text-xs font-bold text-ink-600">Destination
          <select name="type" className={input}><option value="MOBILE_MONEY">Mobile Money</option><option value="BANK">Bank account</option></select>
        </label>
        <label className="block text-xs font-bold text-ink-600">Phone number / account<input name="ref" required minLength={6} maxLength={40} className={input} /></label>
        <button disabled={busy || available <= 0} className="btn-teal w-full disabled:opacity-50">{busy ? 'Requesting…' : 'Request withdrawal'}</button>
      </form>
      <div className="card p-6">
        <h2 className="text-lg font-bold">Payout holding period</h2>
        <p className="mt-1 text-xs text-ink-600">You earn immediately. This only controls when funds become withdrawable.</p>
        <div className="mt-4 space-y-2">
          {PREFS.map(([v, l]) => (
            <label key={v} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm ${pref === v ? 'border-teal-500 bg-teal-100' : 'border-ink-200'}`}>
              <input type="radio" name="pref" checked={pref === v} onChange={() => savePref(v)} className="accent-teal-500" /> {l}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

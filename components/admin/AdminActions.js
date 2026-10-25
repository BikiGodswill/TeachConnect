'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { friendlyError } from '@/lib/errors';

async function post(url, body) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || 'Action failed');
}

function useAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const run = async (fn, ok) => {
    setBusy(true);
    try { await fn(); toast.success(ok); router.refresh(); } catch (e) { toast.error(friendlyError(e)); } finally { setBusy(false); }
  };
  return { busy, run };
}

export function VerificationActions({ teacherId }) {
  const { busy, run } = useAction();
  const [note, setNote] = useState('');
  return (
    <div className="space-y-3">
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note to teacher (shown if rejected)" className="h-11 w-full rounded-md border border-ink-200 px-3 text-sm" />
      <div className="flex gap-3">
        <button disabled={busy} onClick={() => run(() => post('/api/admin/verification', { teacherId, approve: true, note }), 'Teacher verified')} className="btn-teal h-10 px-5 text-xs">Approve</button>
        <button disabled={busy} onClick={() => run(() => post('/api/admin/verification', { teacherId, approve: false, note }), 'Teacher rejected')} className="btn-ghost h-10 px-5 text-xs">Reject</button>
      </div>
    </div>
  );
}

export function DisputeActions({ disputeId, amount }) {
  const { busy, run } = useAction();
  const [refund, setRefund] = useState(0);
  const [resolution, setResolution] = useState('');
  const submit = () => {
    if (!resolution.trim()) return toast.error('Write a short resolution note.');
    if (refund > amount) return toast.error('Refund cannot exceed the payment.');
    if (!confirm(`Refund the student ${refund.toLocaleString()} FCFA? This cannot be undone.`)) return;
    run(() => post('/api/admin/disputes', { disputeId, refund: Number(refund), resolution }), 'Dispute resolved');
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {[['No refund', 0], ['Partial 30%', Math.round(amount * 0.3)], ['Partial 50%', Math.round(amount * 0.5)], ['Full refund', amount]].map(([l, v]) => (
          <button key={l} type="button" onClick={() => setRefund(v)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${refund === v ? 'border-teal-500 bg-teal-100' : 'border-ink-200'}`}>{l}</button>
        ))}
      </div>
      <label className="block text-xs font-bold text-ink-600">Refund amount (FCFA)
        <input type="number" min="0" max={amount} value={refund} onChange={(e) => setRefund(Math.max(0, Number(e.target.value)))} className="mt-1 h-11 w-full rounded-md border border-ink-200 px-3 text-sm" />
      </label>
      <textarea value={resolution} onChange={(e) => setResolution(e.target.value)} rows={2} placeholder="Resolution note (visible to both parties)" className="w-full rounded-md border border-ink-200 p-3 text-sm" />
      <button disabled={busy} onClick={submit} className="btn-primary h-10 px-5 text-xs">Resolve dispute</button>
    </div>
  );
}

export function WithdrawalActions({ id }) {
  const { busy, run } = useAction();
  const [ref, setRef] = useState('');
  return (
    <div className="flex flex-wrap items-center gap-3">
      <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Payout reference" className="h-10 rounded-md border border-ink-200 px-3 text-sm" />
      <button disabled={busy} onClick={() => run(() => post('/api/admin/withdrawals', { id, paid: true, reference: ref }), 'Marked as paid')} className="btn-teal h-10 px-5 text-xs">Mark paid</button>
      <button disabled={busy} onClick={() => confirm('Return the funds to the teacher?') && run(() => post('/api/admin/withdrawals', { id, paid: false }), 'Funds returned')} className="btn-ghost h-10 px-5 text-xs">Payout failed</button>
    </div>
  );
}

export function SafetyActions({ kind, id, status }) {
  const { busy, run } = useAction();
  const [note, setNote] = useState('');
  const opts = kind === 'incident'
    ? [...(status === 'OPEN' ? [['ACKNOWLEDGED', 'Acknowledge', 'btn-ghost']] : []), ['RESOLVED', 'Resolve', 'btn-teal']]
    : [['REVIEWED', 'Mark reviewed', 'btn-teal'], ['DISMISSED', 'Dismiss', 'btn-ghost']];
  return (
    <div className="space-y-3">
      <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="Note (what was done)" className="h-11 w-full rounded-md border border-ink-200 px-3 text-sm" />
      <div className="flex gap-3">
        {opts.map(([s, label, cls]) => (
          <button key={s} disabled={busy} onClick={() => run(() => post('/api/admin/safety', { kind, id, status: s, note }), 'Updated')} className={`${cls} h-10 px-5 text-xs`}>{label}</button>
        ))}
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiShieldExclamation } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';
import { friendlyError } from '@/lib/errors';
import { getPosition } from '@/lib/geo';

// SOS alerts the Teacher Connect safety team (not the other party) and shows your local emergency number.
export default function SosButton({ bookingId, emergency, active = true }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState('SOS');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function send() {
    setBusy(true);
    let pos = null;
    try { pos = await getPosition({ timeout: 6000 }); } catch { /* send without location */ }
    const { error } = await createClient().rpc('trigger_sos', { p_booking: bookingId, p_lat: pos?.lat ?? null, p_lng: pos?.lng ?? null, p_message: msg || null, p_kind: kind });
    setBusy(false);
    if (error) return toast.error(friendlyError(error));
    setSent(true);
  }

  return (
    <div className="rounded-lg border border-danger/30 bg-white p-4">
      {!open ? (
        <button onClick={() => setOpen(true)} className="flex w-full items-center justify-center gap-2 text-sm font-bold text-danger"><HiShieldExclamation size={20} /> Safety &amp; SOS</button>
      ) : sent ? (
        <div className="space-y-2 text-sm" role="status">
          <p className="font-bold text-teal-600">Our safety team has been alerted.</p>
          {emergency && <p>If you are in danger, call <a className="font-bold underline" href={`tel:${emergency}`}>{emergency}</a> now.</p>}
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          <div className="flex gap-2">
            {active && <button type="button" onClick={() => setKind('SOS')} className={`flex-1 rounded-full border px-3 py-2 font-bold ${kind === 'SOS' ? 'border-danger bg-danger text-white' : 'border-ink-200'}`}>Emergency</button>}
            <button type="button" onClick={() => setKind('CONCERN')} className={`flex-1 rounded-full border px-3 py-2 font-bold ${kind === 'CONCERN' ? 'border-navy-900 bg-navy-900 text-white' : 'border-ink-200'}`}>Report a concern</button>
          </div>
          <textarea value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={500} rows={2} placeholder="What is happening? (optional)" className="w-full rounded-md border border-ink-200 p-3" />
          <p className="text-xs text-ink-600">Your location is sent to the safety team if you allow it. {emergency ? <>In immediate danger, call <b>{emergency}</b>.</> : 'In immediate danger, call your local emergency number.'}</p>
          <div className="flex gap-2">
            <button disabled={busy} onClick={send} className="flex-1 rounded-full bg-danger px-4 py-3 font-bold text-white disabled:opacity-60">{busy ? 'Sending…' : kind === 'SOS' ? 'Send SOS' : 'Send report'}</button>
            <button onClick={() => setOpen(false)} className="btn-ghost h-auto px-4">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

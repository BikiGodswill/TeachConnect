'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { HiBolt, HiMapPin } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';
import { friendlyError } from '@/lib/errors';
import { money, fmtDateTime } from '@/lib/format';

export default function InstantInbox({ availableUntil, hasBase, verified }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [until, setUntil] = useState(availableUntil && new Date(availableUntil) > new Date() ? availableUntil : null);
  const [offers, setOffers] = useState([]);
  const [hours, setHours] = useState(2);
  const [busy, setBusy] = useState(false);
  const [, force] = useState(0);

  const poll = useCallback(async () => {
    const { data } = await supabase.rpc('my_instant_offers');
    setOffers(data || []);
  }, [supabase]);

  useEffect(() => {
    poll();
    const i = setInterval(() => { poll(); force((n) => n + 1); }, 5000);
    return () => clearInterval(i);
  }, [poll]);

  async function toggle(on) {
    setBusy(true);
    const { data, error } = await supabase.rpc('set_available_now', { p_on: on, p_hours: hours });
    setBusy(false);
    if (error) return toast.error(friendlyError(error));
    setUntil(on ? data : null);
    toast.success(on ? 'You are now available for instant requests.' : 'You are no longer available.');
  }
  async function accept(o) {
    const { data, error } = await supabase.rpc('accept_instant_offer', { p_offer: o.offer_id });
    if (error) { toast.error(friendlyError(error)); return poll(); }
    toast.success('Lesson accepted! Open it to start heading over.');
    router.push(`/lesson/${data}`);
  }
  async function decline(o) {
    const { error } = await supabase.rpc('decline_instant_offer', { p_offer: o.offer_id });
    if (error) return toast.error(friendlyError(error));
    setOffers((l) => l.filter((x) => x.offer_id !== o.offer_id));
  }

  const on = until && new Date(until) > new Date();
  return (
    <div className="space-y-6">
      <div className={`card p-6 ${on ? 'ring-2 ring-teal-500' : ''}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold"><HiBolt className="text-brandyellow-500" /> {on ? 'You are available now' : 'Go available'}</h2>
            <p className="text-sm text-ink-600">{on ? `Until ${fmtDateTime(until)}` : 'Receive instant lesson requests from students nearby.'}</p>
          </div>
          {on ? <button disabled={busy} onClick={() => toggle(false)} className="btn-ghost">Stop</button> : (
            <div className="flex items-center gap-2">
              <select value={hours} onChange={(e) => setHours(Number(e.target.value))} aria-label="Duration" className="h-11 rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold">
                {[1, 2, 3, 4, 8].map((h) => <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>)}
              </select>
              <button disabled={busy} onClick={() => toggle(true)} className="btn-teal disabled:opacity-60">Go available</button>
            </div>
          )}
        </div>
        {(!hasBase || !verified) && (
          <ul className="mt-4 space-y-1 rounded-md bg-peach-100 p-3 text-xs font-semibold">
            {!hasBase && <li>Set your base area on your profile to receive in-person requests.</li>}
            {!verified && <li>In-person instant requests go to verified teachers only. Online requests are open to everyone.</li>}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold">Incoming requests</h2>
        <AnimatePresence>
          {offers.map((o) => {
            const secs = Math.max(0, Math.round((new Date(o.expires_at) - Date.now()) / 1000));
            return (
              <motion.div key={o.offer_id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="card mb-3 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{o.subject_name} · {o.duration_minutes} min · {o.lesson_type === 'ONLINE' ? 'Online' : 'In person'}</p>
                    <p className="text-sm text-ink-600">From {o.student_first_name}{o.distance_km != null && <> · <HiMapPin className="inline" /> about {o.distance_km} km away</>}</p>
                    {o.location_text && <p className="text-sm text-ink-600">{o.location_text}</p>}
                    {o.notes && <p className="mt-1 text-sm italic text-ink-600">“{o.notes}”</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold">{money(o.estimated_price, o.currency)}</p>
                    <p className="text-xs text-ink-400">{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')} left</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button onClick={() => accept(o)} className="btn-teal h-10 px-6 text-sm">Accept</button>
                  <button onClick={() => decline(o)} className="btn-ghost h-10 px-6 text-sm">Decline</button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {!offers.length && <div className="card p-8 text-center text-sm text-ink-600">{on ? 'Waiting for requests… this page updates by itself.' : 'Go available to start receiving requests.'}</div>}
      </div>
    </div>
  );
}

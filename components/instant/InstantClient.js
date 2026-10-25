'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { HiBolt, HiCheckCircle, HiClock } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';
import { friendlyError } from '@/lib/errors';
import { PAYMENT_METHODS } from '@/lib/booking';
import LocationPicker from '@/components/map/LocationPicker';

const input = 'mt-1 w-full rounded-md border border-ink-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500';

export default function InstantClient({ subjects, children: kids, isParent, defaultSubject, activeId, activeExpires }) {
  const supabase = useMemo(() => createClient(), []);
  const [f, setF] = useState({ subject: defaultSubject, type: 'PHYSICAL', duration: 60, location: '', notes: '', method: 'TEACHER_CONNECT', child: kids?.[0]?.id || '' });
  const [loc, setLoc] = useState(null);
  const [busy, setBusy] = useState(false);
  const [req, setReq] = useState(activeId ? { id: activeId, expiresAt: activeExpires, offers: null } : null);
  const [st, setSt] = useState(null);
  const [left, setLeft] = useState(0);
  const timer = useRef();

  useEffect(() => {
    if (!req) return;
    let stop = false;
    const tick = async () => {
      const { data, error } = await supabase.rpc('instant_request_status', { p_request: req.id });
      if (stop) return;
      if (error) return;
      const row = Array.isArray(data) ? data[0] : data;
      if (row) setSt(row);
      if (row && row.req_status !== 'SEARCHING') return;
      timer.current = setTimeout(tick, 4000);
    };
    tick();
    return () => { stop = true; clearTimeout(timer.current); };
  }, [req, supabase]);

  useEffect(() => {
    if (!st?.req_expires_at || st.req_status !== 'SEARCHING') return;
    const i = setInterval(() => setLeft(Math.max(0, Math.round((new Date(st.req_expires_at) - Date.now()) / 1000))), 500);
    return () => clearInterval(i);
  }, [st]);

  async function submit(e) {
    e.preventDefault();
    if (!f.subject) return toast.error('Choose a subject.');
    if (f.type === 'PHYSICAL' && (!loc || !f.location.trim())) return toast.error('Share your location and describe where the lesson will be.');
    if (isParent && !f.child) return toast.error('Choose which child the lesson is for.');
    setBusy(true);
    const { data, error } = await supabase.rpc('create_instant_request', {
      p_subject: f.subject, p_type: f.type, p_duration: f.duration, p_location: f.type === 'PHYSICAL' ? f.location : null,
      p_lat: f.type === 'PHYSICAL' ? loc.lat : null, p_lng: f.type === 'PHYSICAL' ? loc.lng : null,
      p_notes: f.notes || null, p_method: f.method, p_child: isParent ? f.child : null,
    });
    setBusy(false);
    if (error) return toast.error(friendlyError(error));
    if (!data.offers) { toast.error('No teachers are available right now. Try again soon or book a scheduled lesson.'); return; }
    setSt(null); setReq({ id: data.id, expiresAt: data.expiresAt, offers: data.offers });
  }

  async function cancel() {
    const { error } = await supabase.rpc('cancel_instant_request', { p_request: req.id });
    if (error) return toast.error(friendlyError(error));
    toast('Request cancelled.'); setReq(null); setSt(null);
  }

  if (req) {
    const s = st?.req_status || 'SEARCHING';
    if (s === 'ACCEPTED') return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 text-center">
        <HiCheckCircle className="mx-auto text-teal-500" size={56} />
        <h2 className="mt-3 text-2xl font-extrabold">{st.teacher_name} accepted!</h2>
        <p className="mt-2 text-sm text-ink-600">{st.pay_method === 'TEACHER_CONNECT' && st.pay_status !== 'HELD'
          ? 'Pay now to confirm the lesson — your teacher will head over once payment is confirmed.' : 'Your lesson is confirmed. You can follow your teacher on the way.'}</p>
        <Link href="/student/bookings" className="btn-teal mt-6">Go to my booking</Link>
      </motion.div>
    );
    if (s === 'EXPIRED' || s === 'CANCELLED') return (
      <div className="card p-8 text-center">
        <HiClock className="mx-auto text-ink-400" size={48} />
        <h2 className="mt-3 text-xl font-extrabold">No teacher accepted in time</h2>
        <p className="mt-2 text-sm text-ink-600">Nobody was able to take this lesson right now. You can try again or schedule one for later.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => { setReq(null); setSt(null); }} className="btn-teal">Try again</button>
          <Link href="/teachers" className="btn-ghost">Schedule instead</Link>
        </div>
      </div>
    );
    return (
      <div className="card p-8 text-center" aria-live="polite">
        <div className="relative mx-auto h-24 w-24">
          <span className="absolute inset-0 animate-ping rounded-full bg-teal-500/30" />
          <span className="absolute inset-3 grid place-items-center rounded-full bg-brand-gradient text-white"><HiBolt size={30} /></span>
        </div>
        <h2 className="mt-5 text-xl font-extrabold">Finding you a teacher…</h2>
        <p className="mt-1 text-sm text-ink-600">Waiting on {st?.pending_offers ?? req.offers ?? '…'} teacher{(st?.pending_offers ?? req.offers) === 1 ? '' : 's'}{left ? ` · ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')} left` : ''}</p>
        <button onClick={cancel} className="btn-ghost mt-6">Cancel request</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      {isParent && (kids?.length ? (
        <label className="block text-xs font-bold text-ink-600">Who is the lesson for?
          <select value={f.child} onChange={(e) => setF({ ...f, child: e.target.value })} className={input}>{kids.map((k) => <option key={k.id} value={k.id}>{k.full_name}</option>)}</select>
        </label>
      ) : <p className="rounded-md bg-peach-100 p-3 text-sm">Add a child first: <Link className="font-bold underline" href="/parent/children">Add a child</Link></p>)}
      <label className="block text-xs font-bold text-ink-600">Subject
        <select value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} className={input} required>
          <option value="">Choose a subject</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-bold text-ink-600">Lesson type
          <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} className={input}><option value="PHYSICAL">In person</option><option value="ONLINE">Online</option></select>
        </label>
        <label className="block text-xs font-bold text-ink-600">Duration
          <select value={f.duration} onChange={(e) => setF({ ...f, duration: Number(e.target.value) })} className={input}>{[30, 60, 90, 120].map((d) => <option key={d} value={d}>{d} minutes</option>)}</select>
        </label>
      </div>
      {f.type === 'PHYSICAL' && (
        <div className="space-y-3">
          <LocationPicker value={loc} onChange={setLoc} compact />
          <label className="block text-xs font-bold text-ink-600">Where will the lesson take place?
            <input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} maxLength={200} placeholder="Neighbourhood, landmark, house description" className={input} />
          </label>
          <p className="text-xs text-ink-400">Your exact position is only shared with the teacher who accepts. Only verified teachers receive in-person instant requests.</p>
        </div>
      )}
      <label className="block text-xs font-bold text-ink-600">Payment method
        <select value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })} className={input}>{PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}</select>
      </label>
      <label className="block text-xs font-bold text-ink-600">Notes (optional)
        <textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} maxLength={500} rows={2} className={input} placeholder="Topic, exam, anything the teacher should know" />
      </label>
      <button disabled={busy} className="btn-teal w-full disabled:opacity-60"><HiBolt size={18} /> {busy ? 'Searching…' : 'Find a teacher now'}</button>
    </form>
  );
}

'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { HiMapPin, HiVideoCamera, HiClock } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';
import { friendlyError } from '@/lib/errors';
import { fmtDate, fmtTime, BOOKING_TONE } from '@/lib/format';
import { distanceKm, etaMinutes } from '@/lib/geo';
import SosButton from '@/components/lesson/SosButton';

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false, loading: () => <div className="h-[340px] animate-pulse rounded-lg bg-sky-100" /> });

const STEPS = [['CONFIRMED', 'Confirmed'], ['TEACHER_ARRIVING', 'On the way'], ['ARRIVED', 'Arrived'], ['IN_PROGRESS', 'In progress'], ['COMPLETED', 'Done']];

async function post(url, body) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || 'Something went wrong.');
  return j;
}

export default function LessonLive({ b: initial, isTeacher, target, initialPos, back, emergency }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [b, setB] = useState(initial);
  const [pos, setPos] = useState(initialPos);
  const [busy, setBusy] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [geoErr, setGeoErr] = useState('');
  const watch = useRef(null);
  const lastSent = useRef(0);
  const physical = b.lesson_type === 'PHYSICAL';

  // keep status + the teacher's position fresh (polling; the position row is deleted when they arrive)
  const refresh = useCallback(async () => {
    const [{ data: nb }, { data: ll }] = await Promise.all([
      supabase.from('booking_details').select('*').eq('id', initial.id).maybeSingle(),
      supabase.from('lesson_locations').select('latitude,longitude,updated_at').eq('booking_id', initial.id).maybeSingle(),
    ]);
    if (nb) setB(nb);
    setPos(ll ? { lat: ll.latitude, lng: ll.longitude, at: ll.updated_at } : null);
  }, [supabase, initial.id]);

  useEffect(() => {
    const live = ['COMPLETED', 'CANCELLED', 'REJECTED', 'EXPIRED'];
    if (live.includes(b.status)) return;
    const i = setInterval(refresh, 6000);
    return () => clearInterval(i);
  }, [refresh, b.status]);

  // teacher: stream position (at most every 8 s) only while TEACHER_ARRIVING
  useEffect(() => {
    if (!isTeacher || b.status !== 'TEACHER_ARRIVING') { stop(); return; }
    if (!navigator.geolocation) { setGeoErr('Your browser cannot share location.'); return; }
    setSharing(true); setGeoErr('');
    watch.current = navigator.geolocation.watchPosition(
      async (p) => {
        const now = Date.now();
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude, at: new Date().toISOString() });
        if (now - lastSent.current < 8000) return;
        lastSent.current = now;
        const { error } = await supabase.rpc('update_teacher_location', { p_booking: b.id, p_lat: p.coords.latitude, p_lng: p.coords.longitude, p_accuracy: p.coords.accuracy });
        if (error && /only while/i.test(error.message)) stop();
      },
      (e) => { setGeoErr(e.code === 1 ? 'Location permission denied — the student cannot see you on the map.' : 'Could not read your location.'); setSharing(false); },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTeacher, b.status]);
  function stop() { if (watch.current != null) navigator.geolocation.clearWatch(watch.current); watch.current = null; setSharing(false); }

  async function act(action, ok) {
    setBusy(true);
    try { const r = await post(`/api/bookings/${b.id}/status`, { action }); setB((x) => ({ ...x, status: r.status })); if (ok) toast.success(ok); router.refresh(); }
    catch (e) { toast.error(friendlyError(e)); }
    setBusy(false);
  }

  const km = pos && target ? distanceKm(pos, target) : null;
  const eta = etaMinutes(km);
  const stepIdx = STEPS.findIndex(([s]) => s === b.status);
  const stale = pos?.at && Date.now() - new Date(pos.at) > 60000;
  const showMap = physical && target && (pos || ['TEACHER_ARRIVING', 'ARRIVED'].includes(b.status));

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href={back} className="text-sm font-bold text-teal-600">← Back to bookings</Link>
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">{b.subject_name}{b.child_name ? ` · ${b.child_name}` : ''}</h1>
            <p className="text-sm text-ink-600">with {isTeacher ? b.student_name : b.teacher_name}</p>
            <ul className="mt-2 flex flex-wrap gap-x-5 text-sm text-ink-600">
              <li className="flex items-center gap-1.5"><HiClock /> {fmtDate(b.scheduled_date)} · {fmtTime(b.start_time)}–{fmtTime(b.end_time)}</li>
              <li className="flex items-center gap-1.5">{physical ? <><HiMapPin /> {b.location_text || 'In person'}</> : <><HiVideoCamera /> Online</>}</li>
            </ul>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${BOOKING_TONE[b.status]}`}>{b.status.replace('_', ' ')}</span>
        </div>

        {physical && stepIdx >= 0 && (
          <ol className="mt-6 grid grid-cols-5 gap-1 text-center text-[11px] font-bold" aria-label="Lesson progress">
            {STEPS.map(([s, label], i) => (
              <li key={s}><span className={`mx-auto mb-1 block h-2 rounded-full ${i <= stepIdx ? 'bg-brand-gradient' : 'bg-ink-200'}`} /><span className={i <= stepIdx ? 'text-navy-900' : 'text-ink-400'}>{label}</span></li>
            ))}
          </ol>
        )}
      </div>

      {showMap && (
        <div className="card p-4">
          {b.status === 'TEACHER_ARRIVING' && (
            <p className="mb-3 text-sm font-semibold" aria-live="polite">
              {isTeacher ? (sharing ? 'Sharing your live location with the student.' : geoErr || 'Starting location…')
                : pos ? <>Your teacher is about <b>{eta} min</b> away{km != null && <> ({km.toFixed(1)} km)</>}{stale && <span className="text-ink-400"> · last update a while ago</span>}.</> : 'Waiting for your teacher’s location…'}
            </p>
          )}
          {b.status === 'ARRIVED' && <p className="mb-3 text-sm font-bold text-teal-600">{isTeacher ? 'You have arrived.' : 'Your teacher has arrived.'}</p>}
          <MapView center={target} user={pos ? { lat: pos.lat, lng: pos.lng } : null} target={target} line={!!pos} height={340} />
          <p className="mt-2 text-xs text-ink-400">ETA is an estimate. {isTeacher ? 'Your position is shared only while you are on the way and is deleted when you arrive.' : ''}</p>
        </div>
      )}

      <div className="card space-y-3 p-6">
        {isTeacher && b.status === 'CONFIRMED' && physical && <button disabled={busy} onClick={() => act('onway', 'The student can now follow you.')} className="btn-teal w-full disabled:opacity-60">I&apos;m on my way</button>}
        {isTeacher && b.status === 'TEACHER_ARRIVING' && <button disabled={busy} onClick={() => act('arrived', 'Marked as arrived.')} className="btn-teal w-full disabled:opacity-60">I&apos;ve arrived</button>}
        {isTeacher && ['CONFIRMED', 'ARRIVED'].includes(b.status) && <button disabled={busy} onClick={() => act('start', 'Lesson started.')} className="btn-primary w-full disabled:opacity-60">Check in &amp; start lesson</button>}
        {isTeacher && b.status === 'IN_PROGRESS' && <button disabled={busy} onClick={() => act('complete', 'Lesson completed.')} className="btn-primary w-full disabled:opacity-60">Check out &amp; complete lesson</button>}
        {!isTeacher && b.status === 'ACCEPTED' && b.payment_method === 'TEACHER_CONNECT' && <Link href={back} className="btn-teal w-full">Pay to confirm this lesson</Link>}
        {!isTeacher && ['CONFIRMED', 'ACCEPTED', 'TEACHER_ARRIVING'].includes(b.status) && (
          <button disabled={busy} onClick={() => confirm('Cancel this lesson?') && act('cancel', 'Lesson cancelled.')} className="btn-ghost w-full">Cancel lesson</button>
        )}
        {b.status === 'IN_PROGRESS' && !isTeacher && <p className="text-center text-sm text-ink-600">Your lesson is in progress.</p>}
        {b.status === 'COMPLETED' && <p className="text-center text-sm font-semibold text-teal-600">Lesson completed. <Link href={back} className="underline">Go to bookings</Link> to leave a review.</p>}
        {['CANCELLED', 'REJECTED', 'EXPIRED'].includes(b.status) && <p className="text-center text-sm text-ink-600">This lesson is no longer active.</p>}
      </div>

      {['CONFIRMED', 'TEACHER_ARRIVING', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(b.status) && (
        <SosButton bookingId={b.id} emergency={emergency} active={b.status !== 'COMPLETED'} />
      )}
    </div>
  );
}

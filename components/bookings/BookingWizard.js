'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiCheck, HiArrowLeft } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';
import LocationPicker from '@/components/map/LocationPicker';
import { friendlyError } from '@/lib/errors';
import { PAYMENT_METHODS, DURATIONS, rateFor, priceFor, buildSlots } from '@/lib/booking';

const STEPS = ['Subject', 'Lesson type', 'Date & plan', 'Time', 'Duration', 'Location', 'Payment', 'Confirm'];
const fmt = (n, c) => `${Number(n).toLocaleString('en-US')} ${c === 'XAF' ? 'FCFA' : c}`;
const addDays = (s, n) => { const d = new Date(`${s}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const tile = (on) => `w-full rounded-lg border p-4 text-left transition ${on ? 'border-teal-500 bg-teal-100' : 'border-ink-200 bg-white hover:border-teal-500'}`;

export default function BookingWizard({ teacher, subjects, availability, packages = [], kids = [], isParent = false, after = '/student/bookings' }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState([]);
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({
    subjectId: subjects.length === 1 ? subjects[0].id : '',
    mode: teacher.offers_online ? 'ONLINE' : 'PHYSICAL',
    date: '', time: '', duration: 60, location: '', notes: '', method: 'TEACHER_CONNECT',
    repeat: 'ONCE', weeks: 4, packageId: '', childId: kids[0]?.id || '',
  });
  const [pin, setPin] = useState(null);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (!f.date) return;
    createClient().rpc('teacher_busy_slots', { p_teacher: teacher.id, p_date: f.date })
      .then(({ data }) => setBusy(data || []));
  }, [f.date, teacher.id]);

  const slots = useMemo(() => buildSlots({ date: f.date, duration: f.duration, availability, busy }), [f.date, f.duration, availability, busy]);
  const rate = rateFor(teacher, f.mode);
  const pkg = packages.find((p) => p.id === f.packageId) || null;
  const count = pkg ? pkg.lessons_count : f.repeat === 'WEEKLY' ? f.weeks : 1;
  const discount = pkg ? pkg.discount_percent : 0;
  const dates = f.date ? Array.from({ length: count }, (_, i) => addDays(f.date, i * 7)) : [];
  const one = priceFor(rate, f.duration);
  const price = one == null ? null : Math.round(one * (100 - discount) / 100) * count;
  const subjectName = subjects.find((s) => s.id === f.subjectId)?.name;
  const today = new Date().toISOString().slice(0, 10);

  // each step's gate
  const canNext = [
    !!f.subjectId && (!isParent || !!f.childId),
    true,
    !!f.date,
    !!f.time,
    true,
    f.mode === 'ONLINE' || f.location.trim().length >= 3,
    true,
    true,
  ][step];

  // reset time if it stops being valid
  useEffect(() => { if (f.time && !slots.includes(f.time)) set('time', ''); }, [slots]); // eslint-disable-line

  function next() {
    if (!canNext) return toast.error('Please complete this step.');
    // skip the location step for online lessons
    setStep((s) => (s === 4 && f.mode === 'ONLINE' ? 6 : s + 1));
  }
  const back = () => setStep((s) => (s === 6 && f.mode === 'ONLINE' ? 4 : s - 1));

  async function submit() {
    setSaving(true);
    const res = await fetch('/api/bookings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacherId: teacher.id, subjectId: f.subjectId, lessonType: f.mode, dates, startTime: f.time,
        childId: isParent ? f.childId : null, packageId: f.packageId || null, lat: pin?.lat ?? null, lng: pin?.lng ?? null,
        duration: f.duration, location: f.mode === 'PHYSICAL' ? f.location : null, notes: f.notes, paymentMethod: f.method,
      }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return toast.error(friendlyError(json.error, 'Could not create the booking.'));
    const skipped = json.skipped?.length || 0;
    toast.success(count > 1 ? `Request sent for ${json.ids.length} lessons.` : 'Request sent! The teacher will respond soon.');
    if (skipped) toast(`${skipped} date${skipped > 1 ? 's were' : ' was'} skipped because the teacher is busy then.`, { icon: 'ℹ️', duration: 7000 });
    router.push(after);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold md:text-3xl">Book a lesson with {teacher.full_name}</h1>

      <ol className="mt-6 flex gap-1.5" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-teal-500' : 'bg-ink-200'}`} title={s} />
        ))}
      </ol>
      <p className="mt-3 text-sm font-semibold text-ink-600">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>

      <div className="mt-6 min-h-[320px] rounded-xl bg-white p-6 shadow-card">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
            {step === 0 && (
              <div className="space-y-3">
                {isParent && (kids.length ? (
                  <label className="mb-2 block text-sm font-bold">Who is the lesson for?
                    <select value={f.childId} onChange={(e) => set('childId', e.target.value)} className="mt-2 h-12 w-full rounded-md border border-ink-200 bg-white px-4">
                      {kids.map((k) => <option key={k.id} value={k.id}>{k.full_name}</option>)}
                    </select>
                  </label>
                ) : <p className="rounded-md bg-peach-100 p-3 text-sm">Add a child before booking: <a className="font-bold underline" href="/parent/children">Add a child</a></p>)}
                {subjects.length === 0 && <p className="text-ink-600">This teacher has not listed any subjects yet.</p>}
                {subjects.map((s) => <button key={s.id} onClick={() => set('subjectId', s.id)} className={tile(f.subjectId === s.id)}><b>{s.name}</b></button>)}
              </div>
            )}
            {step === 1 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {teacher.offers_online && <button onClick={() => set('mode', 'ONLINE')} className={tile(f.mode === 'ONLINE')}><b>Online</b><p className="mt-1 text-sm text-ink-600">{fmt(rateFor(teacher, 'ONLINE') ?? 0, teacher.currency)}/hr</p></button>}
                {teacher.offers_physical && <button onClick={() => set('mode', 'PHYSICAL')} className={tile(f.mode === 'PHYSICAL')}><b>In person</b><p className="mt-1 text-sm text-ink-600">{fmt(rateFor(teacher, 'PHYSICAL') ?? 0, teacher.currency)}/hr</p></button>}
              </div>
            )}
            {step === 2 && (
              <div className="space-y-5">
                <label className="block text-sm font-bold">{count > 1 ? 'First lesson date' : 'Choose a date'}
                  <input type="date" min={today} value={f.date} onChange={(e) => set('date', e.target.value)} className="mt-2 h-12 w-full rounded-md border border-ink-200 px-4 outline-none focus:border-teal-500" />
                </label>
                {packages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-bold">Lesson package</p>
                    <button type="button" onClick={() => set('packageId', '')} className={tile(!f.packageId)}><b>Single or repeating lessons</b></button>
                    {packages.map((p) => (
                      <button type="button" key={p.id} onClick={() => setF((s) => ({ ...s, packageId: p.id, duration: p.lesson_minutes, repeat: 'ONCE' }))} className={tile(f.packageId === p.id)}>
                        <span className="flex items-center justify-between"><b>{p.title}</b><span className="rounded-full bg-brandyellow-500 px-2 py-0.5 text-[10px] font-bold">Save {p.discount_percent}%</span></span>
                        <span className="text-sm text-ink-600">{p.lessons_count} weekly lessons · {p.lesson_minutes} min each</span>
                      </button>
                    ))}
                  </div>
                )}
                {!pkg && (
                  <div className="space-y-2">
                    <p className="text-sm font-bold">Repeat</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => set('repeat', 'ONCE')} className={tile(f.repeat === 'ONCE')}><b>Just once</b></button>
                      <button type="button" onClick={() => set('repeat', 'WEEKLY')} className={tile(f.repeat === 'WEEKLY')}><b>Every week</b></button>
                    </div>
                    {f.repeat === 'WEEKLY' && (
                      <label className="block text-sm font-semibold">For how many weeks?
                        <select value={f.weeks} onChange={(e) => set('weeks', Number(e.target.value))} className="ml-3 h-10 rounded-md border border-ink-200 bg-white px-3">
                          {[2, 3, 4, 6, 8, 10, 12].map((n) => <option key={n} value={n}>{n} weeks</option>)}
                        </select>
                      </label>
                    )}
                  </div>
                )}
              </div>
            )}
            {step === 3 && (
              slots.length ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((t) => <button key={t} onClick={() => set('time', t)} className={`rounded-full border py-3 text-sm font-semibold ${f.time === t ? 'border-teal-500 bg-teal-500 text-white' : 'border-ink-200 hover:border-teal-500'}`}>{t}</button>)}
                </div>
              ) : <p className="text-ink-600">No free times on this date for a {f.duration}-minute lesson. Try another date or a shorter duration.</p>
            )}
            {step === 4 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {pkg && <p className="col-span-full text-sm text-ink-600">Your package fixes each lesson at {pkg.lesson_minutes} minutes.</p>}
                {DURATIONS.map((d) => <button key={d} disabled={!!pkg} onClick={() => set('duration', d)} className={`${tile(f.duration === d)} disabled:cursor-not-allowed disabled:opacity-50`}><b>{d} min</b>{rate != null && <p className="text-sm text-ink-600">{fmt(priceFor(rate, d), teacher.currency)}</p>}</button>)}
              </div>
            )}
            {step === 5 && (
              <div className="space-y-4">
                <label className="block text-sm font-bold">Where should the lesson take place?
                  <input value={f.location} onChange={(e) => set('location', e.target.value)} placeholder="Neighbourhood, street, landmark" className="mt-2 h-12 w-full rounded-md border border-ink-200 px-4 outline-none focus:border-teal-500" />
                </label>
                <div>
                  <p className="mb-2 text-sm font-bold">Pin your location (optional)</p>
                  <LocationPicker value={pin} onChange={setPin} compact />
                  <p className="mt-2 text-xs text-ink-400">Lets you see your teacher arrive on a map. Only you and your teacher can see it.</p>
                </div>
                <label className="block text-sm font-bold">Notes for the teacher (optional)
                  <textarea value={f.notes} onChange={(e) => set('notes', e.target.value)} rows={3} maxLength={500} className="mt-2 w-full rounded-md border border-ink-200 p-4 outline-none focus:border-teal-500" />
                </label>
              </div>
            )}
            {step === 6 && (
              <div className="space-y-3">
                {PAYMENT_METHODS.map((m) => (
                  <button key={m.value} onClick={() => set('method', m.value)} className={tile(f.method === m.value)}>
                    <span className="flex items-center gap-2 font-bold">{m.label}{m.recommended && <span className="rounded-full bg-brandyellow-500 px-2 py-0.5 text-[10px]">Recommended</span>}</span>
                    <span className="text-sm text-ink-600">{m.hint}</span>
                  </button>
                ))}
                {f.method !== 'TEACHER_CONNECT' && <p className="rounded-md bg-peach-100 p-3 text-xs">Payments made outside the app are recorded but not protected by Teacher Connect dispute resolution.</p>}
              </div>
            )}
            {step === 7 && (
              <div>
                <h2 className="text-lg font-bold">Booking summary</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <Row k="Teacher" v={teacher.full_name} />
                  <Row k="Subject" v={subjectName} />
                  <Row k="Type" v={f.mode === 'ONLINE' ? 'Online' : 'In person'} />
                  {isParent && <Row k="For" v={kids.find((k) => k.id === f.childId)?.full_name} />}
                  <Row k="Date & time" v={`${f.date} at ${f.time}`} />
                  {count > 1 && <Row k="Lessons" v={`${count} weekly lessons, ${dates[0]} to ${dates[count - 1]}`} />}
                  {pkg && <Row k="Package" v={`${pkg.title} (${discount}% off)`} />}
                  <Row k="Duration" v={`${f.duration} minutes`} />
                  {f.mode === 'PHYSICAL' && <Row k="Location" v={f.location} />}
                  <Row k="Payment" v={PAYMENT_METHODS.find((m) => m.value === f.method)?.label} />
                  <div className="flex justify-between border-t border-ink-200 pt-4 text-base"><dt className="font-bold">Total{count > 1 ? ` (${count} lessons)` : ''}</dt><dd className="font-extrabold text-teal-600">{price == null ? '—' : fmt(price, teacher.currency)}</dd></div>
                </dl>
                <p className="mt-4 text-xs text-ink-600">The final price is confirmed by our server. {count > 1 && 'Each lesson is accepted and paid separately. '}{f.method === 'TEACHER_CONNECT' && 'You pay after the teacher accepts.'}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button onClick={back} disabled={step === 0} className="btn-ghost disabled:opacity-40"><HiArrowLeft /> Back</button>
        {step < STEPS.length - 1
          ? <button onClick={next} className="btn-primary px-10">Continue</button>
          : <button onClick={submit} disabled={saving} className="btn-teal px-10 disabled:opacity-60"><HiCheck size={18} /> {saving ? 'Sending…' : 'Confirm Booking'}</button>}
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return <div className="flex justify-between gap-4"><dt className="text-ink-600">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>;
}

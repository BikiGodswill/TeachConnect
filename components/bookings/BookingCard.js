'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { friendlyError } from '@/lib/errors';
import { HiCalendarDays, HiClock, HiMapPin, HiVideoCamera, HiArrowTopRightOnSquare } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';
import { money, fmtDate, fmtTime, BOOKING_TONE, PAYMENT_LABEL, DISPUTE_REASONS } from '@/lib/format';
import { FaStar } from 'react-icons/fa';

async function post(url, body) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Something went wrong.');
  return json;
}

export default function BookingCard({ b, viewer }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [panel, setPanel] = useState(null); // 'dispute' | 'review'
  const isTeacher = viewer === 'TEACHER';
  const offPlatform = b.payment_method && b.payment_method !== 'TEACHER_CONNECT';
  const inWindow = b.payment_status === 'HELD' && b.held_until && new Date(b.held_until) > new Date();

  async function run(fn, ok) {
    setBusy(true);
    try { await fn(); if (ok) toast.success(ok); router.refresh(); }
    catch (e) { toast.error(friendlyError(e)); }
    finally { setBusy(false); }
  }
  const status = (action) => run(() => post(`/api/bookings/${b.id}/status`, { action }), 'Updated.');
  const pay = () => run(async () => { const { url } = await post('/api/payments/initiate', { bookingId: b.id }); window.location.href = url; });
  const confirmOff = () => run(() => post('/api/payments/confirm-offplatform', { paymentId: b.payment_id }), 'Recorded.');

  const series = (accept) => run(() => post('/api/series', { seriesId: b.series_id, accept }), accept ? 'All lessons accepted.' : 'All lessons declined.');
  const live = ['CONFIRMED', 'TEACHER_ARRIVING', 'ARRIVED', 'IN_PROGRESS'].includes(b.status);

  const Btn = ({ onClick, children, kind = 'primary' }) => (
    <button disabled={busy} onClick={onClick} className={`btn-${kind} h-10 px-5 text-xs disabled:opacity-50`}>{children}</button>
  );

  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">{b.subject_name} <span className="font-medium text-ink-600">with {isTeacher ? b.student_name : b.teacher_name}</span></h3>
          {(b.child_name || b.series_id || b.discount_percent > 0) && (
            <p className="mt-1 flex flex-wrap gap-2 text-xs font-bold">
              {b.child_name && <span className="rounded-full bg-lavender-100 px-2.5 py-1">For {b.child_name}</span>}
              {b.series_id && <span className="rounded-full bg-sky-100 px-2.5 py-1">Repeating lessons</span>}
              {b.discount_percent > 0 && <span className="rounded-full bg-teal-500/10 px-2.5 py-1 text-teal-600">{b.discount_percent}% package discount</span>}
            </p>
          )}
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-600">
            <li className="flex items-center gap-1.5"><HiCalendarDays /> {fmtDate(b.scheduled_date)}</li>
            <li className="flex items-center gap-1.5"><HiClock /> {fmtTime(b.start_time)} – {fmtTime(b.end_time)}</li>
            <li className="flex items-center gap-1.5">{b.lesson_type === 'ONLINE' ? <><HiVideoCamera /> Online</> : <><HiMapPin /> {b.location_text || 'In person'}</>}</li>
          </ul>
        </div>
        <div className="text-right">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${BOOKING_TONE[b.status]}`}>{b.status.replace('_', ' ')}</span>
          <p className="mt-2 font-heading text-lg font-extrabold">{money(isTeacher && b.teacher_amount ? b.teacher_amount : b.price, b.currency)}</p>
          {b.payment_status && <p className="text-xs text-ink-600">{PAYMENT_LABEL[b.payment_status]}</p>}
        </div>
      </div>
      {b.notes && <p className="mt-3 rounded-md bg-sky-50 p-3 text-sm text-ink-600">{b.notes}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {/* teacher actions */}
        {isTeacher && b.status === 'REQUESTED' && <><Btn onClick={() => status('accept')}>Accept</Btn><Btn kind="ghost" onClick={() => status('reject')}>Decline</Btn></>}
        {isTeacher && b.status === 'REQUESTED' && b.series_id && b.series_pending > 1 && (
          <><Btn kind="teal" onClick={() => series(true)}>Accept all {b.series_pending}</Btn><Btn kind="ghost" onClick={() => confirm(`Decline all ${b.series_pending} lessons?`) && series(false)}>Decline all</Btn></>
        )}
        {live && <Link href={`/lesson/${b.id}`} className="btn-teal h-10 px-5 text-xs"><HiArrowTopRightOnSquare size={16} /> {b.lesson_type === 'PHYSICAL' ? 'Open lesson' : 'Lesson details'}</Link>}
        {isTeacher && b.status === 'ACCEPTED' && offPlatform && <Btn onClick={() => status('confirm')}>Confirm lesson</Btn>}
        {isTeacher && b.status === 'ACCEPTED' && !offPlatform && <p className="self-center text-xs text-ink-600">Waiting for the student to pay in the app.</p>}
        {isTeacher && b.status === 'CONFIRMED' && b.lesson_type === 'ONLINE' && <Btn onClick={() => status('start')}>Start lesson</Btn>}
        {isTeacher && b.status === 'IN_PROGRESS' && b.lesson_type === 'ONLINE' && <Btn onClick={() => status('complete')}>Complete lesson</Btn>}

        {/* student actions */}
        {!isTeacher && b.status === 'ACCEPTED' && b.payment_method === 'TEACHER_CONNECT' && b.payment_status === 'UNPAID' && <Btn kind="teal" onClick={pay}>Pay {money(b.price, b.currency)}</Btn>}
        {!isTeacher && ['REQUESTED', 'ACCEPTED', 'CONFIRMED'].includes(b.status) && <Btn kind="ghost" onClick={() => confirm('Cancel this booking?') && status('cancel')}>Cancel</Btn>}
        {!isTeacher && b.status === 'COMPLETED' && inWindow && <Btn kind="ghost" onClick={() => setPanel(panel === 'dispute' ? null : 'dispute')}>Report a problem</Btn>}
        {!isTeacher && b.status === 'COMPLETED' && !b.review_id && <Btn onClick={() => setPanel(panel === 'review' ? null : 'review')}>Leave a review</Btn>}

        {/* off-platform payment record (both sides) */}
        {offPlatform && b.payment_status === 'UNPAID' && ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(b.status) && (
          <Btn kind="ghost" onClick={confirmOff}>{isTeacher ? (b.confirmed_by_teacher ? 'Waiting for student' : 'Payment received') : (b.confirmed_by_student ? 'Waiting for teacher' : 'I paid')}</Btn>
        )}
      </div>

      {panel === 'dispute' && <DisputeForm b={b} onDone={() => { setPanel(null); router.refresh(); }} />}
      {panel === 'review' && <ReviewForm b={b} onDone={() => { setPanel(null); router.refresh(); }} />}
    </article>
  );
}

function DisputeForm({ b, onDone }) {
  const [reason, setReason] = useState('TEACHER_NO_SHOW');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true);
    try { await post('/api/disputes', { paymentId: b.payment_id, reason, description: text }); toast.success('Dispute opened. Funds are frozen while we review.'); onDone(); }
    catch (err) { toast.error(friendlyError(err)); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="mt-4 space-y-3 rounded-lg bg-peach-100 p-4">
      <select value={reason} onChange={(e) => setReason(e.target.value)} className="h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm">
        {DISPUTE_REASONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <textarea required minLength={10} value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Describe what happened" className="w-full rounded-md border border-ink-200 p-3 text-sm" />
      <button disabled={busy} className="btn-primary h-10 px-6 text-xs">Submit dispute</button>
    </form>
  );
}

function ReviewForm({ b, onDone }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('reviews').insert({ booking_id: b.id, reviewer_id: user.id, teacher_id: b.teacher_id, rating, comment: comment.trim() || null });
    setBusy(false);
    if (error) return toast.error(error.message.includes('duplicate') ? 'You already reviewed this lesson.' : 'Could not save your review.');
    toast.success('Thanks for your review!'); onDone();
  }
  return (
    <form onSubmit={submit} className="mt-4 space-y-3 rounded-lg bg-sky-50 p-4">
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} stars`} role="radio" aria-checked={n === rating}
            className={n <= rating ? 'text-brandyellow-500' : 'text-ink-200'}><FaStar size={26} /></button>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} maxLength={1000} placeholder="Share your experience (optional)" className="w-full rounded-md border border-ink-200 p-3 text-sm" />
      <button disabled={busy} className="btn-teal h-10 px-6 text-xs">Submit review</button>
    </form>
  );
}

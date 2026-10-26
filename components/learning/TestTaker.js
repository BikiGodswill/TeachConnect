'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { friendlyError } from '@/lib/errors';

export default function TestTaker({ attemptId, title, resuming }) {
  const router = useRouter();
  const supabase = createClient();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [left, setLeft] = useState(null);
  const [busy, setBusy] = useState(false);
  const sent = useRef(false);

  const submit = useCallback(async (auto = false) => {
    if (sent.current) return; sent.current = true; setBusy(true);
    const { data, error } = await supabase.rpc('submit_test', { p_attempt: attemptId, p_answers: answers });
    if (error) { sent.current = false; setBusy(false); return toast.error(friendlyError(error)); }
    toast.success(auto || data?.timedOut ? 'Time is up — your test was submitted.' : 'Test submitted.');
    router.refresh();
  }, [answers, attemptId, router, supabase]);

  async function start() {
    setBusy(true);
    const { data, error } = await supabase.rpc('start_test', { p_attempt: attemptId });
    setBusy(false);
    if (error) { toast.error(friendlyError(error)); return router.refresh(); }
    setTest(data);
  }
  useEffect(() => { if (resuming) start(); /* eslint-disable-next-line */ }, []);

  useEffect(() => {
    if (!test?.deadline) return;
    const tick = () => { const s = Math.round((new Date(test.deadline) - Date.now()) / 1000); setLeft(s); if (s <= 0) submit(true); };
    tick(); const i = setInterval(tick, 1000); return () => clearInterval(i);
  }, [test, submit]);

  if (!test) return (
    <div className="card space-y-3 p-6 text-center">
      <h1 className="text-2xl font-extrabold">{title}</h1>
      <p className="text-sm text-ink-600">Once you start, the timer (if any) cannot be paused. Answer all questions, then submit.</p>
      <button onClick={start} disabled={busy} className="btn-teal disabled:opacity-60">{busy ? 'Starting…' : resuming ? 'Continue test' : 'Start test'}</button>
    </div>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (confirm('Submit your answers now?')) submit(); }} className="space-y-4">
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-lg bg-white p-4 shadow-card">
        <h1 className="font-bold">{test.title}</h1>
        {left != null && <span className={`rounded-full px-3 py-1 text-sm font-bold ${left < 60 ? 'bg-peach-100 text-danger' : 'bg-sky-100'}`} aria-live="off">{Math.max(0, Math.floor(left / 60))}:{String(Math.max(0, left % 60)).padStart(2, '0')}</span>}
      </div>
      {test.instructions && <p className="rounded-md bg-sky-100 p-3 text-sm">{test.instructions}</p>}
      {test.questions.map((q) => (
        <fieldset key={q.id} className="card space-y-3 p-5">
          <legend className="sr-only">Question {q.position}</legend>
          <p className="font-semibold">{q.position}. {q.prompt} <span className="text-xs font-normal text-ink-400">({q.points} pt{q.points > 1 ? 's' : ''})</span></p>
          {q.kind === 'MCQ' && q.options.map((o, i) => (
            <label key={i} className="flex items-center gap-2 text-sm"><input type="radio" name={q.id} checked={answers[q.id] === i} onChange={() => setAnswers({ ...answers, [q.id]: i })} className="accent-teal-500" /> {o}</label>
          ))}
          {q.kind === 'TRUE_FALSE' && [true, false].map((v) => (
            <label key={String(v)} className="flex items-center gap-2 text-sm"><input type="radio" name={q.id} checked={answers[q.id] === v} onChange={() => setAnswers({ ...answers, [q.id]: v })} className="accent-teal-500" /> {v ? 'True' : 'False'}</label>
          ))}
          {q.kind === 'SHORT' && <input value={answers[q.id] ?? ''} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} maxLength={200} className="w-full rounded-md border border-ink-200 px-4 py-3 text-sm outline-none focus:border-teal-500" placeholder="Your answer" />}
        </fieldset>
      ))}
      <button disabled={busy} className="btn-teal w-full disabled:opacity-60">{busy ? 'Submitting…' : 'Submit test'}</button>
    </form>
  );
}

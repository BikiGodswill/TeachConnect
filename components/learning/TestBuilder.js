'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { HiTrash, HiPlus } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';
import { friendlyError } from '@/lib/errors';

const input = 'mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500';
const blank = (kind = 'MCQ') => ({ kind, prompt: '', points: 1, options: ['', '', '', ''], correct: 0, tf: true, accepted: '' });

export default function TestBuilder() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [minutes, setMinutes] = useState('');
  const [qs, setQs] = useState([blank()]);
  const [busy, setBusy] = useState(false);
  const set = (i, patch) => setQs((l) => l.map((q, j) => (j === i ? { ...q, ...patch } : q)));

  async function save(e) {
    e.preventDefault();
    const questions = [];
    for (const [i, q] of qs.entries()) {
      if (!q.prompt.trim()) return toast.error(`Question ${i + 1} needs a question.`);
      if (q.kind === 'MCQ') {
        const opts = q.options.map((o) => o.trim()).filter(Boolean);
        if (opts.length < 2) return toast.error(`Question ${i + 1} needs at least 2 options.`);
        const correctText = q.options[q.correct]?.trim();
        if (!correctText) return toast.error(`Question ${i + 1}: mark a filled option as correct.`);
        questions.push({ kind: 'MCQ', prompt: q.prompt.trim(), points: Number(q.points) || 1, options: opts, answer: opts.indexOf(correctText) });
      } else if (q.kind === 'TRUE_FALSE') {
        questions.push({ kind: 'TRUE_FALSE', prompt: q.prompt.trim(), points: Number(q.points) || 1, answer: !!q.tf });
      } else {
        const acc = q.accepted.split('|').map((s) => s.trim()).filter(Boolean);
        if (!acc.length) return toast.error(`Question ${i + 1} needs an accepted answer.`);
        questions.push({ kind: 'SHORT', prompt: q.prompt.trim(), points: Number(q.points) || 1, answer: acc });
      }
    }
    setBusy(true);
    const { error } = await createClient().rpc('create_test', { p_title: title.trim(), p_instructions: instructions.trim() || null, p_minutes: minutes ? Number(minutes) : null, p_questions: questions });
    setBusy(false);
    if (error) return toast.error(friendlyError(error));
    toast.success('Test created.'); setTitle(''); setInstructions(''); setMinutes(''); setQs([blank()]); router.refresh();
  }

  return (
    <form onSubmit={save} className="card space-y-4 p-6">
      <h2 className="text-lg font-bold">Create a test</h2>
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <label className="block text-xs font-bold text-ink-600">Title<input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} maxLength={120} className={input} /></label>
        <label className="block text-xs font-bold text-ink-600">Time limit (minutes, optional)<input type="number" min={1} max={240} value={minutes} onChange={(e) => setMinutes(e.target.value)} className={input} /></label>
      </div>
      <label className="block text-xs font-bold text-ink-600">Instructions (optional)<textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={2} maxLength={2000} className={input} /></label>
      {qs.map((q, i) => (
        <fieldset key={i} className="space-y-3 rounded-lg bg-sky-50 p-4">
          <div className="flex items-center justify-between gap-2">
            <legend className="text-sm font-bold">Question {i + 1}</legend>
            {qs.length > 1 && <button type="button" aria-label="Remove question" onClick={() => setQs((l) => l.filter((_, j) => j !== i))} className="text-danger"><HiTrash size={18} /></button>}
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <input value={q.prompt} onChange={(e) => set(i, { prompt: e.target.value })} maxLength={1000} placeholder="Type the question" className={input} aria-label="Question" />
            <select value={q.kind} onChange={(e) => set(i, { kind: e.target.value })} className={input} aria-label="Type"><option value="MCQ">Multiple choice</option><option value="TRUE_FALSE">True / false</option><option value="SHORT">Short answer</option></select>
            <input type="number" min={1} max={20} value={q.points} onChange={(e) => set(i, { points: e.target.value })} className={`${input} w-20`} aria-label="Points" title="Points" />
          </div>
          {q.kind === 'MCQ' && q.options.map((o, k) => (
            <label key={k} className="flex items-center gap-2 text-sm">
              <input type="radio" name={`c${i}`} checked={q.correct === k} onChange={() => set(i, { correct: k })} className="accent-teal-500" aria-label={`Option ${k + 1} is correct`} />
              <input value={o} onChange={(e) => set(i, { options: q.options.map((x, j) => (j === k ? e.target.value : x)) })} placeholder={`Option ${k + 1}`} className={input} />
            </label>
          ))}
          {q.kind === 'TRUE_FALSE' && (
            <div className="flex gap-4 text-sm font-semibold">
              <label><input type="radio" checked={q.tf} onChange={() => set(i, { tf: true })} className="mr-1 accent-teal-500" />True</label>
              <label><input type="radio" checked={!q.tf} onChange={() => set(i, { tf: false })} className="mr-1 accent-teal-500" />False</label>
            </div>
          )}
          {q.kind === 'SHORT' && <label className="block text-xs font-bold text-ink-600">Accepted answers, separated by |<input value={q.accepted} onChange={(e) => set(i, { accepted: e.target.value })} placeholder="Yaoundé | Yaounde" className={input} /></label>}
        </fieldset>
      ))}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => setQs((l) => (l.length >= 50 ? l : [...l, blank()]))} className="btn-ghost h-10 px-5 text-xs"><HiPlus /> Add question</button>
        <button disabled={busy} className="btn-teal h-10 px-6 text-xs disabled:opacity-60">{busy ? 'Saving…' : 'Save test'}</button>
      </div>
    </form>
  );
}

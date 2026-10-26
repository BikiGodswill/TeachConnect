'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

const input = 'mt-1 w-full rounded-md border border-ink-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500';
const MODES = {
  student: [['explain', 'Explain a topic'], ['quiz', 'Practice questions'], ['summary', 'Summarise my notes']],
  teacher: [['lesson_plan', 'Lesson plan'], ['quiz', 'Practice questions'], ['feedback', 'Feedback on work'], ['explain', 'Explain a topic']],
};

export default function AiAssistant({ role = 'student', enabled }) {
  const modes = MODES[role] || MODES.student;
  const [mode, setMode] = useState(modes[0][0]);
  const [prompt, setPrompt] = useState('');
  const [out, setOut] = useState('');
  const [left, setLeft] = useState(null);
  const [busy, setBusy] = useState(false);

  if (!enabled) return (
    <section className="card p-6 text-sm text-ink-600">
      <h2 className="mb-1 font-bold text-navy-900">AI assistant</h2>
      The AI assistant is not switched on for this site yet.
    </section>
  );

  async function ask(e) {
    e.preventDefault(); setBusy(true); setOut('');
    try {
      const res = await fetch('/api/ai/assist', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode, prompt }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Something went wrong.');
      setOut(j.text); setLeft(j.left);
    } catch (err) { toast.error(err.message); }
    setBusy(false);
  }

  return (
    <section className="card space-y-3 p-6">
      <h2 className="font-bold">AI assistant</h2>
      <div className="flex flex-wrap gap-2">{modes.map(([v, l]) => <button key={v} type="button" onClick={() => setMode(v)} className={`rounded-full border px-4 py-2 text-xs font-bold ${mode === v ? 'border-teal-500 bg-teal-500 text-white' : 'border-ink-200'}`}>{l}</button>)}</div>
      <form onSubmit={ask} className="space-y-3">
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} maxLength={4000} required placeholder="Type your topic, question or text" className={input} />
        <button disabled={busy} className="btn-teal disabled:opacity-60">{busy ? 'Thinking…' : 'Ask'}</button>
        {left != null && <span className="ml-3 text-xs text-ink-400">{left} requests left today</span>}
      </form>
      {out && <div className="whitespace-pre-wrap rounded-md bg-sky-50 p-4 text-sm">{out}</div>}
      <p className="text-xs text-ink-400">AI answers can be wrong. Check important facts with your teacher.</p>
    </section>
  );
}

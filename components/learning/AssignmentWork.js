'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { friendlyError } from '@/lib/errors';
import { uploadLearningFile, openLearningFile } from '@/lib/learner';

const input = 'mt-1 w-full rounded-md border border-ink-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500';

export default function AssignmentWork({ a, sub, isTeacher }) {
  const router = useRouter();
  const supabase = createClient();
  const [busy, setBusy] = useState(false);
  const graded = !!sub?.graded_at;

  async function openFile(path) { try { await openLearningFile(supabase, path); } catch (e) { toast.error(friendlyError(e)); } }
  async function run(fn, ok) { setBusy(true); try { await fn(); toast.success(ok); router.refresh(); } catch (e) { toast.error(friendlyError(e)); } setBusy(false); }

  async function submit(e) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    run(async () => {
      const file = f.get('file'); let path = null, name = null;
      if (file && file.size) { path = await uploadLearningFile(supabase, a.id, 'student', file); name = file.name; }
      else if (sub?.file_path && f.get('keep')) { path = sub.file_path; name = sub.file_name; }
      const { error } = await supabase.rpc('submit_assignment', { p_assignment: a.id, p_text: String(f.get('text') || ''), p_file_path: path, p_file_name: name });
      if (error) throw error;
    }, 'Work submitted.');
  }
  async function grade(e) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    run(async () => { const { error } = await supabase.rpc('grade_assignment', { p_assignment: a.id, p_score: Number(f.get('score')), p_feedback: String(f.get('feedback') || '') }); if (error) throw error; }, 'Graded.');
  }

  return (
    <div className="space-y-5">
      {sub && (
        <section className="card space-y-2 p-5">
          <h2 className="font-bold">Submitted work {sub.is_late && <span className="ml-2 rounded-full bg-peach-100 px-2 py-0.5 text-[10px] text-danger">Late</span>}</h2>
          <p className="text-xs text-ink-400">{new Date(sub.submitted_at).toLocaleString('en-GB')}</p>
          {sub.text_answer && <p className="whitespace-pre-wrap rounded-md bg-sky-50 p-3 text-sm">{sub.text_answer}</p>}
          {sub.file_path && <button onClick={() => openFile(sub.file_path)} className="text-sm font-bold text-teal-600 underline">Open {sub.file_name || 'attachment'}</button>}
        </section>
      )}
      {graded && (
        <section className="card space-y-2 bg-teal-100/60 p-5">
          <h2 className="font-bold">Mark: {sub.score} / {a.max_score}</h2>
          {sub.feedback && <p className="whitespace-pre-wrap text-sm">{sub.feedback}</p>}
        </section>
      )}
      {!isTeacher && !graded && (
        <form onSubmit={submit} className="card space-y-3 p-5">
          <h2 className="font-bold">{sub ? 'Update your work' : 'Your answer'}</h2>
          <textarea name="text" rows={6} maxLength={10000} defaultValue={sub?.text_answer || ''} className={input} placeholder="Type your answer here" />
          <label className="block text-xs font-bold text-ink-600">Attach a file (PDF, image, Word — max 10 MB)<input name="file" type="file" accept="image/*,.pdf,.doc,.docx,.txt" className={input} /></label>
          {sub?.file_path && <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="keep" defaultChecked className="accent-teal-500" /> Keep my earlier file ({sub.file_name})</label>}
          <button disabled={busy} className="btn-teal disabled:opacity-60">{busy ? 'Sending…' : sub ? 'Resubmit' : 'Submit work'}</button>
        </form>
      )}
      {isTeacher && sub && !graded && (
        <form onSubmit={grade} className="card space-y-3 p-5">
          <h2 className="font-bold">Grade this work</h2>
          <label className="block text-xs font-bold text-ink-600">Mark out of {a.max_score}<input name="score" type="number" required min={0} max={a.max_score} className={input} /></label>
          <label className="block text-xs font-bold text-ink-600">Feedback<textarea name="feedback" rows={4} maxLength={4000} className={input} /></label>
          <button disabled={busy} className="btn-teal disabled:opacity-60">{busy ? 'Saving…' : 'Save grade'}</button>
        </form>
      )}
      {isTeacher && !sub && <p className="text-sm text-ink-600">The student has not submitted yet.</p>}
    </div>
  );
}

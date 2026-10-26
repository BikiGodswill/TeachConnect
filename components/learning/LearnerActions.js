'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { friendlyError } from '@/lib/errors';
import { uploadLearningFile } from '@/lib/learner';

const input = 'mt-1 w-full rounded-md border border-ink-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500';
const TABS = [['note', 'Lesson note'], ['assignment', 'Assignment'], ['test', 'Test'], ['plan', 'Learning plan'], ['cert', 'Certificate']];
const iso = (v) => (v ? new Date(v).toISOString() : null);

export default function LearnerActions({ studentId, childId, tests }) {
  const router = useRouter();
  const supabase = createClient();
  const [tab, setTab] = useState('note');
  const [busy, setBusy] = useState(false);

  async function run(fn, ok, form) {
    setBusy(true);
    try { await fn(); toast.success(ok); form?.reset(); router.refresh(); }
    catch (e) { toast.error(friendlyError(e)); }
    setBusy(false);
  }
  const rpc = async (name, args) => { const { error } = await supabase.rpc(name, args); if (error) throw error; };
  const str = (f, k) => String(f.get(k) || '').trim();

  const forms = {
    note: (e) => { e.preventDefault(); const f = new FormData(e.currentTarget);
      run(() => rpc('add_progress_note', { p_student: studentId, p_child: childId, p_booking: null, p_topics: str(f, 'topics'), p_strengths: str(f, 'strengths'), p_weaknesses: str(f, 'weaknesses'), p_comment: str(f, 'comment'), p_understanding: Number(f.get('understanding')) || null }), 'Note saved.', e.currentTarget); },
    assignment: (e) => { e.preventDefault(); const form = e.currentTarget; const f = new FormData(form);
      run(async () => {
        const id = crypto.randomUUID(); const file = f.get('file');
        let path = null, name = null;
        if (file && file.size) { path = await uploadLearningFile(supabase, id, 'teacher', file); name = file.name; }
        await rpc('create_assignment', { p_id: id, p_student: studentId, p_child: childId, p_title: str(f, 'title'), p_instructions: str(f, 'instructions'), p_due: iso(f.get('due')), p_max: Number(f.get('max')) || 100, p_attachment_path: path, p_attachment_name: name });
      }, 'Assignment sent.', form); },
    test: (e) => { e.preventDefault(); const f = new FormData(e.currentTarget);
      if (!f.get('test')) return toast.error('Choose a test.');
      run(() => rpc('assign_test', { p_test: f.get('test'), p_student: studentId, p_child: childId, p_due: iso(f.get('due')) }), 'Test assigned.', e.currentTarget); },
    plan: (e) => { e.preventDefault(); const f = new FormData(e.currentTarget);
      const objectives = str(f, 'objectives').split('\n').map((s) => s.trim()).filter(Boolean);
      run(() => rpc('create_plan', { p_student: studentId, p_child: childId, p_title: str(f, 'title'), p_goal: str(f, 'goal'), p_target: f.get('target') || null, p_objectives: objectives }), 'Plan created.', e.currentTarget); },
    cert: (e) => { e.preventDefault(); const f = new FormData(e.currentTarget);
      run(() => rpc('issue_certificate', { p_student: studentId, p_child: childId, p_title: str(f, 'title'), p_description: str(f, 'description') }), 'Certificate issued.', e.currentTarget); },
  };

  return (
    <section className="card p-5">
      <div className="mb-4 flex flex-wrap gap-2" role="tablist">
        {TABS.map(([v, l]) => <button key={v} role="tab" aria-selected={tab === v} onClick={() => setTab(v)} className={`rounded-full border px-4 py-2 text-xs font-bold ${tab === v ? 'border-teal-500 bg-teal-500 text-white' : 'border-ink-200'}`}>{l}</button>)}
      </div>
      <form key={tab} onSubmit={forms[tab]} className="space-y-3">
        {tab === 'note' && (<>
          <label className="block text-xs font-bold text-ink-600">Topics covered<input name="topics" maxLength={500} className={input} /></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-bold text-ink-600">Strengths<input name="strengths" maxLength={500} className={input} /></label>
            <label className="block text-xs font-bold text-ink-600">To work on<input name="weaknesses" maxLength={500} className={input} /></label>
          </div>
          <label className="block text-xs font-bold text-ink-600">Comment for the student / parent<textarea name="comment" rows={3} maxLength={2000} className={input} /></label>
          <label className="block text-xs font-bold text-ink-600">Understanding today
            <select name="understanding" defaultValue="" className={input}><option value="">—</option>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} / 5</option>)}</select></label>
        </>)}
        {tab === 'assignment' && (<>
          <label className="block text-xs font-bold text-ink-600">Title<input name="title" required minLength={3} maxLength={120} className={input} /></label>
          <label className="block text-xs font-bold text-ink-600">Instructions<textarea name="instructions" rows={4} maxLength={4000} className={input} /></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-bold text-ink-600">Deadline (optional)<input name="due" type="datetime-local" className={input} /></label>
            <label className="block text-xs font-bold text-ink-600">Marks out of<input name="max" type="number" min={1} max={1000} defaultValue={100} className={input} /></label>
          </div>
          <label className="block text-xs font-bold text-ink-600">Attach a file (PDF, image, Word — max 10 MB)<input name="file" type="file" accept="image/*,.pdf,.doc,.docx,.txt" className={input} /></label>
        </>)}
        {tab === 'test' && (<>
          {tests.length === 0 ? <p className="text-sm text-ink-600">You have no tests yet. <a className="font-bold text-teal-600 underline" href="/teacher/tests">Create one</a> first.</p> : (<>
            <label className="block text-xs font-bold text-ink-600">Test<select name="test" className={input}><option value="">Choose…</option>{tests.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
            <label className="block text-xs font-bold text-ink-600">Deadline (optional)<input name="due" type="datetime-local" className={input} /></label>
          </>)}
        </>)}
        {tab === 'plan' && (<>
          <label className="block text-xs font-bold text-ink-600">Plan title<input name="title" required minLength={3} maxLength={120} placeholder="e.g. GCE Mathematics: B to A" className={input} /></label>
          <label className="block text-xs font-bold text-ink-600">Goal<input name="goal" maxLength={1000} className={input} /></label>
          <label className="block text-xs font-bold text-ink-600">Target date<input name="target" type="date" className={input} /></label>
          <label className="block text-xs font-bold text-ink-600">Objectives (one per line)<textarea name="objectives" required rows={5} placeholder={'Algebra basics\nQuadratic equations\nPast paper practice'} className={input} /></label>
        </>)}
        {tab === 'cert' && (<>
          <label className="block text-xs font-bold text-ink-600">Certificate title<input name="title" required minLength={3} maxLength={120} placeholder="e.g. Algebra Foundations — Completed" className={input} /></label>
          <label className="block text-xs font-bold text-ink-600">Description (optional)<textarea name="description" rows={2} maxLength={500} className={input} /></label>
          <p className="text-xs text-ink-400">Anyone can check a certificate with its code on the verification page. You can revoke it later.</p>
        </>)}
        {!(tab === 'test' && tests.length === 0) && <button disabled={busy} className="btn-teal disabled:opacity-60">{busy ? 'Saving…' : 'Save'}</button>}
      </form>
    </section>
  );
}

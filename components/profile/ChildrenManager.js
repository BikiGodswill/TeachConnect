'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { HiTrash, HiPencil } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';
import { friendlyError } from '@/lib/errors';

const input = 'mt-1 w-full rounded-md border border-ink-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500';
const LEVELS = ['Primary', 'Form 1–3 / 6ème–4ème', 'Form 4–5 / 3ème–2nde', 'Lower Sixth / 1ère', 'Upper Sixth / Terminale', 'University', 'Other'];

export default function ChildrenManager({ initial, userId }) {
  const router = useRouter();
  const supabase = createClient();
  const [list, setList] = useState(initial);
  const [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState(false);

  async function save(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget); const form = e.currentTarget;
    const row = {
      full_name: String(f.get('full_name')).trim(), academic_level: f.get('academic_level') || null,
      learning_goals: String(f.get('learning_goals')).trim() || null, strengths: String(f.get('strengths')).trim() || null, weaknesses: String(f.get('weaknesses')).trim() || null,
    };
    setBusy(true);
    const q = edit ? supabase.from('children').update(row).eq('id', edit.id).select().single() : supabase.from('children').insert({ ...row, parent_id: userId }).select().single();
    const { data, error } = await q;
    setBusy(false);
    if (error) return toast.error(friendlyError(error, 'Could not save. Please try again.'));
    setList(edit ? list.map((c) => (c.id === data.id ? data : c)) : [...list, data]);
    setEdit(null); form.reset(); toast.success(edit ? 'Child updated.' : 'Child added.'); router.refresh();
  }
  async function remove(c) {
    if (!confirm(`Remove ${c.full_name}?`)) return;
    const { error } = await supabase.from('children').delete().eq('id', c.id);
    if (error) return toast.error(/foreign key|violates/i.test(error.message) ? `${c.full_name} has lessons booked and cannot be removed.` : friendlyError(error));
    setList(list.filter((x) => x.id !== c.id)); toast.success('Removed.'); router.refresh();
  }

  return (
    <div className="space-y-6">
      <form key={edit?.id || 'new'} onSubmit={save} className="card space-y-4 p-6">
        <h2 className="text-lg font-bold">{edit ? `Edit ${edit.full_name}` : 'Add a child'}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-bold text-ink-600">Child&apos;s name<input name="full_name" required maxLength={80} defaultValue={edit?.full_name || ''} className={input} /></label>
          <label className="block text-xs font-bold text-ink-600">Level<select name="academic_level" defaultValue={edit?.academic_level || ''} className={input}><option value="">Choose…</option>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></label>
        </div>
        <label className="block text-xs font-bold text-ink-600">Learning goals<textarea name="learning_goals" rows={2} maxLength={500} defaultValue={edit?.learning_goals || ''} className={input} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-bold text-ink-600">Strengths<input name="strengths" maxLength={300} defaultValue={edit?.strengths || ''} className={input} /></label>
          <label className="block text-xs font-bold text-ink-600">Needs help with<input name="weaknesses" maxLength={300} defaultValue={edit?.weaknesses || ''} className={input} /></label>
        </div>
        <div className="flex gap-3">
          <button disabled={busy} className="btn-teal disabled:opacity-60">{busy ? 'Saving…' : edit ? 'Save changes' : 'Add child'}</button>
          {edit && <button type="button" onClick={() => setEdit(null)} className="btn-ghost">Cancel</button>}
        </div>
      </form>
      <div className="space-y-3">
        {list.length === 0 && <div className="card p-8 text-center text-sm text-ink-600">No children added yet.</div>}
        {list.map((c) => (
          <div key={c.id} className="card flex items-start justify-between gap-3 p-5">
            <div>
              <p className="font-bold">{c.full_name}{c.academic_level && <span className="font-medium text-ink-600"> · {c.academic_level}</span>}</p>
              {c.learning_goals && <p className="text-sm text-ink-600">{c.learning_goals}</p>}
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEdit(c); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label={`Edit ${c.full_name}`} className="grid h-9 w-9 place-items-center rounded-full hover:bg-sky-50"><HiPencil size={18} /></button>
              <button onClick={() => remove(c)} aria-label={`Remove ${c.full_name}`} className="grid h-9 w-9 place-items-center rounded-full text-danger hover:bg-peach-100"><HiTrash size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

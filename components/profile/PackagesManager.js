'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { HiTrash } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';
import { friendlyError } from '@/lib/errors';

const input = 'mt-1 w-full rounded-md border border-ink-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500';

export default function PackagesManager({ initial, userId }) {
  const router = useRouter();
  const supabase = createClient();
  const [list, setList] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function add(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget); const form = e.currentTarget;
    setBusy(true);
    const { data, error } = await supabase.from('lesson_packages').insert({
      teacher_id: userId, title: String(fd.get('title')).trim(), description: String(fd.get('description')).trim() || null,
      lessons_count: Number(fd.get('lessons_count')), lesson_minutes: Number(fd.get('lesson_minutes')), discount_percent: Number(fd.get('discount_percent')),
    }).select().single();
    setBusy(false);
    if (error) return toast.error(friendlyError(error, 'Could not save the package. Check the numbers and try again.'));
    setList([data, ...list]); form.reset(); toast.success('Package added.'); router.refresh();
  }
  async function toggle(p) {
    const { error } = await supabase.from('lesson_packages').update({ is_active: !p.is_active }).eq('id', p.id);
    if (error) return toast.error(friendlyError(error));
    setList(list.map((x) => (x.id === p.id ? { ...x, is_active: !p.is_active } : x))); router.refresh();
  }
  async function remove(p) {
    if (!confirm('Delete this package?')) return;
    const { error } = await supabase.from('lesson_packages').delete().eq('id', p.id);
    if (error) return toast.error(friendlyError(error));
    setList(list.filter((x) => x.id !== p.id)); router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="card space-y-4 p-6">
        <h2 className="text-lg font-bold">New package</h2>
        <label className="block text-xs font-bold text-ink-600">Title<input name="title" required minLength={3} maxLength={80} placeholder="e.g. Exam prep — 8 weeks" className={input} /></label>
        <label className="block text-xs font-bold text-ink-600">Description (optional)<input name="description" maxLength={300} className={input} /></label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-xs font-bold text-ink-600">Number of lessons<input name="lessons_count" type="number" required min={2} max={40} defaultValue={8} className={input} /></label>
          <label className="block text-xs font-bold text-ink-600">Minutes per lesson<select name="lesson_minutes" defaultValue={60} className={input}>{[30, 45, 60, 90, 120].map((m) => <option key={m}>{m}</option>)}</select></label>
          <label className="block text-xs font-bold text-ink-600">Discount (%)<input name="discount_percent" type="number" required min={0} max={40} defaultValue={10} className={input} /></label>
        </div>
        <button disabled={busy} className="btn-teal disabled:opacity-60">{busy ? 'Saving…' : 'Add package'}</button>
      </form>

      <div className="space-y-3">
        {list.length === 0 && <div className="card p-8 text-center text-sm text-ink-600">No packages yet.</div>}
        {list.map((p) => (
          <div key={p.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <p className="font-bold">{p.title} <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${p.is_active ? 'bg-teal-500/10 text-teal-600' : 'bg-ink-200 text-ink-600'}`}>{p.is_active ? 'Active' : 'Hidden'}</span></p>
              <p className="text-sm text-ink-600">{p.lessons_count} lessons · {p.lesson_minutes} min · {p.discount_percent}% off</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggle(p)} className="btn-ghost h-9 px-4 text-xs">{p.is_active ? 'Hide' : 'Show'}</button>
              <button onClick={() => remove(p)} aria-label="Delete package" className="grid h-9 w-9 place-items-center rounded-full text-danger hover:bg-peach-100"><HiTrash size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

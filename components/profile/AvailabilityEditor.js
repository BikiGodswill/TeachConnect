'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { HiTrash } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AvailabilityEditor({ teacherId, initial }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [day, setDay] = useState(1);
  const [start, setStart] = useState('16:00');
  const [end, setEnd] = useState('19:00');

  async function add(e) {
    e.preventDefault();
    if (end <= start) return toast.error('End time must be after start time.');
    if (rows.some((r) => r.day_of_week === day && start < r.end_time.slice(0, 5) && end > r.start_time.slice(0, 5))) return toast.error('That overlaps an existing window.');
    const { data, error } = await createClient().from('teacher_availability').insert({ teacher_id: teacherId, day_of_week: day, start_time: start, end_time: end }).select().single();
    if (error) return toast.error('Could not save.');
    setRows((r) => [...r, data].sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time)));
    router.refresh();
  }
  async function remove(id) {
    const { error } = await createClient().from('teacher_availability').delete().eq('id', id);
    if (error) return toast.error('Could not remove.');
    setRows((r) => r.filter((x) => x.id !== id)); router.refresh();
  }

  const sel = 'h-11 rounded-md border border-ink-200 bg-white px-3 text-sm';
  return (
    <div className="card p-6">
      <form onSubmit={add} className="flex flex-wrap items-end gap-3">
        <label className="text-xs font-bold text-ink-600">Day<select value={day} onChange={(e) => setDay(Number(e.target.value))} className={`${sel} mt-1 block`}>{DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}</select></label>
        <label className="text-xs font-bold text-ink-600">From<input type="time" value={start} onChange={(e) => setStart(e.target.value)} className={`${sel} mt-1 block`} /></label>
        <label className="text-xs font-bold text-ink-600">To<input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={`${sel} mt-1 block`} /></label>
        <button className="btn-teal h-11 px-6 text-xs">Add window</button>
      </form>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between rounded-md bg-sky-50 px-4 py-2.5 text-sm">
            <span><b>{DAYS[r.day_of_week]}</b> · {r.start_time.slice(0, 5)} – {r.end_time.slice(0, 5)}</span>
            <button onClick={() => remove(r.id)} aria-label="Remove" className="text-danger"><HiTrash size={18} /></button>
          </li>
        ))}
        {!rows.length && <li className="text-sm text-ink-600">Add the times you can teach. Students can only book inside these windows.</li>}
      </ul>
    </div>
  );
}

'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { HiMagnifyingGlass } from 'react-icons/hi2';

export default function QuickSearch({ subjects = [] }) {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [city, setCity] = useState('');
  const [mode, setMode] = useState('');

  function submit(e) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (subject) p.set('subject', subject);
    if (city.trim()) p.set('city', city.trim());
    if (mode) p.set('mode', mode);
    router.push(`/teachers?${p.toString()}`);
  }

  const field = 'h-14 w-full rounded-md bg-sky-50 px-4 text-sm font-medium outline-none ring-teal-500 focus:ring-2';
  return (
    <form onSubmit={submit} className="relative z-10 mx-auto -mt-16 max-w-5xl rounded-xl bg-white p-5 shadow-float md:p-6">
      <div className="grid gap-4 md:grid-cols-[1.3fr_1fr_1fr_auto]">
        <label className="text-xs font-bold text-ink-600">What do you want to learn?
          <input list="subject-list" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Mathematics" className={`${field} mt-1`} />
          <datalist id="subject-list">{subjects.map((s) => <option key={s.id} value={s.name} />)}</datalist>
        </label>
        <label className="text-xs font-bold text-ink-600">Where?
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Buea" className={`${field} mt-1`} />
        </label>
        <label className="text-xs font-bold text-ink-600">Learning mode
          <select value={mode} onChange={(e) => setMode(e.target.value)} className={`${field} mt-1`}>
            <option value="">Online or in person</option>
            <option value="ONLINE">Online</option>
            <option value="PHYSICAL">In person</option>
          </select>
        </label>
        <button className="btn-primary h-14 self-end px-8"><HiMagnifyingGlass size={18} /> Find Teachers</button>
      </div>
    </form>
  );
}

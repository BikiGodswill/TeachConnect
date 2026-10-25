'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { HiTrash } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';

const input = 'mt-1 w-full rounded-md border border-ink-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500';
const num = (v) => (v === '' || v == null ? null : Math.max(0, Math.round(Number(v))));

export default function TeacherProfileForm({ userId, user, tp, allSubjects, selected, quals }) {
  const router = useRouter();
  const supabase = createClient();
  const [busy, setBusy] = useState(false);
  const [subjects, setSubjects] = useState(new Set(selected));
  const [qlist, setQlist] = useState(quals);
  const [q, setQ] = useState({ title: '', institution: '', year: '' });

  const toggle = (id) => setSubjects((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  async function save(e) {
    e.preventDefault(); setBusy(true);
    const f = new FormData(e.currentTarget);
    const offersOnline = f.get('offers_online') === 'on';
    const offersPhysical = f.get('offers_physical') === 'on';
    if (!offersOnline && !offersPhysical) { setBusy(false); return toast.error('Offer at least one lesson type.'); }

    const [a, b] = await Promise.all([
      supabase.from('users').update({ full_name: String(f.get('full_name')).trim(), phone: String(f.get('phone')).trim() || null }).eq('id', userId),
      supabase.from('teacher_profiles').update({
        headline: String(f.get('headline')).trim() || null, bio: String(f.get('bio')).trim() || null,
        methodology: String(f.get('methodology')).trim() || null, intro_video_url: String(f.get('intro_video_url')).trim() || null,
        years_experience: num(f.get('years_experience')), city: String(f.get('city')).trim() || null,
        service_radius_km: num(f.get('service_radius_km')) ?? 10,
        languages: String(f.get('languages')).split(',').map((s) => s.trim()).filter(Boolean),
        hourly_rate: num(f.get('hourly_rate')), online_rate: num(f.get('online_rate')), physical_rate: num(f.get('physical_rate')),
        offers_online: offersOnline, offers_physical: offersPhysical, is_listed: f.get('is_listed') === 'on',
      }).eq('id', userId),
    ]);
    // sync subjects
    const keep = [...subjects];
    const del = await supabase.from('teacher_subjects').delete().eq('teacher_id', userId).not('subject_id', 'in', `(${keep.length ? keep.join(',') : '00000000-0000-0000-0000-000000000000'})`);
    const ins = keep.length ? await supabase.from('teacher_subjects').upsert(keep.map((subject_id) => ({ teacher_id: userId, subject_id }))) : { error: null };
    setBusy(false);
    if (a.error || b.error || del.error || ins.error) return toast.error('Some changes could not be saved.');
    toast.success('Profile saved.'); router.refresh();
  }

  async function addQual(e) {
    e.preventDefault();
    if (!q.title.trim()) return;
    const { data, error } = await supabase.from('teacher_qualifications').insert({ teacher_id: userId, title: q.title.trim(), institution: q.institution.trim() || null, year: num(q.year) }).select().single();
    if (error) return toast.error('Could not add.');
    setQlist([data, ...qlist]); setQ({ title: '', institution: '', year: '' });
  }
  async function delQual(id) {
    const { error } = await supabase.from('teacher_qualifications').delete().eq('id', id);
    if (!error) setQlist(qlist.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-8">
      <form onSubmit={save} className="card space-y-4 p-6">
        <h2 className="text-lg font-bold">Profile details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-bold text-ink-600">Full name<input name="full_name" required defaultValue={user.full_name} className={input} /></label>
          <label className="block text-xs font-bold text-ink-600">Phone<input name="phone" defaultValue={user.phone || ''} className={input} /></label>
        </div>
        <label className="block text-xs font-bold text-ink-600">Headline<input name="headline" maxLength={120} defaultValue={tp.headline || ''} placeholder="e.g. GCE Maths & Physics teacher, 8 years experience" className={input} /></label>
        <label className="block text-xs font-bold text-ink-600">About you<textarea name="bio" rows={4} defaultValue={tp.bio || ''} className={input} /></label>
        <label className="block text-xs font-bold text-ink-600">Teaching methodology<textarea name="methodology" rows={3} defaultValue={tp.methodology || ''} className={input} /></label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-xs font-bold text-ink-600">Years of experience<input name="years_experience" type="number" min="0" defaultValue={tp.years_experience ?? ''} className={input} /></label>
          <label className="block text-xs font-bold text-ink-600">City<input name="city" defaultValue={tp.city || ''} className={input} /></label>
          <label className="block text-xs font-bold text-ink-600">Service radius (km)<input name="service_radius_km" type="number" min="1" defaultValue={tp.service_radius_km ?? 10} className={input} /></label>
        </div>
        <label className="block text-xs font-bold text-ink-600">Languages (comma separated)<input name="languages" defaultValue={(tp.languages || []).join(', ')} placeholder="English, French" className={input} /></label>
        <label className="block text-xs font-bold text-ink-600">Introduction video link (https)<input name="intro_video_url" type="url" pattern="https://.*" defaultValue={tp.intro_video_url || ''} className={input} /></label>

        <h3 className="pt-2 font-bold">Prices (FCFA per hour)</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-xs font-bold text-ink-600">Default rate<input name="hourly_rate" type="number" min="0" step="500" defaultValue={tp.hourly_rate ?? ''} className={input} /></label>
          <label className="block text-xs font-bold text-ink-600">Online rate<input name="online_rate" type="number" min="0" step="500" defaultValue={tp.online_rate ?? ''} className={input} /></label>
          <label className="block text-xs font-bold text-ink-600">In-person rate<input name="physical_rate" type="number" min="0" step="500" defaultValue={tp.physical_rate ?? ''} className={input} /></label>
        </div>
        <div className="flex flex-wrap gap-6 text-sm font-semibold">
          <label className="flex items-center gap-2"><input type="checkbox" name="offers_online" defaultChecked={tp.offers_online ?? true} className="accent-teal-500" /> I teach online</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="offers_physical" defaultChecked={tp.offers_physical ?? true} className="accent-teal-500" /> I teach in person</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="is_listed" defaultChecked={tp.is_listed ?? true} className="accent-teal-500" /> Show me in search</label>
        </div>

        <h3 className="pt-2 font-bold">Subjects you teach</h3>
        <div className="flex flex-wrap gap-2">
          {allSubjects.map((s) => (
            <button type="button" key={s.id} onClick={() => toggle(s.id)} aria-pressed={subjects.has(s.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${subjects.has(s.id) ? 'border-teal-500 bg-teal-500 text-white' : 'border-ink-200'}`}>{s.name}</button>
          ))}
        </div>
        <button disabled={busy} className="btn-teal disabled:opacity-60">{busy ? 'Saving…' : 'Save profile'}</button>
      </form>

      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-bold">Qualifications</h2>
        <form onSubmit={addQual} className="grid gap-3 sm:grid-cols-[2fr_2fr_1fr_auto]">
          <input value={q.title} onChange={(e) => setQ({ ...q, title: e.target.value })} placeholder="e.g. BSc Mathematics" className="h-11 rounded-md border border-ink-200 px-3 text-sm" required />
          <input value={q.institution} onChange={(e) => setQ({ ...q, institution: e.target.value })} placeholder="Institution" className="h-11 rounded-md border border-ink-200 px-3 text-sm" />
          <input value={q.year} onChange={(e) => setQ({ ...q, year: e.target.value })} placeholder="Year" type="number" min="1950" max="2100" className="h-11 rounded-md border border-ink-200 px-3 text-sm" />
          <button className="btn-primary h-11 px-5 text-xs">Add</button>
        </form>
        <ul className="space-y-2">
          {qlist.map((x) => (
            <li key={x.id} className="flex items-center justify-between rounded-md bg-sky-50 px-4 py-2.5 text-sm">
              <span><b>{x.title}</b>{x.institution && ` · ${x.institution}`}{x.year && ` · ${x.year}`}</span>
              <button onClick={() => delQual(x.id)} aria-label="Remove" className="text-danger"><HiTrash size={18} /></button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

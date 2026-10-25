'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

const input = 'mt-1 w-full rounded-md border border-ink-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500';

export default function StudentProfileForm({ userId, email, user, sp }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function save(e) {
    e.preventDefault(); setBusy(true);
    const f = new FormData(e.currentTarget);
    const supabase = createClient();
    const [a, b] = await Promise.all([
      supabase.from('users').update({ full_name: String(f.get('full_name')).trim(), phone: String(f.get('phone')).trim() || null }).eq('id', userId),
      supabase.from('student_profiles').upsert({
        id: userId, academic_level: f.get('academic_level') || null, learning_goals: f.get('learning_goals') || null,
        strengths: f.get('strengths') || null, weaknesses: f.get('weaknesses') || null,
        preferred_mode: f.get('preferred_mode') || null, city: String(f.get('city')).trim() || null,
      }),
    ]);
    setBusy(false);
    if (a.error || b.error) return toast.error('Could not save your profile.');
    toast.success('Profile saved.'); router.refresh();
  }

  return (
    <form onSubmit={save} className="card space-y-4 p-6">
      <p className="text-sm text-ink-600">Signed in as <b>{email}</b></p>
      <label className="block text-xs font-bold text-ink-600">Full name<input name="full_name" required defaultValue={user.full_name} className={input} /></label>
      <label className="block text-xs font-bold text-ink-600">Phone<input name="phone" defaultValue={user.phone || ''} className={input} /></label>
      <label className="block text-xs font-bold text-ink-600">City<input name="city" defaultValue={sp.city || ''} className={input} /></label>
      <label className="block text-xs font-bold text-ink-600">Academic level<input name="academic_level" defaultValue={sp.academic_level || ''} placeholder="e.g. Form 5, Lower Sixth" className={input} /></label>
      <label className="block text-xs font-bold text-ink-600">Learning goals<textarea name="learning_goals" rows={2} defaultValue={sp.learning_goals || ''} placeholder="e.g. Improve GCE Mathematics from B to A" className={input} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-bold text-ink-600">Strengths<textarea name="strengths" rows={2} defaultValue={sp.strengths || ''} className={input} /></label>
        <label className="block text-xs font-bold text-ink-600">Weaknesses<textarea name="weaknesses" rows={2} defaultValue={sp.weaknesses || ''} className={input} /></label>
      </div>
      <label className="block text-xs font-bold text-ink-600">Preferred learning mode
        <select name="preferred_mode" defaultValue={sp.preferred_mode || ''} className={input}>
          <option value="">No preference</option><option value="ONLINE">Online</option><option value="PHYSICAL">In person</option>
        </select>
      </label>
      <button disabled={busy} className="btn-teal disabled:opacity-60">{busy ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}

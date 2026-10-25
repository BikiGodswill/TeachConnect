'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

const input = 'mt-1 w-full rounded-md border border-ink-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500';

export default function ParentProfileForm({ userId, email, user, city }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function save(e) {
    e.preventDefault(); setBusy(true);
    const f = new FormData(e.currentTarget); const db = createClient();
    const [a, b] = await Promise.all([
      db.from('users').update({ full_name: String(f.get('full_name')).trim(), phone: String(f.get('phone')).trim() || null }).eq('id', userId),
      db.from('parent_profiles').upsert({ id: userId, city: String(f.get('city')).trim() || null }),
    ]);
    setBusy(false);
    if (a.error || b.error) return toast.error('Could not save your profile.');
    toast.success('Profile saved.'); router.refresh();
  }
  return (
    <form onSubmit={save} className="card space-y-4 p-6">
      <label className="block text-xs font-bold text-ink-600">Full name<input name="full_name" required defaultValue={user.full_name} className={input} /></label>
      <label className="block text-xs font-bold text-ink-600">Email<input value={email || ''} disabled className={`${input} bg-sky-50`} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-bold text-ink-600">Phone<input name="phone" defaultValue={user.phone || ''} className={input} /></label>
        <label className="block text-xs font-bold text-ink-600">City<input name="city" defaultValue={city} className={input} /></label>
      </div>
      <button disabled={busy} className="btn-teal disabled:opacity-60">{busy ? 'Saving…' : 'Save profile'}</button>
    </form>
  );
}

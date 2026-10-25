'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { friendlyError } from '@/lib/errors';
import LocationPicker from '@/components/map/LocationPicker';

export default function BaseLocationCard({ has }) {
  const router = useRouter();
  const [loc, setLoc] = useState(null);
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    const { error } = await createClient().rpc('set_base_location', { p_lat: loc.lat, p_lng: loc.lng });
    setBusy(false);
    if (error) return toast.error(friendlyError(error));
    toast.success('Base area saved.'); setLoc(null); router.refresh();
  }
  return (
    <section className="card space-y-3 p-6">
      <h2 className="text-lg font-bold">Your teaching area</h2>
      <p className="text-sm text-ink-600">{has ? 'Your base area is set.' : 'Set where you teach from so nearby students can find you.'} Students only ever see an approximate area (about 1 km) — never your exact address. Your service radius is set below.</p>
      <LocationPicker value={loc} onChange={setLoc} compact />
      {loc && <button disabled={busy} onClick={save} className="btn-primary h-11 px-6 text-sm disabled:opacity-60">{busy ? 'Saving…' : 'Save base area'}</button>}
    </section>
  );
}

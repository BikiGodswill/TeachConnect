'use client';
import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { HiBolt, HiCheckBadge } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';
import { friendlyError } from '@/lib/errors';
import { money } from '@/lib/format';
import { CITIES } from '@/lib/geo';
import LocationPicker from '@/components/map/LocationPicker';
import Stars from '@/components/ui/Stars';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false, loading: () => <div className="h-[420px] animate-pulse rounded-lg bg-sky-100" />,
});

export default function NearbyClient({ subjects }) {
  const supabase = useMemo(() => createClient(), []);
  const [loc, setLoc] = useState(null);
  const [subject, setSubject] = useState('');
  const [radius, setRadius] = useState(15);
  const [nowOnly, setNowOnly] = useState(false);
  const [list, setList] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sel, setSel] = useState(null);

  const load = useCallback(async () => {
    if (!loc) return;
    setBusy(true);
    const { data, error } = await supabase.rpc('nearby_teachers', {
      p_lat: loc.lat, p_lng: loc.lng, p_radius_km: radius, p_subject: subject || null, p_available_now: nowOnly, p_limit: 30,
    });
    setBusy(false);
    if (error) { toast.error(friendlyError(error, 'Could not load nearby teachers.')); return setList([]); }
    setList(data || []);
  }, [loc, radius, subject, nowOnly, supabase]);

  useEffect(() => { load(); }, [load]);

  const markers = (list || []).map((t) => ({
    id: t.id, lat: t.approx_lat, lng: t.approx_lng, label: `${t.full_name} · ${t.distance_km} km`,
    tone: t.available_now ? 'teal' : 'navy', active: sel === t.id,
  }));
  const center = loc || CITIES[0];
  const query = new URLSearchParams({ ...(subject && { subject }) }).toString();

  return (
    <div className="space-y-6">
      <LocationPicker value={loc} onChange={(v) => { setLoc(v); setSel(null); }} />
      <div className="flex flex-wrap items-center gap-3">
        <select aria-label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="h-11 rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold">
          <option value="">All subjects</option>
          {subjects.map((s) => <option key={s.id}>{s.name}</option>)}
        </select>
        <select aria-label="Distance" value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="h-11 rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold">
          {[5, 10, 15, 30, 50].map((r) => <option key={r} value={r}>Within {r} km</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={nowOnly} onChange={(e) => setNowOnly(e.target.checked)} className="accent-teal-500" /> Available now</label>
        <Link href={`/student/instant${query ? `?${query}` : ''}`} className="btn-primary ml-auto h-11 px-5 text-sm"><HiBolt size={18} /> Request a teacher now</Link>
      </div>

      {!loc ? (
        <div className="card p-10 text-center text-ink-600">Share your location or choose a city to see in-person teachers near you.</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <MapView center={center} markers={markers} user={loc} height={460} onSelect={setSel} />
            <p className="mt-2 text-xs text-ink-400">Pins show an approximate area (about 1 km), never a teacher&apos;s exact address. Teal pins are available now.</p>
          </div>
          <div className="max-h-[460px] space-y-3 overflow-y-auto pr-1" aria-live="polite">
            {busy && !list && [0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-white" />)}
            {list && !list.length && !busy && (
              <div className="card p-8 text-center text-sm text-ink-600">No in-person teachers found in this area. Try a wider distance, another subject, or <Link className="font-bold text-teal-600" href="/teachers?mode=ONLINE">browse online teachers</Link>.</div>
            )}
            {(list || []).map((t) => (
              <div key={t.id} onClick={() => setSel(t.id)} className={`cursor-pointer rounded-lg bg-white p-4 shadow-card transition ${sel === t.id ? 'ring-2 ring-teal-500' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="flex items-center gap-1 font-bold">{t.full_name}{t.is_verified && <HiCheckBadge className="text-teal-500" title="Verified" />}</p>
                    <p className="text-xs text-ink-600">{t.headline || (t.subjects || []).slice(0, 3).join(' · ')}</p>
                  </div>
                  <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold">{t.distance_km} km</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1"><Stars value={Number(t.rating_avg) || 0} /> <span className="text-xs text-ink-400">({t.rating_count})</span></span>
                  <b>{money(t.physical_rate ?? t.hourly_rate, t.currency)}<span className="text-xs font-normal text-ink-400">/hr</span></b>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {t.available_now && <span className="rounded-full bg-teal-500/10 px-2.5 py-1 text-xs font-bold text-teal-600">Available now</span>}
                  <Link href={`/teachers/${t.id}`} className="ml-auto text-xs font-bold text-navy-900 underline">Profile</Link>
                  <Link href={`/teachers/${t.id}/book`} className="btn-teal h-9 px-4 text-xs">Book</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

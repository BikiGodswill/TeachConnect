'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiMapPin } from 'react-icons/hi2';
import { CITIES, getPosition } from '@/lib/geo';

// Calls onChange({lat,lng,source:'gps'|'city',label}). Falls back to a city centre when GPS is unavailable.
export default function LocationPicker({ value, onChange, compact = false }) {
  const [busy, setBusy] = useState(false);
  async function locate() {
    setBusy(true);
    try {
      const p = await getPosition();
      onChange({ lat: p.lat, lng: p.lng, source: 'gps', label: 'My current location' });
      toast.success('Location found.');
    } catch (e) { toast.error(e.friendly || 'Could not get your location.'); }
    setBusy(false);
  }
  return (
    <div className={`flex flex-wrap items-center gap-3 ${compact ? '' : 'rounded-lg bg-white p-4 shadow-card'}`}>
      <button type="button" onClick={locate} disabled={busy} className="btn-teal h-11 px-5 text-sm disabled:opacity-60">
        <HiMapPin size={18} /> {busy ? 'Locating…' : 'Use my location'}
      </button>
      <span className="text-xs font-semibold text-ink-400">or</span>
      <select aria-label="Choose your city" value={value?.source === 'city' ? value.label : ''}
        onChange={(e) => { const c = CITIES.find((x) => x.name === e.target.value); if (c) onChange({ lat: c.lat, lng: c.lng, source: 'city', label: c.name }); }}
        className="h-11 rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold">
        <option value="">Choose your city</option>
        {CITIES.map((c) => <option key={c.name}>{c.name}</option>)}
      </select>
      {value && <span className="text-xs font-semibold text-teal-600">✓ {value.label}</span>}
    </div>
  );
}

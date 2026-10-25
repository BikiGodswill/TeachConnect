'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { HiHeart, HiOutlineHeart, HiCheckBadge, HiMapPin, HiBriefcase } from 'react-icons/hi2';
import Stars from '@/components/ui/Stars';

const fmt = (n, cur = 'XAF') => (n == null ? '—' : `${Number(n).toLocaleString('en-US')} ${cur === 'XAF' ? 'FCFA' : cur}`);

export default function TeacherCard({ t, distanceKm, initialFav = false }) {
  const router = useRouter();
  const [fav, setFav] = useState(initialFav);

  async function toggleFav() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login?next=/teachers'); return; }
    const next = !fav;
    setFav(next); // optimistic
    const { error } = next
      ? await supabase.from('favorites').insert({ student_id: user.id, teacher_id: t.id })
      : await supabase.from('favorites').delete().eq('student_id', user.id).eq('teacher_id', t.id);
    if (error && error.code !== '23505') { setFav(!next); toast.error('Only student accounts can save favorites.'); }
  }
  const initials = t.full_name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <article className="card group flex flex-col overflow-hidden">
      <div className="relative h-44 bg-gradient-to-br from-sky-100 to-lavender-100">
        {t.avatar_url ? (
          <Image src={t.avatar_url} alt={t.full_name} fill className="object-cover" sizes="(max-width:768px) 100vw, 25vw" />
        ) : (
          <div className="grid h-full place-items-center font-heading text-5xl font-extrabold text-navy-700/40">{initials}</div>
        )}
        {t.subjects?.[0] && (
          <span className="absolute left-3 top-3 rounded-full bg-teal-500 px-3 py-1 text-xs font-bold text-white">{t.subjects[0]}</span>
        )}
        <button aria-label="Favorite" onClick={toggleFav}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white shadow-card transition active:scale-90">
          {fav ? <HiHeart className="text-danger" size={18} /> : <HiOutlineHeart size={18} />}
        </button>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="flex items-center gap-1.5 text-lg font-bold">
          {t.full_name}
          {t.is_verified && <HiCheckBadge className="text-teal-500" size={20} title="Verified teacher" />}
        </h3>
        {t.headline && <p className="mt-1 line-clamp-2 text-sm text-ink-600">{t.headline}</p>}
        <div className="mt-3 flex items-center gap-2 text-sm">
          <Stars value={t.rating_avg} />
          <span className="font-semibold">{Number(t.rating_avg || 0).toFixed(1)}</span>
          <span className="text-ink-400">({t.rating_count})</span>
        </div>
        <ul className="mt-3 space-y-1.5 text-xs text-ink-600">
          {t.years_experience != null && <li className="flex items-center gap-2"><HiBriefcase /> {t.years_experience} yrs experience</li>}
          {t.city && <li className="flex items-center gap-2"><HiMapPin /> {t.city}{distanceKm != null && ` · ${distanceKm.toFixed(1)} km away`}</li>}
          <li className="flex gap-2">
            {t.offers_online && <span className="rounded-full bg-sky-100 px-2 py-0.5 font-semibold">Online</span>}
            {t.offers_physical && <span className="rounded-full bg-peach-100 px-2 py-0.5 font-semibold">In person</span>}
          </li>
        </ul>
        <div className="mt-auto flex items-center justify-between pt-5">
          <p className="font-heading text-lg font-extrabold text-teal-600">{fmt(t.hourly_rate, t.currency)}<span className="text-xs font-medium text-ink-400">/hr</span></p>
          <div className="flex gap-2">
            <Link href={`/teachers/${t.id}`} className="btn-ghost h-10 px-4 text-xs">View Profile</Link>
            <Link href={`/teachers/${t.id}/book`} className="btn-primary h-10 px-4 text-xs">Book</Link>
          </div>
        </div>
      </div>
    </article>
  );
}

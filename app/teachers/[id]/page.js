import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { HiCheckBadge, HiMapPin, HiBriefcase, HiLanguage, HiVideoCamera } from 'react-icons/hi2';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import Stars from '@/components/ui/Stars';
import MessageButton from '@/components/teachers/MessageButton';
import { createPublicClient } from '@/lib/supabase/server';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const money = (n, c = 'XAF') => (n == null ? 'Not set' : `${Number(n).toLocaleString('en-US')} ${c === 'XAF' ? 'FCFA' : c}`);

export async function generateMetadata({ params }) {
  const db = createPublicClient();
  const { data } = await db.from('teacher_cards').select('full_name,headline').eq('id', params.id).maybeSingle();
  return { title: data ? `${data.full_name} — Teacher Connect` : 'Teacher — Teacher Connect', description: data?.headline || undefined };
}

export default async function TeacherProfilePage({ params }) {
  const db = createPublicClient();
  const isUuid = /^[0-9a-f-]{36}$/i.test(params.id);
  if (!isUuid) notFound();

  const [{ data: card }, { data: extra }, { data: quals }, { data: avail }, { data: reviews }, { data: packages }] = await Promise.all([
    db.from('teacher_cards').select('*').eq('id', params.id).maybeSingle(),
    db.from('teacher_profiles').select('bio,methodology,intro_video_url,service_radius_km,completed_lessons,response_rate,completion_rate').eq('id', params.id).maybeSingle(),
    db.from('teacher_qualifications').select('id,title,institution,year').eq('teacher_id', params.id).order('year', { ascending: false }),
    db.from('teacher_availability').select('id,day_of_week,start_time,end_time').eq('teacher_id', params.id).order('day_of_week').order('start_time'),
    db.from('review_cards').select('*').eq('teacher_id', params.id).order('created_at', { ascending: false }).limit(20),
    db.from('lesson_packages').select('id,title,description,lessons_count,lesson_minutes,discount_percent').eq('teacher_id', params.id).eq('is_active', true).order('lessons_count'),
  ]);
  if (!card) notFound();

  const initials = card.full_name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const safeVideo = extra?.intro_video_url && /^https:\/\//.test(extra.intro_video_url) ? extra.intro_video_url : null;

  return (
    <>
      <SiteHeader />
      <main className="bg-sky-50 pb-28 lg:pb-12">
        <section className="relative bg-gradient-to-br from-lavender-50 via-white to-sky-50">
          {card.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.cover_url} alt="" className="h-40 w-full object-cover sm:h-64" />
          )}
          <div className={`mx-auto flex max-w-7xl flex-col gap-8 px-5 md:flex-row md:items-center ${card.cover_url ? '-mt-16 pb-10 md:-mt-20' : 'py-12'}`}>
            <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-full bg-sky-100 shadow-float">
              {card.avatar_url
                ? <Image src={card.avatar_url} alt={card.full_name} fill className="object-cover" sizes="160px" />
                : <div className="grid h-full place-items-center font-heading text-5xl font-extrabold text-navy-700/40">{initials}</div>}
            </div>
            <div className="flex-1">
              <h1 className="flex items-center gap-2 text-3xl font-extrabold md:text-4xl">
                {card.full_name}
                {card.is_verified && <HiCheckBadge className="text-teal-500" size={30} title="Verified teacher" />}
              </h1>
              {card.headline && <p className="mt-2 max-w-2xl text-lg text-ink-600">{card.headline}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <span className="flex items-center gap-2"><Stars value={card.rating_avg} size={16} /> <b>{Number(card.rating_avg || 0).toFixed(1)}</b> ({card.rating_count} reviews)</span>
                {card.city && <span className="flex items-center gap-1.5"><HiMapPin /> {card.city}</span>}
                {card.years_experience != null && <span className="flex items-center gap-1.5"><HiBriefcase /> {card.years_experience} yrs experience</span>}
                {card.languages?.length > 0 && <span className="flex items-center gap-1.5"><HiLanguage /> {card.languages.join(', ')}</span>}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/teachers/${card.id}/book`} className="btn-teal px-8">Book a Lesson</Link>
                <MessageButton teacherId={card.id} />
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-8 px-5 pt-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            <Block title="About"><p className="whitespace-pre-line text-ink-600">{extra?.bio || 'This teacher has not added a biography yet.'}</p></Block>
            <Block title="Subjects">
              <div className="flex flex-wrap gap-2">
                {card.subjects?.length ? card.subjects.map((s) => <span key={s} className="rounded-full bg-lavender-100 px-4 py-2 text-sm font-semibold">{s}</span>) : <p className="text-ink-600">No subjects listed.</p>}
              </div>
            </Block>
            {packages?.length > 0 && (
              <Block title="Lesson packages">
                <div className="grid gap-3 sm:grid-cols-2">
                  {packages.map((p) => (
                    <div key={p.id} className="rounded-lg bg-brandyellow-100/60 p-4">
                      <div className="flex items-start justify-between gap-2"><b>{p.title}</b><span className="rounded-full bg-brandyellow-500 px-2 py-0.5 text-[10px] font-bold">Save {p.discount_percent}%</span></div>
                      <p className="mt-1 text-sm text-ink-600">{p.lessons_count} weekly lessons · {p.lesson_minutes} min each</p>
                      {p.description && <p className="mt-1 text-xs text-ink-600">{p.description}</p>}
                    </div>
                  ))}
                </div>
                <Link href={`/teachers/${card.id}/book`} className="btn-teal mt-4 h-10 px-6 text-sm">Choose a package</Link>
              </Block>
            )}
            {extra?.methodology && <Block title="Teaching methodology"><p className="whitespace-pre-line text-ink-600">{extra.methodology}</p></Block>}
            <Block title="Qualifications">
              {quals?.length ? (
                <ul className="space-y-3">{quals.map((q) => (
                  <li key={q.id} className="flex items-start gap-3"><HiCheckBadge className="mt-0.5 text-teal-500" size={20} />
                    <span><b>{q.title}</b>{q.institution && <span className="text-ink-600"> · {q.institution}</span>}{q.year && <span className="text-ink-400"> · {q.year}</span>}</span></li>
                ))}</ul>
              ) : <p className="text-ink-600">No qualifications listed.</p>}
            </Block>
            {safeVideo && (
              <Block title="Introduction video">
                <a href={safeVideo} target="_blank" rel="noopener noreferrer" className="btn-ghost"><HiVideoCamera size={20} /> Watch introduction</a>
              </Block>
            )}
            <Block title="Availability">
              {avail?.length ? (
                <ul className="grid gap-2 sm:grid-cols-2">{avail.map((a) => (
                  <li key={a.id} className="flex justify-between rounded-md bg-sky-50 px-4 py-2 text-sm"><b>{DAYS[a.day_of_week]}</b><span>{a.start_time.slice(0, 5)} – {a.end_time.slice(0, 5)}</span></li>
                ))}</ul>
              ) : <p className="text-ink-600">No availability set yet.</p>}
            </Block>
            <Block title={`Reviews (${card.rating_count})`}>
              {reviews?.length ? (
                <ul className="space-y-5">{reviews.map((r) => (
                  <li key={r.id} className="border-b border-ink-100 pb-5 last:border-0">
                    <div className="flex items-center justify-between"><b>{r.reviewer_first_name}</b><Stars value={r.rating} /></div>
                    {r.comment && <p className="mt-2 text-sm text-ink-600">{r.comment}</p>}
                    {r.teacher_reply && <p className="mt-3 rounded-md bg-sky-50 p-3 text-sm"><b>Teacher reply:</b> {r.teacher_reply}</p>}
                  </li>
                ))}</ul>
              ) : <p className="text-ink-600">No reviews yet.</p>}
            </Block>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-4 rounded-xl bg-white p-6 shadow-float">
              <h2 className="text-lg font-bold">Pricing</h2>
              <PriceRow label="Online lesson" value={card.offers_online ? money(card.online_rate ?? card.hourly_rate, card.currency) : 'Not offered'} />
              <PriceRow label="In-person lesson" value={card.offers_physical ? money(card.physical_rate ?? card.hourly_rate, card.currency) : 'Not offered'} />
              <p className="text-xs text-ink-400">Prices are per hour.</p>
              <Link href={`/teachers/${card.id}/book`} className="btn-teal w-full">Book a Lesson</Link>
            </div>
          </aside>
        </div>
      </main>

      {/* sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-ink-200 bg-white p-4 lg:hidden">
        <div><p className="text-xs text-ink-400">From</p><p className="font-heading text-lg font-extrabold">{money(card.online_rate ?? card.hourly_rate, card.currency)}<span className="text-xs font-medium text-ink-400">/hr</span></p></div>
        <Link href={`/teachers/${card.id}/book`} className="btn-teal px-8">Book a Lesson</Link>
      </div>
      <SiteFooter />
    </>
  );
}

function Block({ title, children }) {
  return <section className="rounded-xl bg-white p-7 shadow-card"><h2 className="mb-4 text-xl font-bold">{title}</h2>{children}</section>;
}
function PriceRow({ label, value }) {
  return <div className="flex items-center justify-between rounded-md bg-sky-50 px-4 py-3 text-sm"><span>{label}</span><b>{value}</b></div>;
}

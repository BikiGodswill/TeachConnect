import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import TeacherCard from '@/components/teachers/TeacherCard';
import FilterSidebar from '@/components/teachers/FilterSidebar';
import Reveal from '@/components/ui/Reveal';
import { searchTeachers, getSubjectsWithCounts } from '@/services/teachers';

export const metadata = { title: 'Find Teachers — Teacher Connect' };

export default async function TeachersPage({ searchParams }) {
  const f = searchParams || {};
  const [{ teachers, total, page, size, error }, subjects] = await Promise.all([searchTeachers(f), getSubjectsWithCounts()]);
  const pages = Math.max(1, Math.ceil(total / size));
  const qs = (p) => { const u = new URLSearchParams(f); u.set('page', p); return `/teachers?${u.toString()}`; };
  const hasFilters = Object.keys(f).some((k) => k !== 'page' && f[k]);

  return (
    <>
      <SiteHeader />
      <main className="bg-gradient-to-b from-sky-50 to-white">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <h1 className="text-3xl font-extrabold md:text-4xl">Find a <span className="gradient-text">Teacher</span></h1>
          {!error && <p className="mt-2 text-ink-600">{total} teacher{total === 1 ? '' : 's'} match your search.</p>}
          <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
            <FilterSidebar subjects={subjects} values={f} />
            <section>
              {error ? (
                <div className="rounded-xl bg-white p-12 text-center shadow-card">
                  <h2 className="text-xl font-bold">We couldn&apos;t load teachers right now</h2>
                  <p className="mt-2 text-ink-600">Please check your connection and try again in a moment.</p>
                  <Link href={`/teachers${hasFilters ? `?${new URLSearchParams(f)}` : ''}`} className="btn-teal mt-6">Try again</Link>
                </div>
              ) : teachers.length ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {teachers.map((t, i) => <Reveal key={t.id} delay={(i % 3) * 0.06}><TeacherCard t={t} /></Reveal>)}
                </div>
              ) : (
                <div className="rounded-xl bg-white p-12 text-center shadow-card">
                  <h2 className="text-xl font-bold">No teachers found</h2>
                  <p className="mt-2 text-ink-600">{hasFilters ? 'Try removing a filter or searching a nearby city.' : 'No teachers have joined yet — check back soon.'}</p>
                  {hasFilters && <Link href="/teachers" className="btn-primary mt-6">Clear filters</Link>}
                </div>
              )}
              {!error && pages > 1 && (
                <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Pagination">
                  {page > 1 && <Link className="btn-ghost h-10" href={qs(page - 1)}>Previous</Link>}
                  <span className="text-sm font-semibold">Page {page} of {pages}</span>
                  {page < pages && <Link className="btn-ghost h-10" href={qs(page + 1)}>Next</Link>}
                </nav>
              )}
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

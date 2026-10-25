import { notFound } from 'next/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { STATIC_PAGES } from '@/lib/static-pages';

export function generateStaticParams() {
  return Object.keys(STATIC_PAGES).map((page) => ({ page }));
}
export const dynamicParams = false;

export function generateMetadata({ params }) {
  const p = STATIC_PAGES[params.page];
  return { title: p ? `${p.title} — Teacher Connect` : 'Teacher Connect' };
}

export default function StaticPage({ params }) {
  const p = STATIC_PAGES[params.page];
  if (!p) notFound();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-4xl font-extrabold">{p.title}</h1>
        <p className="mt-4 text-lg text-ink-600">{p.intro}</p>
        <div className="mt-10 space-y-8">
          {p.sections.map(([h, body]) => (
            <section key={h}><h2 className="text-xl font-bold">{h}</h2><p className="mt-2 text-ink-600">{body}</p></section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

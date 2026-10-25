import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';

export const metadata = { title: 'Page not found — Teacher Connect' };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="grid min-h-[60vh] place-items-center bg-gradient-to-br from-lavender-50 via-white to-sky-50 px-5 py-20 text-center">
        <div>
          <p className="gradient-text font-heading text-8xl font-extrabold">404</p>
          <h1 className="mt-4 text-3xl font-extrabold">We couldn&apos;t find that page</h1>
          <p className="mx-auto mt-3 max-w-md text-ink-600">The link may be old, or the page may have moved. Let&apos;s get you back on track.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn-teal">Go home</Link>
            <Link href="/teachers" className="btn-ghost">Find a teacher</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import NearbyClient from '@/components/teachers/NearbyClient';
import { getSubjectsWithCounts } from '@/services/teachers';

export const metadata = { title: 'Teachers near you — Teacher Connect' };

export default async function NearPage() {
  const subjects = await getSubjectsWithCounts();
  return (
    <>
      <SiteHeader />
      <main className="bg-gradient-to-b from-sky-50 to-white">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <h1 className="text-3xl font-extrabold md:text-4xl">Teachers <span className="gradient-text">near you</span></h1>
          <p className="mt-2 text-ink-600">Find in-person teachers around you, or request one right now.</p>
          <div className="mt-8"><NearbyClient subjects={subjects} /></div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

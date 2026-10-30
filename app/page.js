import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import Hero from '@/components/home/Hero';
import QuickSearch from '@/components/home/QuickSearch';
import SubjectGrid from '@/components/home/SubjectGrid';
import { TopTeachers, NearbyTeachers, HowItWorks, TwoSidedCta, WhyUs, LearningJourney, Resources } from '@/components/home/Sections';
import { getSubjectsWithCounts, getTopTeachers, getPlatformStats } from '@/services/teachers';

export const revalidate = 30;

export default async function HomePage() {
  const [subjects, teachers, stats] = await Promise.all([getSubjectsWithCounts(), getTopTeachers(8), getPlatformStats()]);
  return (
    <>
      <SiteHeader />
      <main>
        <Hero stats={stats} />
        <QuickSearch subjects={subjects} />
        <SubjectGrid subjects={subjects} />
        <TopTeachers teachers={teachers} />
        <NearbyTeachers teachers={teachers} />
        <HowItWorks />
        <TwoSidedCta />
        <WhyUs />
        <LearningJourney />
        <Resources />
      </main>
      <SiteFooter />
    </>
  );
}

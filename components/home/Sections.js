import Link from 'next/link';
import { HiMagnifyingGlass, HiCalendarDays, HiAcademicCap, HiArrowTrendingUp, HiCheckBadge, HiClock, HiGlobeAlt, HiLockClosed, HiChatBubbleLeftRight, HiChartBar } from 'react-icons/hi2';
import TeacherCard from '@/components/teachers/TeacherCard';
import Reveal from '@/components/ui/Reveal';

export function TopTeachers({ teachers }) {
  return (
    <section className="bg-gradient-to-b from-sky-50 to-white">
      <div className="section">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="section-title squiggle">Meet Top Teachers</h2>
            <p className="mt-6 text-ink-600">Learn from qualified teachers who match your goals.</p>
          </div>
          <Link href="/teachers" className="btn-ghost h-11">View All Teachers</Link>
        </Reveal>
        {teachers.length ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teachers.slice(0, 4).map((t, i) => <Reveal key={t.id} delay={i * 0.07}><TeacherCard t={t} /></Reveal>)}
          </div>
        ) : (
          <EmptyState title="Teachers are joining soon" text="Be the first to teach on Teacher Connect." href="/become-a-teacher" cta="Become a Teacher" />
        )}
      </div>
    </section>
  );
}

export function NearbyTeachers({ teachers }) {
  const inPerson = teachers.filter((t) => t.offers_physical).slice(0, 4);
  return (
    <section className="section">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="section-title squiggle">Teachers Near You</h2>
          <p className="mt-6 text-ink-600">Find in-person teachers in your area, or learn online.</p>
        </div>
        {/* Live map and distance matching arrive in Phase 2; until then this opens in-person teachers. */}
        <Link href="/teachers/near" className="btn-teal h-11">See Teachers Near You</Link>
      </Reveal>
      {inPerson.length ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {inPerson.map((t, i) => <Reveal key={t.id} delay={i * 0.07}><TeacherCard t={t} /></Reveal>)}
        </div>
      ) : (
        <EmptyState title="No in-person teachers listed yet" text="Search all teachers or learn online." href="/teachers" cta="Find a Teacher" />
      )}
    </section>
  );
}

function EmptyState({ title, text, href, cta }) {
  return (
    <Reveal>
      <div className="mt-12 rounded-xl border border-dashed border-ink-200 bg-white p-10 text-center">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="mt-2 text-ink-600">{text}</p>
        <Link href={href} className="btn-primary mt-6">{cta}</Link>
      </div>
    </Reveal>
  );
}

const steps = [
  { Icon: HiMagnifyingGlass, title: 'Find a Teacher', text: 'Search by subject, level, location and price.' },
  { Icon: HiCalendarDays, title: 'Book a Lesson', text: 'Pick a time that fits your schedule, online or in person.' },
  { Icon: HiAcademicCap, title: 'Learn', text: 'Learn one-to-one with a teacher who knows your goals.' },
  { Icon: HiArrowTrendingUp, title: 'Grow', text: 'Review your teacher and keep building your progress.' },
];
export function HowItWorks() {
  return (
    <section id="how-it-works" className="section scroll-mt-28">
      <Reveal className="text-center"><h2 className="section-title squiggle">How It Works</h2></Reveal>
      <div className="mt-14 grid gap-8 md:grid-cols-4">
        {steps.map(({ Icon, title, text }, i) => (
          <Reveal key={title} delay={i * 0.1}>
            <div className="group relative text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-lavender-100 to-sky-100 text-navy-900 transition duration-300 group-hover:scale-110 group-hover:shadow-glow"><Icon size={34} /></div>
              <span className="absolute left-1/2 top-0 -ml-12 grid h-7 w-7 place-items-center rounded-full bg-warm-gradient text-xs font-extrabold">{i + 1}</span>
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm text-ink-600">{text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function TwoSidedCta() {
  return (
    <section className="section grid gap-6 md:grid-cols-2">
      <Reveal>
        <div className="relative h-full overflow-hidden rounded-xl bg-gradient-to-br from-ink-100 to-lavender-100 p-10">
          <p className="text-sm font-semibold text-teal-600">Learn together with</p>
          <h3 className="mt-2 text-3xl font-extrabold">Learn with an Expert</h3>
          <p className="mt-3 max-w-sm text-ink-600">Find qualified teachers who match your subject, level, location and schedule.</p>
          <Link href="/teachers" className="btn-teal mt-8">Find a Teacher</Link>
          <div className="absolute -bottom-10 -right-10 h-48 w-48 animate-blob rounded-full border-2 border-dashed border-brandyellow-500" />
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="relative h-full overflow-hidden rounded-xl bg-gradient-to-br from-sky-100 to-teal-100 p-10">
          <p className="text-sm font-semibold text-teal-600">Share your skills</p>
          <h3 className="mt-2 text-3xl font-extrabold">Teach What You Know</h3>
          <p className="mt-3 max-w-sm text-ink-600">Join Teacher Connect and connect with students who need your expertise.</p>
          <Link href="/become-a-teacher" className="btn-primary mt-8">Become a Teacher</Link>
          <div className="absolute -bottom-10 -right-10 h-48 w-48 animate-blob rounded-full border-2 border-dashed border-teal-500" />
        </div>
      </Reveal>
    </section>
  );
}

const why = [
  { Icon: HiCheckBadge, title: 'Verified Teachers', text: 'Identity and qualifications reviewed before the badge is awarded.' },
  { Icon: HiClock, title: 'Flexible Learning', text: 'Book one lesson or a regular schedule that suits you.' },
  { Icon: HiGlobeAlt, title: 'Online & In-Person', text: 'Learn from home or have a teacher come to you.' },
  { Icon: HiLockClosed, title: 'Secure Payments', text: 'Pay in the app for dispute protection, or pay your teacher directly.' },
  { Icon: HiChatBubbleLeftRight, title: 'Real-Time Communication', text: 'Message your teacher before and after every lesson.' },
  { Icon: HiChartBar, title: 'Learning Progress', text: 'Track lessons, assignments and results in one place.' },
];
export function WhyUs() {
  return (
    <section className="bg-gradient-to-br from-lavender-50 via-white to-sky-50">
      <div className="section">
        <Reveal className="text-center"><h2 className="section-title squiggle">Why Teacher Connect</h2></Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {why.map(({ Icon, title, text }, i) => (
            <Reveal key={title} delay={(i % 3) * 0.08}>
              <div className="card h-full p-7">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-gradient text-white shadow-glow"><Icon size={24} /></span>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm text-ink-600">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LearningJourney() {
  const items = ['Upcoming lesson', 'Assignments', 'Progress', 'Recent results', 'Favorite teachers'];
  return (
    <section className="section">
      <Reveal>
        <div className="relative overflow-hidden rounded-xl bg-navy-gradient p-10 text-white md:p-14">
          <div className="absolute -right-16 -top-16 h-72 w-72 animate-blob rounded-full bg-teal-500/20" />
          <h2 className="relative text-3xl font-extrabold md:text-4xl">Your Learning Journey</h2>
          <p className="relative mt-3 max-w-xl text-white/70">Everything you need after booking — in one dashboard.</p>
          <div className="relative mt-8 flex flex-wrap gap-3">
            {items.map((i) => <span key={i} className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold backdrop-blur">{i}</span>)}
          </div>
          <Link href="/dashboard" className="btn relative mt-10 bg-warm-gradient text-navy-900 hover:-translate-y-0.5 hover:brightness-105">Go to Learning Dashboard</Link>
        </div>
      </Reveal>
    </section>
  );
}

export function Resources() {
  const cats = ['Study Tips', 'Mathematics', 'Physics', 'Career', 'Technology', 'Teaching', 'Exam Preparation'];
  return (
    <section id="resources" className="scroll-mt-28 bg-gradient-to-b from-sky-50 to-white">
      <div className="section">
        <Reveal>
          <h2 className="section-title squiggle">Resources</h2>
          <div className="mt-10 flex flex-wrap gap-3">
            {cats.map((c) => <span key={c} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold shadow-card">{c}</span>)}
          </div>
          <p className="mt-8 text-ink-600">Study guides and exam tips are coming soon. <Link href="/resources" className="font-bold text-teal-600">Learn more</Link></p>
        </Reveal>
      </div>
    </section>
  );
}

import Link from 'next/link';
import { HiBanknotes, HiCheckBadge, HiCalendarDays, HiLockClosed } from 'react-icons/hi2';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';

export const metadata = { title: 'Become a Teacher — Teacher Connect' };

const perks = [
  { Icon: HiBanknotes, title: 'Free to join', text: 'No subscription. We only earn a small fee when a lesson is paid through the app.' },
  { Icon: HiCalendarDays, title: 'You set the schedule', text: 'Choose your subjects, prices, areas and the hours you are available.' },
  { Icon: HiCheckBadge, title: 'Get verified', text: 'Upload your ID and qualifications to earn a Verified badge students trust.' },
  { Icon: HiLockClosed, title: 'Protected payments', text: 'In-app payments go to your wallet. Choose how long to hold them before withdrawing.' },
];
const steps = ['Create your free teacher account', 'Add your subjects, prices and availability', 'Submit your documents for verification', 'Accept requests and start teaching'];

export default function BecomeTeacher() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-gradient-to-br from-lavender-50 via-white to-sky-50">
          <div className="mx-auto max-w-4xl px-5 py-20 text-center">
            <h1 className="text-5xl font-extrabold md:text-6xl"><span className="relative inline-block squiggle">Teach What You Know</span></h1>
            <p className="mx-auto mt-8 max-w-xl text-lg text-ink-600">Join Teacher Connect and connect with students who need your expertise.</p>
            <Link href="/signup?role=teacher" className="btn-teal mt-8 px-10">Create teacher account</Link>
          </div>
        </section>
        <section className="section">
          <div className="grid gap-6 sm:grid-cols-2">
            {perks.map(({ Icon, title, text }) => (
              <div key={title} className="card p-7">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-teal-100 text-teal-600"><Icon size={24} /></span>
                <h2 className="mt-5 text-lg font-bold">{title}</h2>
                <p className="mt-2 text-sm text-ink-600">{text}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="bg-sky-50">
          <div className="section">
            <h2 className="section-title squiggle">How it works for teachers</h2>
            <ol className="mt-12 grid gap-4 md:grid-cols-2">
              {steps.map((s, i) => (
                <li key={s} className="flex items-center gap-4 rounded-lg bg-white p-5 shadow-card">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brandyellow-500 font-extrabold">{i + 1}</span>
                  <span className="font-semibold">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

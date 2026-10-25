'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiCheckBadge, HiMapPin, HiAcademicCap, HiBookOpen } from 'react-icons/hi2';

// Floating cards only show real numbers; nothing is invented.
export default function Hero({ stats }) {
  const showStat = stats && stats.verified > 0;
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-lavender-50 via-white to-sky-50">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-28 pt-12 md:pt-20 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-card">
            <HiAcademicCap className="text-teal-500" /> Learn with the right teacher
          </span>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] md:text-6xl">
            Find the Right Teacher.<br />
            <span className="relative inline-block squiggle">Learn Better.</span>
          </h1>
          <p className="mt-8 max-w-lg text-lg text-ink-600">
            Connect with qualified teachers for personalized online and in-person learning.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/teachers" className="btn-teal px-8">Find a Teacher</Link>
            <Link href="/become-a-teacher" className="btn-ghost px-8">Become a Teacher</Link>
          </div>
        </motion.div>

        <motion.div className="relative mx-auto h-[420px] w-full max-w-[520px] md:h-[500px]"
          initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }}>
          {/* soft circular backdrop + decorative shapes (as in references) */}
          <div className="absolute inset-6 animate-blob rounded-full bg-gradient-to-br from-sky-100 to-lavender-100" />
          <div className="absolute inset-16 rounded-full bg-gradient-to-br from-brandyellow-100 to-peach-100" />
          <div className="absolute right-4 top-6 h-6 w-6 rotate-12 bg-[#FF3B5C]" />
          <div className="absolute -left-2 top-24 h-24 w-24 opacity-60"
            style={{ backgroundImage: 'radial-gradient(#FFC53D 2px, transparent 2px)', backgroundSize: '12px 12px' }} />
          <div className="absolute bottom-10 right-0 h-28 w-28 -rotate-12 opacity-70"
            style={{ backgroundImage: 'repeating-linear-gradient(135deg,#FFC53D 0 6px,transparent 6px 14px)' }} />
          {/* PLACEHOLDER illustration — swap with a licensed teacher/student photo (transparent PNG) at /public/hero.png */}
          <div className="absolute inset-0 grid place-items-center">
            <div className="grid h-56 w-56 animate-float place-items-center rounded-full bg-navy-gradient text-white shadow-float">
              <HiBookOpen size={96} />
            </div>
          </div>

          <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 4 }}
            className="absolute -left-2 bottom-24 rounded-xl bg-white p-4 shadow-float md:-left-8">
            <div className="flex items-center gap-2 text-sm font-bold">
              <HiCheckBadge className="text-teal-500" size={22} />
              {showStat ? `${stats.verified}+ Verified Teachers` : 'Verified Teachers'}
            </div>
            <p className="mt-1 text-xs text-ink-600">ID and qualifications checked</p>
          </motion.div>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 5 }}
            className="absolute right-0 top-20 rounded-xl bg-white p-4 shadow-float">
            <div className="flex items-center gap-2 text-sm font-bold"><HiMapPin className="text-teal-500" size={20} /> Teachers Near You</div>
            <p className="mt-1 text-xs text-ink-600">Online or in person</p>
          </motion.div>
        </motion.div>
      </div>
      {/* curved bottom edge from reference 2 */}
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
        <path d="M0 80V40C240 0 480 0 720 20s480 20 720-10v70z" fill="#fff" />
      </svg>
    </section>
  );
}

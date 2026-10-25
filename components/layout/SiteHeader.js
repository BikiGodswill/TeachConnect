'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiBars3, HiXMark, HiMagnifyingGlass } from 'react-icons/hi2';
import Logo from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';

const links = [
  { href: '/', label: 'Home' },
  { href: '/teachers', label: 'Find Teachers' },
  { href: '/#subjects', label: 'Subjects' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/become-a-teacher', label: 'Become a Teacher' },
  { href: '/resources', label: 'Resources' },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // show "Dashboard" instead of Login / Sign Up when a session exists
  useEffect(() => {
    let alive = true;
    createClient().auth.getUser().then(({ data }) => { if (alive) setSignedIn(!!data?.user); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-navy-gradient px-4 py-2 text-center text-xs font-medium text-white">
        Start your learning journey today — find the right teacher for you.
      </div>
      <nav className={`border-b bg-white/85 backdrop-blur transition-shadow ${scrolled ? 'border-transparent shadow-card' : 'border-ink-200'}`}>
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5">
          <Logo />
          <ul className="hidden items-center gap-8 lg:flex">
            {links.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="relative text-sm font-semibold text-navy-900/80 transition hover:text-teal-500 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded after:bg-teal-500 after:transition-all hover:after:w-full">{l.label}</Link>
              </li>
            ))}
          </ul>
          <div className="hidden items-center gap-3 lg:flex">
            {signedIn ? (
              <Link href="/dashboard" className="btn-teal h-11 px-6">My Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost h-11 px-6">Login</Link>
                <Link href="/signup" className="btn-teal h-11 px-6">Sign Up</Link>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <Link href="/teachers" aria-label="Search teachers" className="grid h-10 w-10 place-items-center rounded-full bg-sky-50"><HiMagnifyingGlass size={20} /></Link>
            <button aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-full bg-sky-50">
              {open ? <HiXMark size={22} /> : <HiBars3 size={22} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-ink-200 bg-white lg:hidden">
              <div className="px-5 pb-5">
                {links.map((l) => (
                  <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="block py-3 text-base font-semibold">{l.label}</Link>
                ))}
                <div className="mt-3 flex gap-3">
                  {signedIn ? <Link href="/dashboard" className="btn-teal flex-1">My Dashboard</Link> : (
                    <>
                      <Link href="/login" className="btn-ghost flex-1">Login</Link>
                      <Link href="/signup" className="btn-teal flex-1">Sign Up</Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

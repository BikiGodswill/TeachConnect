'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HiArrowRightOnRectangle } from 'react-icons/hi2';
import Logo from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';
import NotificationBell from '@/components/dashboard/NotificationBell';

// items: [{ href, label, icon: Component }]
export default function DashboardShell({ items, user, profileHref, children }) {
  const path = usePathname();
  const router = useRouter();
  const active = (href) => (href === items[0].href ? path === href : path.startsWith(href));

  async function logout() {
    await createClient().auth.signOut();
    router.replace('/');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-sky-50 lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-ink-200 bg-white p-5 lg:flex">
        <Logo />
        <nav className="mt-10 flex-1 space-y-1">
          {items.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition ${active(href) ? 'bg-navy-900 text-white' : 'text-ink-600 hover:bg-sky-50'}`}>
              <Icon size={20} /> {label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold text-ink-600 hover:bg-sky-50">
          <HiArrowRightOnRectangle size={20} /> Log out
        </button>
      </aside>

      <div className="pb-24 lg:pb-0">
        <header className="flex items-center justify-between border-b border-ink-200 bg-white px-5 py-4">
          <div className="lg:hidden"><Logo /></div>
          <p className="hidden text-sm text-ink-600 lg:block">Hello, <span className="font-bold text-navy-900">{user.full_name}</span></p>
          <div className="flex items-center gap-3">
            <NotificationBell userId={user.id} />
            {profileHref && (
              <Link href={profileHref} aria-label="My profile" className="grid h-10 w-10 place-items-center rounded-full bg-navy-900 text-sm font-bold text-white lg:hidden">
                {(user.full_name || '?').trim().charAt(0).toUpperCase()}
              </Link>
            )}
            <button onClick={logout} aria-label="Log out" className="grid h-10 w-10 place-items-center rounded-full bg-sky-50 lg:hidden"><HiArrowRightOnRectangle size={20} /></button>
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-5 md:p-8">{children}</main>
      </div>

      {/* mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-ink-200 bg-white px-1 py-2 lg:hidden">
        {items.filter((i) => i.mobile !== false).slice(0, 5).map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[11px] font-semibold ${active(href) ? 'text-teal-600' : 'text-ink-400'}`}>
            <Icon size={22} /> {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

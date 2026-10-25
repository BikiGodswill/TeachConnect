import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/supabase/auth-server';
import { money } from '@/lib/format';

export const metadata = { title: 'Admin — Teacher Connect' };

export default async function AdminHome() {
  const { db, profile } = await getSessionUser();
  if (profile?.role !== 'ADMIN') redirect('/');
  const { data } = await db.rpc('admin_overview');
  const o = data?.[0] || {};
  const cards = [
    ['Pending verifications', o.pending_verifications ?? 0, '/admin/verification', 'bg-lavender-100'],
    ['Open disputes', o.open_disputes ?? 0, '/admin/disputes', 'bg-peach-100'],
    ['Pending withdrawals', o.pending_withdrawals ?? 0, '/admin/withdrawals', 'bg-brandyellow-100'],
    ['Open safety alerts', o.open_incidents ?? 0, '/admin/safety', 'bg-peach-100'],
    ['Open user reports', o.open_reports ?? 0, '/admin/safety', 'bg-sky-100'],
  ];
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold">Admin overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, n, href, tone]) => (
          <Link key={label} href={href} className={`rounded-lg p-6 shadow-card transition hover:shadow-cardHover ${tone}`}>
            <p className="text-xs font-bold opacity-70">{label}</p>
            <p className="mt-2 font-heading text-4xl font-extrabold">{n}</p>
          </Link>
        ))}
      </div>
      <div className="card p-6"><p className="text-xs font-bold text-ink-600">Teacher funds held or disputed</p><p className="mt-2 font-heading text-2xl font-extrabold">{money(o.held_funds)}</p></div>
    </div>
  );
}

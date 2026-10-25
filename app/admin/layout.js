import { redirect } from 'next/navigation';
import { HiShieldCheck, HiScale, HiHome, HiBanknotes, HiShieldExclamation } from 'react-icons/hi2';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { getSessionUser, homeForRole } from '@/lib/supabase/auth-server';

const items = [
  { href: '/admin', label: 'Overview', icon: HiHome },
  { href: '/admin/verification', label: 'Verify', icon: HiShieldCheck },
  { href: '/admin/disputes', label: 'Disputes', icon: HiScale },
  { href: '/admin/withdrawals', label: 'Payouts', icon: HiBanknotes, HiShieldExclamation },
];

export default async function AdminLayout({ children }) {
  const { user, profile } = await getSessionUser();
  if (!user) redirect('/login');
  if (profile?.role !== 'ADMIN') redirect(homeForRole(profile?.role));
  return <DashboardShell items={items} user={profile}>{children}</DashboardShell>;
}

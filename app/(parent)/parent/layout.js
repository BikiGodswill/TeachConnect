import { redirect } from 'next/navigation';
import { HiHome, HiUsers, HiCalendarDays, HiChatBubbleLeftRight, HiUser, HiMagnifyingGlass, HiBolt } from 'react-icons/hi2';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { getSessionUser, homeForRole } from '@/lib/supabase/auth-server';

const items = [
  { href: '/parent', label: 'Home', icon: HiHome },
  { href: '/parent/children', label: 'Children', icon: HiUsers },
  { href: '/teachers', label: 'Find', icon: HiMagnifyingGlass, HiBolt },
  { href: '/parent/instant', label: 'Instant', icon: HiBolt, mobile: false },
  { href: '/parent/bookings', label: 'Bookings', icon: HiCalendarDays },
  { href: '/parent/messages', label: 'Messages', icon: HiChatBubbleLeftRight },
  { href: '/parent/profile', label: 'Profile', icon: HiUser, mobile: false },
];

export default async function ParentLayout({ children }) {
  const { user, profile } = await getSessionUser();
  if (!user) redirect('/login');
  if (profile?.role !== 'PARENT') redirect(homeForRole(profile?.role));
  return <DashboardShell items={items} user={profile} profileHref="/parent/profile">{children}</DashboardShell>;
}

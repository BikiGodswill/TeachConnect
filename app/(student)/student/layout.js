import { redirect } from 'next/navigation';
import { HiHome, HiMagnifyingGlass, HiCalendarDays, HiChatBubbleLeftRight, HiUser, HiHeart, HiBolt } from 'react-icons/hi2';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { getSessionUser, homeForRole } from '@/lib/supabase/auth-server';

const items = [
  { href: '/student', label: 'Home', icon: HiHome },
  { href: '/teachers', label: 'Find', icon: HiMagnifyingGlass },
  { href: '/student/instant', label: 'Instant', icon: HiBolt },
  { href: '/student/bookings', label: 'Bookings', icon: HiCalendarDays },
  { href: '/student/messages', label: 'Messages', icon: HiChatBubbleLeftRight },
  { href: '/student/favorites', label: 'Favorites', icon: HiHeart, mobile: false },
  { href: '/student/profile', label: 'Profile', icon: HiUser, mobile: false },
];

export default async function StudentLayout({ children }) {
  const { user, profile } = await getSessionUser();
  if (!user) redirect('/login');
  if (profile?.role !== 'STUDENT') redirect(homeForRole(profile?.role));
  return <DashboardShell items={items} user={profile} profileHref="/student/profile">{children}</DashboardShell>;
}

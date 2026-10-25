import { redirect } from 'next/navigation';
import { HiHome, HiInboxArrowDown, HiCalendarDays, HiChatBubbleLeftRight, HiWallet, HiStar, HiUser, HiBolt, HiChartBar, HiGift } from 'react-icons/hi2';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { getSessionUser, homeForRole } from '@/lib/supabase/auth-server';

const items = [
  { href: '/teacher', label: 'Home', icon: HiHome },
  { href: '/teacher/requests', label: 'Requests', icon: HiInboxArrowDown },
  { href: '/teacher/instant', label: 'Instant', icon: HiBolt },
  { href: '/teacher/schedule', label: 'Schedule', icon: HiCalendarDays },
  { href: '/teacher/messages', label: 'Messages', icon: HiChatBubbleLeftRight },
  { href: '/teacher/wallet', label: 'Wallet', icon: HiWallet, mobile: false },
  { href: '/teacher/analytics', label: 'Analytics', icon: HiChartBar, mobile: false },
  { href: '/teacher/packages', label: 'Packages', icon: HiGift, mobile: false },
  { href: '/teacher/reviews', label: 'Reviews', icon: HiStar, mobile: false },
  { href: '/teacher/profile', label: 'Profile', icon: HiUser, mobile: false },
];

export default async function TeacherLayout({ children }) {
  const { user, profile } = await getSessionUser();
  if (!user) redirect('/login');
  if (profile?.role !== 'TEACHER') redirect(homeForRole(profile?.role));
  return <DashboardShell items={items} user={profile} profileHref="/teacher/profile">{children}</DashboardShell>;
}

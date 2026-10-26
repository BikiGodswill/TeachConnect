import DashboardShell from '@/components/dashboard/DashboardShell';
import ProfileMissing from '@/components/dashboard/ProfileMissing';
import { redirect } from 'next/navigation';
import { getSessionUser, homeForRole } from '@/lib/supabase/auth-server';
import { NAV } from '@/lib/nav';

export default async function SchoolLayout({ children }) {
  const { user, profile } = await getSessionUser();
  if (!user) redirect('/login');
  if (!profile) return <ProfileMissing />;
  if (profile.role !== 'SCHOOL') redirect(profile.role === 'ADMIN' ? '/admin' : '/become-a-school');
  return <DashboardShell items={NAV.SCHOOL} user={profile} profileHref="/school/profile">{children}</DashboardShell>;
}

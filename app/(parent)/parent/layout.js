import DashboardShell from '@/components/dashboard/DashboardShell';
import ProfileMissing from '@/components/dashboard/ProfileMissing';
import { requireRole } from '@/lib/require-role';
import { NAV } from '@/lib/nav';

export default async function Layout({ children }) {
  const { profile, missingProfile } = await requireRole('PARENT');
  if (missingProfile) return <ProfileMissing />;
  return <DashboardShell items={NAV.PARENT} user={profile} profileHref="/parent/profile">{children}</DashboardShell>;
}

import { redirect } from 'next/navigation';
import { getSessionUser, homeForRole } from '@/lib/supabase/auth-server';

export default async function DashboardRedirect() {
  const { user, profile } = await getSessionUser();
  if (!user) redirect('/login?next=/dashboard');
  redirect(homeForRole(profile?.role));
}

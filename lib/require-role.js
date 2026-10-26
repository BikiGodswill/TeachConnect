import { redirect } from 'next/navigation';
import { getSessionUser, homeForRole } from '@/lib/supabase/auth-server';

// Used by every dashboard layout. Never redirects in a loop: a signed-in user
// without a profile row gets { missingProfile: true } instead of a redirect.
export async function requireRole(role) {
  const { db, user, profile } = await getSessionUser();
  if (!user) redirect('/login');
  if (!profile) return { db, user, profile: null, missingProfile: true };
  if (profile.role !== role) {
    const home = homeForRole(profile.role);
    if (home !== `/${role.toLowerCase()}`) redirect(home);
  }
  return { db, user, profile, missingProfile: false };
}

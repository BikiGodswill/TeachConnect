import { getSessionUser } from '@/lib/supabase/auth-server';

// Returns the admin profile or null. Used by every admin API route and page
// (the layout check alone is not enough: route handlers are not wrapped by layouts).
export async function getAdmin() {
  const { user, profile } = await getSessionUser();
  if (!user || profile?.role !== 'ADMIN') return null;
  return profile;
}

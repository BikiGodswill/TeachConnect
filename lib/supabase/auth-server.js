import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Cookie-authenticated server client (RLS applies as the signed-in user).
export function createAuthClient() {
  const store = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key',
    {
      // Never let Next.js cache database reads: dashboards must always show live data.
      global: { fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }) },
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => {
          try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* called from a Server Component */ }
        },
      },
    }
  );
}

export async function getSessionUser() {
  const db = createAuthClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { db, user: null, profile: null };
  const { data: profile } = await db.from('users').select('id,role,full_name,avatar_url').eq('id', user.id).single();
  return { db, user, profile };
}

export const homeForRole = (role) =>
  ({ TEACHER: '/teacher', ADMIN: '/admin', STUDENT: '/student', PARENT: '/parent', SCHOOL: '/school' }[role] || '/student');

import { createClient } from '@supabase/supabase-js';

// Anonymous server client for PUBLIC data only (teacher_cards, subjects).
// Never use the service role key here.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key',
    { auth: { persistSession: false }, global: { fetch: (u, o) => fetch(u, { ...o, next: { revalidate: 30 } }) } }
  );
}

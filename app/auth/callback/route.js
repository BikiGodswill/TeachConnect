import { NextResponse } from 'next/server';
import { createAuthClient } from '@/lib/supabase/auth-server';

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const role = (url.searchParams.get('role') || '').toUpperCase();
  const nextParam = url.searchParams.get('next') || '';
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/dashboard';
  if (code) {
    const db = createAuthClient();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL('/login?error=oauth', url.origin));
    // Google signup: apply the account type chosen on the signup form (only works for a brand-new account)
    if (['TEACHER', 'PARENT', 'STUDENT'].includes(role)) await db.rpc('choose_initial_role', { p_role: role });
  }
  return NextResponse.redirect(new URL(next, url.origin));
}

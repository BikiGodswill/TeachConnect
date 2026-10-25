import { NextResponse } from 'next/server';
import { createAuthClient } from '@/lib/supabase/auth-server';

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (code) {
    const db = createAuthClient();
    await db.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL('/dashboard', url.origin));
}

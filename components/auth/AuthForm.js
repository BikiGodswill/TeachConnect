'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { friendlyError } from '@/lib/errors';

// Admins are created in SQL; schools arrive in a later phase.
const ROLES = [
  { value: 'STUDENT', label: 'I want to learn' },
  { value: 'PARENT', label: 'I’m a parent' },
  { value: 'TEACHER', label: 'I want to teach' },
];

export default function AuthForm({ mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState(['TEACHER', 'PARENT'].includes(params.get('role')?.toUpperCase()) ? params.get('role').toUpperCase() : 'STUDENT');
  const isSignup = mode === 'signup';

  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get('email')).trim();
    const password = String(f.get('password'));
    if (isSignup && password.length < 8) return toast.error('Password must be at least 8 characters');
    setBusy(true);
    const supabase = createClient();
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: String(f.get('full_name')).trim(), role }, emailRedirectTo: `${location.origin}/auth/callback` },
        });
        if (error) throw error;
        if (!data.session) { toast.success('Check your email to confirm your account.'); return; }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      const next = params.get('next');
      // only same-site relative redirects (blocks open-redirect via ?next=//evil.com)
      router.replace(next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard');
      router.refresh();
    } catch (err) {
      toast.error(friendlyError(err));
    } finally { setBusy(false); }
  }

  const input = 'h-12 w-full rounded-md border border-ink-200 bg-white px-4 text-sm outline-none focus:border-teal-500';
  return (
    <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 shadow-float">
      <div>
        <h1 className="text-2xl font-extrabold">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        <p className="mt-1 text-sm text-ink-600">{isSignup ? "Find a teacher, or start teaching — it's free to join." : 'Log in to continue your learning journey.'}</p>
      </div>
      {isSignup && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((r) => (
              <button type="button" key={r.value} onClick={() => setRole(r.value)}
                className={`rounded-md border px-2 py-3 text-xs font-bold transition ${role === r.value ? 'border-teal-500 bg-teal-100 text-teal-600' : 'border-ink-200'}`}>
                {r.label}
              </button>
            ))}
          </div>
          <input name="full_name" required placeholder="Full name" className={input} autoComplete="name" />
        </>
      )}
      <input name="email" type="email" required placeholder="Email" className={input} autoComplete="email" />
      <input name="password" type="password" required placeholder="Password" className={input} autoComplete={isSignup ? 'new-password' : 'current-password'} />
      <button disabled={busy} className="btn-teal w-full disabled:opacity-60">{busy ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}</button>
      <p className="text-center text-sm text-ink-600">
        {isSignup ? 'Already have an account?' : 'New to Teacher Connect?'}{' '}
        <Link href={isSignup ? '/login' : '/signup'} className="font-bold text-teal-600">{isSignup ? 'Log in' : 'Sign up'}</Link>
      </p>
    </form>
  );
}

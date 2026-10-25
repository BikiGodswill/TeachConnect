import { Suspense } from 'react';
import SiteHeader from '@/components/layout/SiteHeader';
import AuthForm from '@/components/auth/AuthForm';

export const metadata = { title: 'Sign up — Teacher Connect' };

export default function SignupPage() {
  return (
    <>
      <SiteHeader />
      <main className="grid min-h-[70vh] place-items-center bg-gradient-to-br from-lavender-50 to-sky-50 px-5 py-14">
        <Suspense><AuthForm mode="signup" /></Suspense>
      </main>
    </>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import RpcForm from '@/components/forms/RpcForm';
import { getSessionUser } from '@/lib/supabase/auth-server';

export const metadata = { title: 'Register your school — Teacher Connect' };

export default async function BecomeSchool() {
  const { user, profile } = await getSessionUser();
  if (profile?.role === 'SCHOOL') redirect('/school');
  return (
    <>
      <SiteHeader />
      <main className="bg-sky-50 px-5 py-14">
        <div className="mx-auto max-w-xl space-y-6">
          <div><h1 className="text-3xl font-extrabold">Register your school</h1><p className="mt-2 text-ink-600">Post teaching jobs and find verified teachers. Our team verifies every school before it can post.</p></div>
          {!user ? <div className="card p-6 text-sm">Create an account with your school&apos;s email first. <Link href="/signup" className="font-bold text-teal-600 underline">Sign up</Link> or <Link href="/login?next=/become-a-school" className="font-bold text-teal-600 underline">log in</Link>.</div>
            : ['TEACHER', 'ADMIN'].includes(profile?.role) ? <div className="card p-6 text-sm">Teacher and admin accounts cannot be school accounts. Use a separate email for your school.</div>
            : <RpcForm rpc="register_school" redirectTo="/school" submit="Register school" success="School registered. We will verify it soon." fields={[
              { name: 'p_name', label: 'School name', required: true, max: 120 },
              { name: 'p_city', label: 'City', max: 80 },
              { name: 'p_description', label: 'About the school', type: 'textarea', max: 1500 },
            ]} />}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

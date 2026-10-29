import { getSessionUser } from '@/lib/supabase/auth-server';
import ParentProfileForm from '@/components/profile/ParentProfileForm';
import EmailPrefToggle from '@/components/forms/EmailPrefToggle';

export const metadata = { title: 'Profile — Teacher Connect' };

export default async function ParentProfile() {
  const { db, user, profile } = await getSessionUser();
  const [{ data: u }, { data: pp }] = await Promise.all([
    db.from('users').select('phone').eq('id', user.id).maybeSingle(),
    db.from('parent_profiles').select('city').eq('id', user.id).maybeSingle(),
  ]);
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-extrabold">Profile</h1>
      <ParentProfileForm userId={user.id} email={user.email} user={{ ...profile, phone: u?.phone }} city={pp?.city || ''} />
      <EmailPrefToggle />
    </div>
  );
}

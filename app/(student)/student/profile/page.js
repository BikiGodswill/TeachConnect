import { getSessionUser } from '@/lib/supabase/auth-server';
import StudentProfileForm from '@/components/profile/StudentProfileForm';

export const metadata = { title: 'Profile — Teacher Connect' };

export default async function StudentProfile() {
  const { db, user, profile } = await getSessionUser();
  const { data: sp } = await db.from('student_profiles').select('*').eq('id', user.id).maybeSingle();
  const { data: u } = await db.from('users').select('phone').eq('id', user.id).maybeSingle();
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-extrabold">Profile</h1>
      <StudentProfileForm userId={user.id} email={user.email} user={{ ...profile, phone: u?.phone }} sp={sp || {}} />
    </div>
  );
}

import { getSessionUser } from '@/lib/supabase/auth-server';
import PackagesManager from '@/components/profile/PackagesManager';

export const metadata = { title: 'Lesson packages — Teacher Connect' };

export default async function TeacherPackages() {
  const { db, user } = await getSessionUser();
  const { data } = await db.from('lesson_packages').select('*').eq('teacher_id', user.id).order('created_at', { ascending: false });
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Lesson packages</h1>
        <p className="mt-1 text-sm text-ink-600">Offer a discount when a student books several weekly lessons together. Each lesson is still accepted, paid and settled on its own.</p>
      </div>
      <PackagesManager initial={data || []} userId={user.id} />
    </div>
  );
}

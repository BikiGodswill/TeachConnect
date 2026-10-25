import { getSessionUser } from '@/lib/supabase/auth-server';
import ChildrenManager from '@/components/profile/ChildrenManager';

export const metadata = { title: 'Children — Teacher Connect' };

export default async function Children() {
  const { db, user } = await getSessionUser();
  const { data } = await db.from('children').select('*').eq('parent_id', user.id).order('created_at');
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Your children</h1>
        <p className="mt-1 text-sm text-ink-600">Add each child you book lessons for. Teachers see only the name, level and goals you enter, for lessons they are booked on.</p>
      </div>
      <ChildrenManager initial={data || []} userId={user.id} />
    </div>
  );
}

import { getSessionUser } from '@/lib/supabase/auth-server';
import LearningHub from '@/components/learning/LearningHub';

export const metadata = { title: 'Learning — Teacher Connect' };

export default async function ParentLearning({ searchParams }) {
  const { db, user } = await getSessionUser();
  const { data: kids } = await db.from('children').select('id,full_name').eq('parent_id', user.id).order('full_name');
  const chosen = (kids || []).find((k) => k.id === searchParams?.c) || kids?.[0] || null;
  return <LearningHub db={db} user={user} role="PARENT" childId={chosen?.id || null} kids={kids || []} />;
}

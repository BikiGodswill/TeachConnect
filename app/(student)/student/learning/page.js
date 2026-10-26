import { getSessionUser } from '@/lib/supabase/auth-server';
import LearningHub from '@/components/learning/LearningHub';

export const metadata = { title: 'Learning — Teacher Connect' };

export default async function StudentLearning() {
  const { db, user } = await getSessionUser();
  return <LearningHub db={db} user={user} role="STUDENT" childId={null} />;
}

import { getSessionUser } from '@/lib/supabase/auth-server';
import RewardsPanel from '@/components/rewards/RewardsPanel';
export const metadata = { title: 'Rewards — Teacher Connect' };
export default async function Page() {
  const { db, user } = await getSessionUser();
  return <RewardsPanel db={db} userId={user.id} />;
}

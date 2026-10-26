import { getSessionUser } from '@/lib/supabase/auth-server';
import PaymentsList from '@/components/payments/PaymentsList';
export const metadata = { title: 'Payments — Teacher Connect' };
export default async function Page() {
  const { db, user } = await getSessionUser();
  return <PaymentsList db={db} userId={user.id} home="/student" />;
}

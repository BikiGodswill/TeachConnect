import { getSessionUser } from '@/lib/supabase/auth-server';
import MessagesClient from '@/components/messaging/MessagesClient';

export const metadata = { title: 'Messages — Teacher Connect' };

export default async function TeacherMessages({ searchParams }) {
  const { db, user } = await getSessionUser();
  const { data } = await db.rpc('conversation_list');
  return <MessagesClient userId={user.id} initialConversations={data || []} initialActive={searchParams?.c || null} />;
}

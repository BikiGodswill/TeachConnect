import { getSessionUser } from '@/lib/supabase/auth-server';
import InstantInbox from '@/components/instant/InstantInbox';

export const metadata = { title: 'Instant requests — Teacher Connect' };

export default async function TeacherInstant() {
  const { db, user } = await getSessionUser();
  const [{ data: tp }, { data: base }] = await Promise.all([
    db.from('teacher_profiles').select('available_until,verification').eq('id', user.id).maybeSingle(),
    db.from('teacher_base_locations').select('teacher_id').eq('teacher_id', user.id).maybeSingle(),
  ]);
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-3xl font-extrabold">Instant requests</h1>
      <InstantInbox availableUntil={tp?.available_until} hasBase={!!base} verified={tp?.verification === 'VERIFIED'} />
    </div>
  );
}

import { getSessionUser } from '@/lib/supabase/auth-server';
import InstantClient from '@/components/instant/InstantClient';

export const metadata = { title: 'Request a teacher now — Teacher Connect' };

export default async function ParentInstant() {
  const { db, user } = await getSessionUser();
  const [{ data: subjects }, { data: kids }, { data: active }] = await Promise.all([
    db.from('subjects').select('id,name').order('name'),
    db.from('children').select('id,full_name').eq('parent_id', user.id).order('full_name'),
    db.from('instant_requests').select('id,expires_at').eq('student_id', user.id).eq('status', 'SEARCHING').maybeSingle(),
  ]);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Request a teacher <span className="gradient-text">now</span></h1>
        <p className="mt-1 text-sm text-ink-600">We ask verified teachers near you who are available right now. The first to accept gets the lesson.</p>
      </div>
      <InstantClient subjects={subjects || []} children={kids || []} isParent defaultSubject="" activeId={active?.id || null} activeExpires={active?.expires_at || null} />
    </div>
  );
}

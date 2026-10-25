import { getSessionUser } from '@/lib/supabase/auth-server';
import TeacherProfileForm from '@/components/profile/TeacherProfileForm';
import BaseLocationCard from '@/components/profile/BaseLocationCard';
import VerificationPanel from '@/components/profile/VerificationPanel';

export const metadata = { title: 'Profile — Teacher Connect' };

export default async function TeacherProfile() {
  const { db, user, profile } = await getSessionUser();
  const [{ data: tp }, { data: base }, { data: allSubjects }, { data: mine }, { data: quals }, { data: docs }, { data: u }] = await Promise.all([
    db.from('teacher_profiles').select('*').eq('id', user.id).single(),
    db.from('teacher_base_locations').select('teacher_id').eq('teacher_id', user.id).maybeSingle(),
    db.from('subjects').select('id,name').order('name'),
    db.from('teacher_subjects').select('subject_id').eq('teacher_id', user.id),
    db.from('teacher_qualifications').select('*').eq('teacher_id', user.id).order('year', { ascending: false }),
    db.from('verification_documents').select('id,doc_type,status,review_note,created_at').eq('teacher_id', user.id).order('created_at', { ascending: false }),
    db.from('users').select('phone').eq('id', user.id).single(),
  ]);
  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-3xl font-extrabold">Your teaching profile</h1>
      <VerificationPanel userId={user.id} status={tp?.verification} docs={docs || []} />
      <BaseLocationCard has={!!base} />
      <TeacherProfileForm userId={user.id} user={{ ...profile, phone: u?.phone }} tp={tp || {}} allSubjects={allSubjects || []}
        selected={(mine || []).map((m) => m.subject_id)} quals={quals || []} />
    </div>
  );
}

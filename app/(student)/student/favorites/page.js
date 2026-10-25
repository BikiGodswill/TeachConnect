import Link from 'next/link';
import { getSessionUser } from '@/lib/supabase/auth-server';
import TeacherCard from '@/components/teachers/TeacherCard';

export const metadata = { title: 'Favorites — Teacher Connect' };

export default async function Favorites() {
  const { db, user } = await getSessionUser();
  const { data: favs } = await db.from('favorites').select('teacher_id').eq('student_id', user.id);
  const ids = (favs || []).map((f) => f.teacher_id);
  const { data: teachers } = ids.length ? await db.from('teacher_cards').select('*').in('id', ids) : { data: [] };
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Favorite teachers</h1>
      {teachers?.length
        ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{teachers.map((t) => <TeacherCard key={t.id} t={t} initialFav />)}</div>
        : <div className="card p-10 text-center"><p className="text-ink-600">Tap the heart on a teacher to save them here.</p><Link href="/teachers" className="btn-teal mt-5">Find a Teacher</Link></div>}
    </div>
  );
}

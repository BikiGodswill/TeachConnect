import Link from 'next/link';
import { getSessionUser } from '@/lib/supabase/auth-server';

export const metadata = { title: 'My courses — Teacher Connect' };

export default async function MyCourses() {
  const { db, user } = await getSessionUser();
  const { data } = await db.from('course_enrollments').select('created_at,courses(id,title,level,subjects(name))').eq('student_id', user.id).order('created_at', { ascending: false });
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-3xl font-extrabold">My courses</h1><Link href="/courses" className="btn-teal h-10 px-5 text-xs">Browse courses</Link></div>
      {data?.length ? data.filter((e) => e.courses).map((e) => (
        <Link key={e.courses.id} href={`/courses/${e.courses.id}`} className="card flex items-center justify-between p-5"><span className="font-bold">{e.courses.title}</span><span className="text-xs text-ink-600">{e.courses.subjects?.name}{e.courses.level && ` · ${e.courses.level}`}</span></Link>
      )) : <div className="card p-10 text-center text-sm text-ink-600">You have not enrolled in any course yet.</div>}
    </div>
  );
}

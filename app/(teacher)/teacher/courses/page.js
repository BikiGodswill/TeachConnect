import Link from 'next/link';
import { getSessionUser } from '@/lib/supabase/auth-server';
import RpcForm from '@/components/forms/RpcForm';

export const metadata = { title: 'My courses — Teacher Connect' };

export default async function TeacherCourses() {
  const { db, user } = await getSessionUser();
  const [{ data: courses }, { data: subjects }] = await Promise.all([
    db.from('courses').select('id,title,published,course_enrollments(count),course_materials(count)').eq('teacher_id', user.id).order('created_at', { ascending: false }),
    db.from('subjects').select('id,name').order('name'),
  ]);
  return (
    <div className="max-w-3xl space-y-6">
      <div><h1 className="text-3xl font-extrabold">My courses</h1><p className="mt-1 text-sm text-ink-600">Share notes and links with students for free. Tick “Publish” when it is ready.</p></div>
      <RpcForm rpc="save_course" fixed={{ p_id: null }} title="Create a course" submit="Create course" success="Course created." fields={[
        { name: 'p_title', label: 'Title', required: true, max: 120 },
        { name: 'p_description', label: 'Description', type: 'textarea', max: 2000 },
        { name: 'p_subject', label: 'Subject', type: 'select', options: (subjects || []).map((s) => [s.id, s.name]) },
        { name: 'p_level', label: 'Level', max: 80 },
        { name: 'p_published', label: 'Publish now', type: 'checkbox' },
      ]} />
      <section className="space-y-3">
        {courses?.length ? courses.map((c) => (
          <Link key={c.id} href={`/teacher/courses/${c.id}`} className="card flex items-center justify-between p-4"><span className="font-bold">{c.title}</span>
            <span className="text-xs text-ink-600">{c.published ? 'Published' : 'Draft'} · {c.course_materials?.[0]?.count || 0} materials · {c.course_enrollments?.[0]?.count || 0} enrolled</span></Link>
        )) : <div className="card p-8 text-center text-sm text-ink-600">No courses yet.</div>}
      </section>
    </div>
  );
}

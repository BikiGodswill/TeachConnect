import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSessionUser } from '@/lib/supabase/auth-server';
import RpcForm from '@/components/forms/RpcForm';
import RpcButton from '@/components/forms/RpcButton';

export const metadata = { title: 'Edit course — Teacher Connect' };

export default async function EditCourse({ params }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const { db, user } = await getSessionUser();
  const [{ data: c }, { data: mats }, { data: subjects }] = await Promise.all([
    db.from('courses').select('*').eq('id', params.id).eq('teacher_id', user.id).maybeSingle(),
    db.from('course_materials').select('id,position,title,kind,body').eq('course_id', params.id).order('position'),
    db.from('subjects').select('id,name').order('name'),
  ]);
  if (!c) notFound();
  return (
    <div className="max-w-3xl space-y-6">
      <div><Link href="/teacher/courses" className="text-sm font-bold text-teal-600">← My courses</Link> · <Link href={`/courses/${c.id}`} className="text-sm font-bold text-teal-600">View as student</Link></div>
      <RpcForm rpc="save_course" reset={false} fixed={{ p_id: c.id }} title="Course details" success="Course saved." fields={[
        { name: 'p_title', label: 'Title', required: true, max: 120, default: c.title },
        { name: 'p_description', label: 'Description', type: 'textarea', max: 2000, default: c.description },
        { name: 'p_subject', label: 'Subject', type: 'select', default: c.subject_id, options: (subjects || []).map((s) => [s.id, s.name]) },
        { name: 'p_level', label: 'Level', max: 80, default: c.level },
        { name: 'p_published', label: 'Published', type: 'checkbox', default: c.published },
      ]} />
      <section className="space-y-3">
        <h2 className="font-bold">Materials</h2>
        {mats?.map((m) => (
          <div key={m.id} className="card flex items-start justify-between gap-3 p-4"><div><p className="font-semibold">{m.position}. {m.title} <span className="text-xs text-ink-400">({m.kind === 'LINK' ? 'link' : 'text'})</span></p><p className="line-clamp-2 break-all text-xs text-ink-600">{m.body}</p></div>
            <RpcButton rpc="delete_material" args={{ p_id: m.id }} label="Remove" kind="ghost" confirmText="Remove this material?" success="Removed." /></div>
        ))}
        <RpcForm rpc="add_material" fixed={{ p_course: c.id }} title="Add material" submit="Add" success="Added." fields={[
          { name: 'p_title', label: 'Title', required: true, max: 150 },
          { name: 'p_kind', label: 'Type', type: 'select', required: true, default: 'TEXT', options: [['TEXT', 'Text / notes'], ['LINK', 'Link (https://…)']] },
          { name: 'p_body', label: 'Content or link', type: 'textarea', required: true, max: 8000 },
        ]} />
      </section>
    </div>
  );
}

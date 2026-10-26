import { getSessionUser } from '@/lib/supabase/auth-server';
import RpcForm from '@/components/forms/RpcForm';

export const metadata = { title: 'School profile — Teacher Connect' };

export default async function SchoolProfile() {
  const { db, user } = await getSessionUser();
  const { data: s } = await db.from('school_profiles').select('name,city,description').eq('id', user.id).maybeSingle();
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-3xl font-extrabold">School profile</h1>
      <RpcForm rpc="register_school" reset={false} submit="Save" success="School profile saved." fields={[
        { name: 'p_name', label: 'School name', required: true, max: 120, default: s?.name },
        { name: 'p_city', label: 'City', max: 80, default: s?.city },
        { name: 'p_description', label: 'About the school', type: 'textarea', max: 1500, default: s?.description },
      ]} />
    </div>
  );
}

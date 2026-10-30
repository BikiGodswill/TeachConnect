import { createAuthClient } from '@/lib/supabase/auth-server';
import AvatarUploader from '@/components/profile/AvatarUploader';

// Server wrapper: loads the cover photo separately so the page still works if migration 015 is not applied yet.
export default async function ProfileHeader({ userId, name, url }) {
  let cover = null;
  try {
    const { data } = await createAuthClient().from('users').select('cover_url').eq('id', userId).maybeSingle();
    cover = data?.cover_url || null;
  } catch { /* migration 015 not applied yet */ }
  return <AvatarUploader name={name} url={url} coverUrl={cover} />;
}

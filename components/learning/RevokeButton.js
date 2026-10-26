'use client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { friendlyError } from '@/lib/errors';

export default function RevokeButton({ id }) {
  const router = useRouter();
  return <button className="btn-ghost" onClick={async () => {
    if (!confirm('Revoke this certificate? Verification will show it as revoked.')) return;
    const { error } = await createClient().rpc('revoke_certificate', { p_id: id });
    if (error) return toast.error(friendlyError(error));
    toast.success('Certificate revoked.'); router.refresh();
  }}>Revoke</button>;
}

'use client';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { openLearningFile } from '@/lib/learner';
import { friendlyError } from '@/lib/errors';

export default function OpenFileButton({ path, name }) {
  return <button onClick={async () => { try { await openLearningFile(createClient(), path); } catch (e) { toast.error(friendlyError(e)); } }} className="text-sm font-bold text-teal-600 underline">Open {name || 'attachment'}</button>;
}

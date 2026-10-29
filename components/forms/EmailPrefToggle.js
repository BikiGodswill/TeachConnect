'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { friendlyError } from '@/lib/errors';

export default function EmailPrefToggle() {
  const [on, setOn] = useState(true);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    createClient().from('email_preferences').select('enabled').maybeSingle().then(({ data }) => { if (data) setOn(data.enabled); setReady(true); });
  }, []);
  async function change(v) {
    setOn(v);
    const { error } = await createClient().rpc('set_email_pref', { p_enabled: v });
    if (error) { setOn(!v); toast.error(friendlyError(error)); } else toast.success(v ? 'E-mail notifications on.' : 'Non-essential e-mails switched off.');
  }
  return (
    <section className="card space-y-2 p-6">
      <h2 className="font-bold">E-mail notifications</h2>
      <label className="flex items-center gap-3 text-sm font-semibold">
        <input type="checkbox" checked={on} disabled={!ready} onChange={(e) => change(e.target.checked)} className="h-5 w-5 accent-teal-500" />
        Send me an e-mail for new bookings, messages, homework and other updates
      </label>
      <p className="text-xs text-ink-600">Important e-mails about verification, payments, payouts, disputes and safety are always sent.</p>
    </section>
  );
}

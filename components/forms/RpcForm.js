'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { friendlyError } from '@/lib/errors';

const input = 'mt-1 w-full rounded-md border border-ink-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500';

// Generic form that calls one database function. Field names ARE the function's argument names.
// Props are plain data (strings/arrays) so they can come from server components.
// fields: [{ name, label, type: text|textarea|number|select|checkbox|url, required, options:[[value,label]], rows, max, placeholder }]
export default function RpcForm({ rpc, fields, fixed = {}, submit = 'Save', success = 'Saved.', redirectTo, reset = true, title }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const args = { ...fixed };
    for (const fld of fields) {
      let v = f.get(fld.name);
      if (fld.type === 'checkbox') v = f.get(fld.name) === 'on';
      else if (fld.type === 'number') v = v === '' || v == null ? null : Number(v);
      else v = v == null || String(v).trim() === '' ? null : String(v).trim();
      args[fld.name] = v;
    }
    setBusy(true);
    const { error } = await createClient().rpc(rpc, args);
    setBusy(false);
    if (error) return toast.error(friendlyError(error));
    toast.success(success);
    if (reset) form.reset();
    if (redirectTo) router.push(redirectTo); else router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3 p-6">
      {title && <h2 className="text-lg font-bold">{title}</h2>}
      {fields.map((fld) => (
        <label key={fld.name} className={fld.type === 'checkbox' ? 'flex items-center gap-2 text-sm font-semibold' : 'block text-xs font-bold text-ink-600'}>
          {fld.type === 'checkbox' && <input type="checkbox" name={fld.name} defaultChecked={fld.default} className="accent-teal-500" />}
          {fld.label}
          {fld.type === 'textarea' ? <textarea name={fld.name} rows={fld.rows || 4} required={fld.required} maxLength={fld.max} placeholder={fld.placeholder} className={input} />
            : fld.type === 'select' ? <select name={fld.name} required={fld.required} defaultValue={fld.default ?? ''} className={input}>{!fld.required && <option value="">—</option>}{(fld.options || []).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            : fld.type === 'checkbox' ? null
            : <input name={fld.name} type={fld.type || 'text'} required={fld.required} maxLength={fld.max} placeholder={fld.placeholder} defaultValue={fld.default} className={input} />}
        </label>
      ))}
      <button disabled={busy} className="btn-teal disabled:opacity-60">{busy ? 'Saving…' : submit}</button>
    </form>
  );
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); const c = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''); if (c) router.push(`/verify/${c}`); }} className="space-y-3">
      <input value={code} onChange={(e) => setCode(e.target.value)} maxLength={40} placeholder="e.g. 3F9A1C0B7D2E" aria-label="Certificate code" className="w-full rounded-md border border-ink-200 px-4 py-3 text-center font-mono text-lg uppercase outline-none focus:border-teal-500" />
      <button className="btn-teal w-full">Verify</button>
    </form>
  );
}

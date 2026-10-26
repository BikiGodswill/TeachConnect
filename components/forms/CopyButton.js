'use client';
import toast from 'react-hot-toast';
export default function CopyButton({ text, label = 'Copy' }) {
  return <button type="button" className="btn-ghost h-10 px-5 text-xs" onClick={async () => { try { await navigator.clipboard.writeText(text); toast.success('Copied.'); } catch { toast.error('Could not copy. Select the text and copy it.'); } }}>{label}</button>;
}

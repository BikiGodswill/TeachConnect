'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiExclamationTriangle, HiArrowPath } from 'react-icons/hi2';

export default function ErrorState({ title = 'Something went wrong', text = 'We could not load this page. Please try again.', onRetry, homeHref = '/', digest }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="mx-auto my-16 max-w-md rounded-xl bg-white p-10 text-center shadow-float">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-peach-100 text-danger"><HiExclamationTriangle size={32} /></span>
      <h1 className="mt-6 text-2xl font-extrabold">{title}</h1>
      <p className="mt-2 text-ink-600">{text}</p>
      {digest && <p className="mt-3 text-xs text-ink-400">Reference: {digest}</p>}
      <div className="mt-8 flex justify-center gap-3">
        {onRetry && <button onClick={onRetry} className="btn-teal"><HiArrowPath size={18} /> Try again</button>}
        <Link href={homeHref} className="btn-ghost">Go home</Link>
      </div>
    </motion.div>
  );
}

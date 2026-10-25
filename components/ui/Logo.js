import Link from 'next/link';
import { HiAcademicCap } from 'react-icons/hi2';

export default function Logo({ light = false }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-500 text-white">
        <HiAcademicCap size={20} />
      </span>
      <span className={`font-heading text-xl font-extrabold ${light ? 'text-white' : 'text-navy-900'}`}>
        Teacher<span className="text-teal-500">Connect</span>
      </span>
    </Link>
  );
}

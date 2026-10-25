import { PageSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return <main className="mx-auto max-w-7xl px-5 py-10"><PageSkeleton cards={6} /></main>;
}

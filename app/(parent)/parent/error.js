'use client';
import ErrorState from '@/components/ui/ErrorState';

export default function SegmentError({ error, reset }) {
  return <ErrorState digest={error?.digest} onRetry={reset} homeHref="/student" />;
}

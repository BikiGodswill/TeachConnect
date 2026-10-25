'use client';
import ErrorState from '@/components/ui/ErrorState';

export default function RootError({ error, reset }) {
  return <ErrorState digest={error?.digest} onRetry={reset} />;
}

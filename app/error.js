'use client';
import { useEffect } from 'react';
import ErrorState from '@/components/ui/ErrorState';

export default function RootError({ error, reset }) {
  useEffect(() => { console.error('[Teacher Connect]', error); }, [error]);
  return <ErrorState digest={error?.digest} onRetry={reset} />;
}

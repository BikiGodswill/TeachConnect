'use client';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

export default function AppProviders({ children }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
  }));
  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}

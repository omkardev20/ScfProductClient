// app/(workspace)/layout.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '@/components/Shell';
import { useAppSelector } from '@/store/hooks';

/** Blocks catalog pages until a token exists. */
export default function WorkspaceLayout({ children }) {
  const router = useRouter();
  const ready = useAppSelector((state) => state?.auth?.ready ?? false);
  const token = useAppSelector((state) => state?.auth?.token ?? null);

  useEffect(() => {
    if (ready && !token) {
      router.replace('/login');
    }
  }, [ready, token, router]);

  if (!ready || !token) {
    return <p className="muted auth-wrap">Checking your session…</p>;
  }

  return <Shell>{children}</Shell>;
}

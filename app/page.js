// app/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

/** Sends a signed-in user to the catalog, and everyone else to login. */
export default function HomePage() {
  const router = useRouter();
  const ready = useAppSelector((state) => state?.auth?.ready ?? false);
  const token = useAppSelector((state) => state?.auth?.token ?? null);

  useEffect(() => {
    if (!ready) {
      return;
    }
    router.replace(token ? '/products' : '/login');
  }, [ready, token, router]);

  return <p className="muted auth-wrap">Opening SupplyHub…</p>;
}

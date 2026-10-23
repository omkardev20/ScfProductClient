// components/Shell.js
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { sessionStarted, sessionCleared } from '@/store/authSlice';
import { useMeQuery } from '@/store/api';
import { clearSession, writeSession } from '@/lib/session';

const ADMIN_LINKS = [
  { href: '/outlets', label: 'Outlets' },
  { href: '/categories', label: 'Categories' },
  { href: '/inventory', label: 'Inventory' },
];

/**
 * Navigation for a signed-in user. Refreshes the user from GET /api/auth/me.
 */
export function Shell({ children }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const token = useAppSelector((state) => state?.auth?.token ?? null);
  const user = useAppSelector((state) => state?.auth?.user ?? null);
  const me = useMeQuery(undefined, { skip: !token });

  useEffect(() => {
    const fresh = me?.data?.data ?? null;
    if (!fresh || !token) {
      return;
    }
    const next = { token, user: fresh };
    dispatch(sessionStarted(next));
    writeSession(next);
  }, [dispatch, me?.data, token]);

  const role = user?.role ?? '';
  const isAdmin = role === 'SUPPLIER_ADMIN';
  const name = user?.fullName ?? user?.email ?? 'Account';

  const logout = () => {
    dispatch(sessionCleared());
    clearSession();
    router.replace('/login');
  };

  return (
    <div className="shell">
      <aside className="nav">
        <p className="brand">SupplyHub</p>
        <p className="muted small">{name}</p>
        <p className="role">{role || 'Signed in'}</p>
        <Link href="/products">Products</Link>
        <Link href="/orders">Orders</Link>
        <Link href="/orders/new">New order</Link>
        {isAdmin
          ? ADMIN_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))
          : null}
        <button type="button" className="ghost" onClick={logout}>Log out</button>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}

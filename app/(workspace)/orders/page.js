// app/(workspace)/orders/page.js
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ErrorText, Field, Page } from '@/components/ui';
import { listRows, money } from '@/lib/apiResult';
import { useOrdersQuery, useOutletsQuery } from '@/store/api';
import { useAppSelector } from '@/store/hooks';

const STATUSES = ['', 'pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const isAdmin = useAppSelector((state) => state?.auth?.user?.role ?? null) === 'SUPPLIER_ADMIN';
  const [status, setStatus] = useState('');
  const [outletId, setOutletId] = useState('');
  const outletsQuery = useOutletsQuery({ limit: 100, offset: 0 }, { skip: !isAdmin });
  const ordersQuery = useOrdersQuery({
    limit: 50,
    offset: 0,
    status: status || undefined,
    outletId: isAdmin ? (outletId || undefined) : undefined,
  });
  const outlets = listRows(outletsQuery?.data);
  const orders = listRows(ordersQuery?.data);

  return (
    <Page title="Orders" lede="Line items are on the order detail page. Totals include 5% tax from the server.">
      <div className="panel">
        {isAdmin ? (
          <Field label="Outlet">
            <select value={outletId} onChange={(event) => setOutletId(event?.target?.value ?? '')}>
              <option value="">All outlets</option>
              {outlets.map((outlet) => (
                <option key={outlet?.id ?? outlet?.branchCode} value={outlet?.id ?? ''}>
                  {outlet?.name ?? 'Outlet'}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
        <Field label="Status">
          <select value={status} onChange={(event) => setStatus(event?.target?.value ?? '')}>
            {STATUSES.map((value) => (
              <option key={value || 'all'} value={value}>{value || 'All'}</option>
            ))}
          </select>
        </Field>
        <ErrorText error={ordersQuery?.error} />
        {ordersQuery?.isLoading ? <p className="muted">Loading orders…</p> : null}
        <table>
          <thead>
            <tr><th>Outlet</th><th>Status</th><th>Total</th><th>Created</th><th /></tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const id = order?.id ?? '';
              return (
                <tr key={id}>
                  <td>{order?.outletName ?? 'Outlet'} ({order?.branchCode ?? '—'})</td>
                  <td>{order?.status ?? ''}</td>
                  <td>{money(order?.totalAmount)}</td>
                  <td className="small">{order?.createdAt ?? ''}</td>
                  <td><Link href={`/orders/${id}`}>Open</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Page>
  );
}

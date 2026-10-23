// app/(workspace)/orders/[id]/page.js
'use client';

import { useParams } from 'next/navigation';
import { ErrorText, Page } from '@/components/ui';
import { money, oneRow } from '@/lib/apiResult';
import { useOrderQuery, useUpdateOrderStatusMutation } from '@/store/api';
import { useAppSelector } from '@/store/hooks';

const NEXT = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_transit', 'cancelled'],
  in_transit: ['delivered'],
  delivered: [],
  cancelled: [],
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id ?? '';
  const role = useAppSelector((state) => state?.auth?.user?.role ?? null);
  const isAdmin = role === 'SUPPLIER_ADMIN';
  const orderQuery = useOrderQuery(id, { skip: !id });
  const [updateStatus, statusState] = useUpdateOrderStatusMutation();

  const order = oneRow(orderQuery?.data);
  const items = order?.items ?? [];
  const status = order?.status ?? '';
  const actions = (NEXT[status] ?? []).filter((step) => isAdmin || step === 'cancelled');

  return (
    <Page title="Order" lede={order?.outletName ?? 'Loading the order'}>
      <ErrorText error={orderQuery?.error ?? statusState?.error} />
      {orderQuery?.isLoading ? <p className="muted">Loading…</p> : null}
      {order ? (
        <div className="stack">
          <div className="card">
            <p>Status: <strong>{status || 'unknown'}</strong></p>
            <p>Subtotal {money(order?.subtotal)} · Tax {money(order?.taxAmount)} · Total {money(order?.totalAmount)}</p>
            <div className="row">
              {actions.map((step) => (
                <button
                  key={step}
                  type="button"
                  className={step === 'cancelled' ? 'danger' : undefined}
                  disabled={statusState?.isLoading}
                  onClick={() => updateStatus({ id, status: step })}
                >
                  Mark {step}
                </button>
              ))}
            </div>
          </div>
          <div className="panel">
            <table>
              <thead>
                <tr><th>Product</th><th>Qty</th><th>Unit price</th><th>Subtotal</th></tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item?.id ?? item?.productId}>
                    <td>{item?.name ?? ''} <span className="muted">{item?.sku ?? ''}</span></td>
                    <td>{item?.quantity ?? 0} {item?.unit ?? ''}</td>
                    <td>{money(item?.unitPrice)}</td>
                    <td>{money(item?.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </Page>
  );
}

// app/(workspace)/orders/new/page.js
// The request sends product ids and quantities only. The server copies the price.
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ErrorText, Field, Page } from '@/components/ui';
import { listRows, money } from '@/lib/apiResult';
import { useCreateOrderMutation, useOutletsQuery, useProductsQuery } from '@/store/api';
import { useAppSelector } from '@/store/hooks';

export default function NewOrderPage() {
  const router = useRouter();
  const role = useAppSelector((state) => state?.auth?.user?.role ?? null);
  const ownOutletId = useAppSelector((state) => state?.auth?.user?.outletId ?? null);
  const isAdmin = role === 'SUPPLIER_ADMIN';
  const productsQuery = useProductsQuery({ limit: 100, offset: 0 });
  const outletsQuery = useOutletsQuery({ limit: 100, offset: 0 }, { skip: !isAdmin });
  const [createOrder, createState] = useCreateOrderMutation();
  const [outletId, setOutletId] = useState('');
  const [quantities, setQuantities] = useState({});

  const products = listRows(productsQuery?.data).filter((product) => product?.isActive !== false);
  const outlets = listRows(outletsQuery?.data);

  const onSubmit = async (event) => {
    event.preventDefault();
    const items = products
      .map((product) => ({
        productId: product?.id ?? null,
        quantity: Number(quantities?.[product?.id] ?? 0),
      }))
      .filter((item) => item.productId && item.quantity > 0);

    const body = { items };
    if (isAdmin) {
      body.outletId = outletId;
    }

    try {
      const result = await createOrder(body).unwrap();
      const id = result?.data?.id ?? null;
      if (id) {
        router.push(`/orders/${id}`);
      }
    } catch {
      // Shown from createState.error.
    }
  };

  return (
    <Page title="New order" lede={isAdmin ? 'Choose the outlet and quantities.' : `Ordering for your outlet ${ownOutletId ?? ''}.`}>
      <form className="panel" onSubmit={onSubmit}>
        {isAdmin ? (
          <Field label="Outlet">
            <select value={outletId} onChange={(event) => setOutletId(event?.target?.value ?? '')} required>
              <option value="">Choose</option>
              {outlets.map((outlet) => (
                <option key={outlet?.id ?? outlet?.branchCode} value={outlet?.id ?? ''}>
                  {outlet?.name ?? 'Outlet'} ({outlet?.branchCode ?? ''})
                </option>
              ))}
            </select>
          </Field>
        ) : null}
        <ErrorText error={productsQuery?.error ?? outletsQuery?.error ?? createState?.error} />
        <table>
          <thead>
            <tr><th>Product</th><th>Price</th><th>In stock</th><th>Quantity</th></tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const id = product?.id ?? '';
              return (
                <tr key={id}>
                  <td>{product?.name ?? ''} <span className="muted">{product?.sku ?? ''}</span></td>
                  <td>{money(product?.price)}</td>
                  <td>{product?.currentStock ?? 0}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={quantities?.[id] ?? ''}
                      onChange={(event) => {
                        const next = event?.target?.value ?? '';
                        setQuantities((current) => ({ ...current, [id]: next }));
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <button type="submit" disabled={createState?.isLoading}>
          {createState?.isLoading ? 'Placing order…' : 'Place order'}
        </button>
      </form>
    </Page>
  );
}

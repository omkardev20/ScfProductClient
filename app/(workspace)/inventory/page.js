// app/(workspace)/inventory/page.js
'use client';

import { useState } from 'react';
import { ErrorText, Field, Page } from '@/components/ui';
import { listRows } from '@/lib/apiResult';
import { useAdjustStockMutation, useInventoryLogsQuery, useProductsQuery } from '@/store/api';

export default function InventoryPage() {
  const productsQuery = useProductsQuery({ limit: 100, offset: 0, includeInactive: true });
  const logsQuery = useInventoryLogsQuery({
    limit: 50,
    offset: 0,
    productId: productId || undefined,
  });
  const [adjustStock, adjustState] = useAdjustStockMutation();
  const [productId, setProductId] = useState('');
  const [changeQuantity, setChangeQuantity] = useState('1');
  const [reason, setReason] = useState('');

  const products = listRows(productsQuery?.data);
  const logs = listRows(logsQuery?.data);

  const onSubmit = async (event) => {
    event.preventDefault();
    await adjustStock({
      productId,
      changeQuantity: Number(changeQuantity),
      reason: reason.trim(),
    });
    setReason('');
  };

  return (
    <Page title="Inventory" lede="Positive numbers add stock. Negative numbers remove it. Zero is rejected.">
      <div className="split">
        <form className="card" onSubmit={onSubmit}>
          <h2>Adjust stock</h2>
          <Field label="Product">
            <select value={productId} onChange={(event) => setProductId(event?.target?.value ?? '')} required>
              <option value="">Choose</option>
              {products.map((product) => (
                <option key={product?.id ?? product?.sku} value={product?.id ?? ''}>
                  {(product?.sku ?? '')} — {product?.name ?? ''} ({product?.currentStock ?? 0})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Change quantity">
            <input
              type="number"
              step="1"
              value={changeQuantity}
              onChange={(event) => setChangeQuantity(event?.target?.value ?? '')}
              required
            />
          </Field>
          <Field label="Reason">
            <input value={reason} onChange={(event) => setReason(event?.target?.value ?? '')} required />
          </Field>
          <ErrorText error={adjustState?.error} />
          {adjustState?.isSuccess ? <p className="ok">Stock updated.</p> : null}
          <button type="submit" disabled={adjustState?.isLoading}>Save adjustment</button>
        </form>
        <div className="panel">
          <h2>Log</h2>
          <ErrorText error={logsQuery?.error ?? productsQuery?.error} />
          <table>
            <thead>
              <tr><th>When</th><th>Product</th><th>Change</th><th>Reason</th></tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log?.id ?? `${log?.productId}-${log?.createdAt}`}>
                  <td className="small">{log?.createdAt ?? ''}</td>
                  <td>{log?.sku ?? ''} {log?.productName ?? ''}</td>
                  <td>{log?.changeQuantity ?? 0}</td>
                  <td>{log?.reason ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}

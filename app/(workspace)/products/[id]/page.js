// app/(workspace)/products/[id]/page.js
// Loads one product with GET /api/products/:id.
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ErrorText, Page } from '@/components/ui';
import { money, oneRow } from '@/lib/apiResult';
import { useProductQuery } from '@/store/api';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id ?? '';
  const productQuery = useProductQuery(id, { skip: !id });
  const product = oneRow(productQuery?.data);

  return (
    <Page title={product?.name ?? 'Product'} lede={product?.sku ?? 'Loading the product'}>
      <p><Link href="/products">Back to products</Link></p>
      <ErrorText error={productQuery?.error} />
      {productQuery?.isLoading ? <p className="muted">Loading…</p> : null}
      {product ? (
        <div className="card">
          <p>Price {money(product?.price)} per {product?.unit ?? 'unit'}</p>
          <p>Stock {product?.currentStock ?? 0}</p>
          <p>Category {product?.categoryId ?? 'none'}</p>
          <p>Active {product?.isActive === false ? 'No' : 'Yes'}</p>
          <p>{product?.description ?? 'No description'}</p>
        </div>
      ) : null}
    </Page>
  );
}

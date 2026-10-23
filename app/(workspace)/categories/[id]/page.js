// app/(workspace)/categories/[id]/page.js
// Loads one group with GET /api/categories/:id.
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ErrorText, Page } from '@/components/ui';
import { oneRow } from '@/lib/apiResult';
import { useCategoryQuery } from '@/store/api';

export default function CategoryDetailPage() {
  const params = useParams();
  const id = params?.id ?? '';
  const categoryQuery = useCategoryQuery(id, { skip: !id });
  const category = oneRow(categoryQuery?.data);

  return (
    <Page title={category?.name ?? 'Category'} lede={category?.slug ?? 'Loading the category'}>
      <p><Link href="/categories">Back to categories</Link></p>
      <ErrorText error={categoryQuery?.error} />
      {categoryQuery?.isLoading ? <p className="muted">Loading…</p> : null}
      {category ? (
        <div className="card">
          <p>Slug {category?.slug ?? ''}</p>
          <p>Id {category?.id ?? id}</p>
        </div>
      ) : null}
    </Page>
  );
}

// app/(workspace)/outlets/[id]/page.js
// Loads one branch with GET /api/outlets/:id.
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ErrorText, Page } from '@/components/ui';
import { oneRow } from '@/lib/apiResult';
import { useOutletQuery } from '@/store/api';

export default function OutletDetailPage() {
  const params = useParams();
  const id = params?.id ?? '';
  const outletQuery = useOutletQuery(id, { skip: !id });
  const outlet = oneRow(outletQuery?.data);

  return (
    <Page title={outlet?.name ?? 'Outlet'} lede={outlet?.branchCode ?? 'Loading the outlet'}>
      <p><Link href="/outlets">Back to outlets</Link></p>
      <ErrorText error={outletQuery?.error} />
      {outletQuery?.isLoading ? <p className="muted">Loading…</p> : null}
      {outlet ? (
        <div className="card">
          <p>Phone {outlet?.phone ?? '—'}</p>
          <p>Address {outlet?.address ?? '—'}</p>
          <p className="small">Id {outlet?.id ?? id}</p>
        </div>
      ) : null}
    </Page>
  );
}

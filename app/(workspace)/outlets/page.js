// app/(workspace)/outlets/page.js
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ErrorText, Field, Page } from '@/components/ui';
import { listRows } from '@/lib/apiResult';
import { useCreateOutletMutation, useOutletsQuery, useUpdateOutletMutation } from '@/store/api';
import { useAppSelector } from '@/store/hooks';

const emptyForm = { name: '', branchCode: '', address: '', phone: '' };

export default function OutletsPage() {
  const isAdmin = useAppSelector((state) => state?.auth?.user?.role ?? null) === 'SUPPLIER_ADMIN';
  const outletsQuery = useOutletsQuery({ limit: 50, offset: 0 });
  const [createOutlet, createState] = useCreateOutletMutation();
  const [updateOutlet, updateState] = useUpdateOutletMutation();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const outlets = listRows(outletsQuery?.data);
  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event?.target?.value ?? '' }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const body = {
      name: form?.name?.trim?.() ?? '',
      branchCode: form?.branchCode?.trim?.() ?? '',
      address: form?.address ?? '',
      phone: form?.phone ?? '',
    };
    if (editingId) {
      await updateOutlet({ id: editingId, ...body });
      return;
    }
    await createOutlet(body);
    setForm(emptyForm);
  };

  return (
    <Page title="Outlets" lede="Restaurant branches that place orders.">
      <div className="split">
        {isAdmin ? (
          <form className="card" onSubmit={onSubmit}>
            <h2>{editingId ? 'Edit outlet' : 'New outlet'}</h2>
            <Field label="Name"><input value={form?.name ?? ''} onChange={set('name')} required /></Field>
            <Field label="Branch code"><input value={form?.branchCode ?? ''} onChange={set('branchCode')} required /></Field>
            <Field label="Address"><input value={form?.address ?? ''} onChange={set('address')} /></Field>
            <Field label="Phone"><input value={form?.phone ?? ''} onChange={set('phone')} /></Field>
            <ErrorText error={createState?.error ?? updateState?.error} />
            <button type="submit">{editingId ? 'Save' : 'Create'}</button>
          </form>
        ) : <div />}
        <div className="panel">
          <ErrorText error={outletsQuery?.error} />
          <table>
            <thead>
              <tr><th>Name</th><th>Code</th><th>Phone</th><th>Id</th><th /></tr>
            </thead>
            <tbody>
              {outlets.map((outlet) => {
                const id = outlet?.id ?? '';
                return (
                  <tr key={id}>
                    <td>{outlet?.name ?? ''}</td>
                    <td>{outlet?.branchCode ?? ''}</td>
                    <td>{outlet?.phone ?? '—'}</td>
                    <td className="small">{id}</td>
                    <td className="row">
                      <Link href={`/outlets/${id}`}>Open</Link>
                      {isAdmin ? (
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => {
                            setEditingId(id);
                            setForm({
                              name: outlet?.name ?? '',
                              branchCode: outlet?.branchCode ?? '',
                              address: outlet?.address ?? '',
                              phone: outlet?.phone ?? '',
                            });
                          }}
                        >
                          Edit
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}

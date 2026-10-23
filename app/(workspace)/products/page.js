// app/(workspace)/products/page.js
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ErrorText, Field, Page } from '@/components/ui';
import { listMeta, listRows, money } from '@/lib/apiResult';
import {
  useCategoriesQuery,
  useCreateProductMutation,
  useHideProductMutation,
  useProductsQuery,
  useUpdateProductMutation,
} from '@/store/api';
import { useAppSelector } from '@/store/hooks';

const emptyForm = {
  sku: '',
  name: '',
  description: '',
  price: '',
  currentStock: '0',
  unit: 'unit',
  categoryId: '',
};

export default function ProductsPage() {
  const role = useAppSelector((state) => state?.auth?.user?.role ?? null);
  const isAdmin = role === 'SUPPLIER_ADMIN';
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const productsQuery = useProductsQuery({
    limit: 50,
    offset: 0,
    search: search.trim() || undefined,
    includeInactive: isAdmin ? true : undefined,
  });
  const categoriesQuery = useCategoriesQuery({ limit: 100, offset: 0 }, { skip: !isAdmin });
  const [createProduct, createState] = useCreateProductMutation();
  const [updateProduct, updateState] = useUpdateProductMutation();
  const [hideProduct, hideState] = useHideProductMutation();

  const products = listRows(productsQuery?.data);
  const total = listMeta(productsQuery?.data).total;
  const categories = listRows(categoriesQuery?.data);

  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event?.target?.value ?? '' }));
  };

  const loadProduct = (product) => {
    setEditingId(product?.id ?? null);
    setForm({
      sku: product?.sku ?? '',
      name: product?.name ?? '',
      description: product?.description ?? '',
      price: String(product?.price ?? ''),
      currentStock: String(product?.currentStock ?? 0),
      unit: product?.unit ?? 'unit',
      categoryId: product?.categoryId == null ? '' : String(product.categoryId),
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const shared = {
      sku: form?.sku?.trim?.() ?? '',
      name: form?.name?.trim?.() ?? '',
      description: form?.description ?? '',
      price: Number(form?.price),
      unit: form?.unit?.trim?.() || 'unit',
      categoryId: form?.categoryId ? Number(form.categoryId) : null,
    };

    if (editingId) {
      await updateProduct({ id: editingId, ...shared });
      return;
    }

    await createProduct({
      ...shared,
      currentStock: Number(form?.currentStock) || 0,
      isActive: true,
    });
    setForm(emptyForm);
  };

  return (
    <Page title="Products" lede={`${total} in the catalog. Prices come from the server.`}>
      <div className="split">
        {isAdmin ? (
          <form className="card" onSubmit={onSubmit}>
            <h2>{editingId ? 'Edit product' : 'New product'}</h2>
            <Field label="SKU"><input value={form?.sku ?? ''} onChange={set('sku')} required /></Field>
            <Field label="Name"><input value={form?.name ?? ''} onChange={set('name')} required /></Field>
            <Field label="Description"><input value={form?.description ?? ''} onChange={set('description')} /></Field>
            <Field label="Price"><input type="number" min="0" step="0.01" value={form?.price ?? ''} onChange={set('price')} required /></Field>
            {editingId ? null : (
              <Field label="Opening stock">
                <input type="number" min="0" step="1" value={form?.currentStock ?? '0'} onChange={set('currentStock')} />
              </Field>
            )}
            <Field label="Unit"><input value={form?.unit ?? ''} onChange={set('unit')} /></Field>
            <Field label="Category">
              <select value={form?.categoryId ?? ''} onChange={set('categoryId')}>
                <option value="">None</option>
                {categories.map((category) => (
                  <option key={category?.id ?? category?.slug} value={category?.id ?? ''}>
                    {category?.name ?? 'Category'}
                  </option>
                ))}
              </select>
            </Field>
            <ErrorText error={createState?.error ?? updateState?.error} />
            <div className="row">
              <button type="submit">{editingId ? 'Save' : 'Create'}</button>
              {editingId ? (
                <button type="button" className="ghost" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        ) : <div />}

        <div className="panel">
          <Field label="Search name or SKU">
            <input value={search} onChange={(event) => setSearch(event?.target?.value ?? '')} />
          </Field>
          <ErrorText error={productsQuery?.error} />
          {productsQuery?.isLoading ? <p className="muted">Loading products…</p> : null}
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Active</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const id = product?.id ?? '';
                return (
                  <tr key={id}>
                    <td>{product?.sku ?? ''}</td>
                    <td>{product?.name ?? ''}</td>
                    <td>{money(product?.price)}</td>
                    <td>{product?.currentStock ?? 0} {product?.unit ?? ''}</td>
                    <td>{product?.isActive === false ? 'No' : 'Yes'}</td>
                    <td className="row">
                      <Link href={`/products/${id}`}>Open</Link>
                      {isAdmin ? (
                        <>
                          <button type="button" className="ghost" onClick={() => loadProduct(product)}>Edit</button>
                          <button type="button" className="danger" disabled={hideState?.isLoading} onClick={() => hideProduct(id)}>
                            Hide
                          </button>
                        </>
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

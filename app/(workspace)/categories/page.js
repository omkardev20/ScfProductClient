// app/(workspace)/categories/page.js
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ErrorText, Field, Page } from '@/components/ui';
import { listRows } from '@/lib/apiResult';
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from '@/store/api';

export default function CategoriesPage() {
  const categoriesQuery = useCategoriesQuery({ limit: 100, offset: 0 });
  const [createCategory, createState] = useCreateCategoryMutation();
  const [updateCategory, updateState] = useUpdateCategoryMutation();
  const [deleteCategory, deleteState] = useDeleteCategoryMutation();
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const categories = listRows(categoriesQuery?.data);

  const onSubmit = async (event) => {
    event.preventDefault();
    const body = {
      name: name.trim(),
      ...(slug.trim() ? { slug: slug.trim() } : {}),
    };
    if (editingId != null) {
      await updateCategory({ id: editingId, ...body });
      return;
    }
    await createCategory(body);
    setName('');
    setSlug('');
  };

  return (
    <Page title="Categories" lede="Deleting a category keeps the products and clears their group.">
      <div className="split">
        <form className="card" onSubmit={onSubmit}>
          <h2>{editingId != null ? 'Edit category' : 'New category'}</h2>
          <Field label="Name">
            <input value={name} onChange={(event) => setName(event?.target?.value ?? '')} required />
          </Field>
          <Field label="Slug (optional)">
            <input value={slug} onChange={(event) => setSlug(event?.target?.value ?? '')} />
          </Field>
          <ErrorText error={createState?.error ?? updateState?.error ?? deleteState?.error} />
          <button type="submit">{editingId != null ? 'Save' : 'Create'}</button>
        </form>
        <div className="panel">
          <ErrorText error={categoriesQuery?.error} />
          <table>
            <thead>
              <tr><th>Name</th><th>Slug</th><th /></tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const id = category?.id ?? '';
                return (
                  <tr key={id}>
                    <td>{category?.name ?? ''}</td>
                    <td>{category?.slug ?? ''}</td>
                    <td className="row">
                      <Link href={`/categories/${id}`}>Open</Link>
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => {
                          setEditingId(id);
                          setName(category?.name ?? '');
                          setSlug(category?.slug ?? '');
                        }}
                      >
                        Edit
                      </button>
                      <button type="button" className="danger" onClick={() => deleteCategory(id)}>Delete</button>
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

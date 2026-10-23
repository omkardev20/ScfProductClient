// store/api.js
// One Redux Toolkit Query API for the whole SupplyHub backend.
// A missing token, a missing body, or a 401 must not crash the UI.

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { sessionCleared } from './authSlice';
import { clearSession } from '@/lib/session';

/**
 * Turns { limit, search } into ?limit=50&search=bun. Skips null and empty values.
 * @param {Record<string, unknown> | null | undefined} params
 */
const queryString = (params) => {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    search.set(key, String(value));
  });
  const text = search.toString();
  return text ? `?${text}` : '';
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
  prepareHeaders: (headers, { getState }) => {
    const token = getState()?.auth?.token ?? null;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * After any protected call returns 401, drop the session and go to login.
 * Signup and login are allowed to return 401 without a redirect loop.
 */
const baseQueryWithAuth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const url = typeof args === 'string' ? args : (args?.url ?? '');
  const isAuthAttempt = url.includes('/api/auth/login') || url.includes('/api/auth/signup');
  const status = result?.error?.status ?? null;

  if (status === 401 && !isAuthAttempt) {
    api.dispatch(sessionCleared());
    clearSession();
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.assign('/login');
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Outlet', 'Category', 'Product', 'Order', 'Inventory'],
  endpoints: (builder) => ({
    health: builder.query({
      query: () => '/health',
    }),
    signup: builder.mutation({
      query: (body) => ({ url: '/api/auth/signup', method: 'POST', body }),
    }),
    login: builder.mutation({
      query: (body) => ({ url: '/api/auth/login', method: 'POST', body }),
    }),
    me: builder.query({
      query: () => '/api/auth/me',
    }),

    outlets: builder.query({
      query: (params) => `/api/outlets${queryString(params)}`,
      providesTags: ['Outlet'],
    }),
    outlet: builder.query({
      query: (id) => `/api/outlets/${id ?? ''}`,
      providesTags: (result, error, id) => [{ type: 'Outlet', id: id ?? 'none' }],
    }),
    createOutlet: builder.mutation({
      query: (body) => ({ url: '/api/outlets', method: 'POST', body }),
      invalidatesTags: ['Outlet'],
    }),
    updateOutlet: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/outlets/${id ?? ''}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Outlet'],
    }),

    categories: builder.query({
      query: (params) => `/api/categories${queryString(params)}`,
      providesTags: ['Category'],
    }),
    category: builder.query({
      query: (id) => `/api/categories/${id ?? ''}`,
      providesTags: (result, error, id) => [{ type: 'Category', id: id ?? 'none' }],
    }),
    createCategory: builder.mutation({
      query: (body) => ({ url: '/api/categories', method: 'POST', body }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/categories/${id ?? ''}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({ url: `/api/categories/${id ?? ''}`, method: 'DELETE' }),
      invalidatesTags: ['Category', 'Product'],
    }),

    products: builder.query({
      query: (params) => `/api/products${queryString(params)}`,
      providesTags: ['Product'],
    }),
    product: builder.query({
      query: (id) => `/api/products/${id ?? ''}`,
      providesTags: (result, error, id) => [{ type: 'Product', id: id ?? 'none' }],
    }),
    createProduct: builder.mutation({
      query: (body) => ({ url: '/api/products', method: 'POST', body }),
      invalidatesTags: ['Product', 'Inventory'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/products/${id ?? ''}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Product'],
    }),
    hideProduct: builder.mutation({
      query: (id) => ({ url: `/api/products/${id ?? ''}`, method: 'DELETE' }),
      invalidatesTags: ['Product'],
    }),

    inventoryLogs: builder.query({
      query: (params) => `/api/inventory/logs${queryString(params)}`,
      providesTags: ['Inventory'],
    }),
    adjustStock: builder.mutation({
      query: (body) => ({ url: '/api/inventory/adjust', method: 'POST', body }),
      invalidatesTags: ['Inventory', 'Product'],
    }),

    orders: builder.query({
      query: (params) => `/api/orders${queryString(params)}`,
      providesTags: ['Order'],
    }),
    order: builder.query({
      query: (id) => `/api/orders/${id ?? ''}`,
      providesTags: (result, error, id) => [{ type: 'Order', id: id ?? 'none' }],
    }),
    createOrder: builder.mutation({
      query: (body) => ({ url: '/api/orders', method: 'POST', body }),
      // Stock changes, so the catalog must reload too.
      invalidatesTags: ['Order', 'Product', 'Inventory'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/orders/${id ?? ''}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Order', 'Product', 'Inventory'],
    }),
  }),
});

export const {
  useHealthQuery,
  useSignupMutation,
  useLoginMutation,
  useMeQuery,
  useOutletsQuery,
  useOutletQuery,
  useCreateOutletMutation,
  useUpdateOutletMutation,
  useCategoriesQuery,
  useCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useProductsQuery,
  useProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useHideProductMutation,
  useInventoryLogsQuery,
  useAdjustStockMutation,
  useOrdersQuery,
  useOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
} = api;

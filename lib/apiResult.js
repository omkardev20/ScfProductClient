// lib/apiResult.js
// The API always returns { data } or { error: { message, details } }.
// These helpers keep a missing body from throwing when a page renders.

/**
 * Sentence to show when a request fails.
 * @param {unknown} error RTK Query error
 * @returns {string}
 */
export const errorMessage = (error) => {
  return error?.data?.error?.message
    ?? error?.error
    ?? 'Could not reach the server';
};

/**
 * List payload. `result` is the JSON body `{ data, meta }`.
 * @param {unknown} body
 * @returns {unknown[]}
 */
export const listRows = (body) => body?.data ?? [];

/**
 * @param {unknown} body
 * @returns {{ limit: number, offset: number, total: number }}
 */
export const listMeta = (body) => ({
  limit: body?.meta?.limit ?? 50,
  offset: body?.meta?.offset ?? 0,
  total: body?.meta?.total ?? 0,
});

/**
 * One record inside `{ data: record }`.
 * @param {unknown} body
 */
export const oneRow = (body) => body?.data ?? null;

/**
 * Login and signup both return `{ data: { token, user } }`.
 * @param {unknown} body
 */
export const sessionFromBody = (body) => {
  const payload = body?.data ?? null;
  return {
    token: payload?.token ?? null,
    user: payload?.user ?? null,
  };
};

/**
 * @param {unknown} value
 * @returns {string}
 */
export const money = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return '—';
  }
  return amount.toFixed(2);
};

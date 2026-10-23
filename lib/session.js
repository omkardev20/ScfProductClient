// lib/session.js
// The JWT lives in localStorage so a refresh keeps the user logged in.
// Every read is guarded: a missing or broken value becomes null, never a crash.

const KEY = 'scfhub_session';

/**
 * Reads the saved token and user. Returns null when there is no session.
 * @returns {{ token: string, user: Record<string, unknown> | null } | null}
 */
export const readSession = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    const token = parsed?.token ?? null;
    if (!token) {
      return null;
    }
    return {
      token,
      user: parsed?.user ?? null,
    };
  } catch {
    window.localStorage.removeItem(KEY);
    return null;
  }
};

/**
 * Saves a login. A missing token clears the saved session instead.
 * @param {{ token?: string | null, user?: Record<string, unknown> | null } | null} session
 */
export const writeSession = (session) => {
  if (typeof window === 'undefined') {
    return;
  }

  const token = session?.token ?? null;
  if (!token) {
    window.localStorage.removeItem(KEY);
    return;
  }

  window.localStorage.setItem(
    KEY,
    JSON.stringify({
      token,
      user: session?.user ?? null,
    })
  );
};

/** Drops the saved token. Call this on logout and on a 401. */
export const clearSession = () => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(KEY);
};

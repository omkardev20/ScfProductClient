// app/providers.js
'use client';

import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { sessionStarted, sessionCleared } from '@/store/authSlice';
import { readSession } from '@/lib/session';

/**
 * One store for the browser session. Restores the token before pages render.
 */
export function Providers({ children }) {
  const [store] = useState(() => makeStore());

  useEffect(() => {
    const saved = readSession();
    if (saved?.token) {
      store.dispatch(sessionStarted(saved));
      return;
    }
    store.dispatch(sessionCleared());
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}

// store/store.js
// Auth state plus the RTK Query cache. Pages read both through the hooks.

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import { api } from './api';

export const makeStore = () => configureStore({
  reducer: {
    auth: authReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

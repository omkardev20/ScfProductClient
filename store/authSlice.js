// store/authSlice.js
// Holds the token the API slice attaches to every request.
// `ready` stays false until localStorage has been read, so the app does not
// flash the login page for a user who is already signed in.

import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
    ready: false,
  },
  reducers: {
    // Called after login, signup, or a successful /me refresh.
    sessionStarted(state, action) {
      state.token = action.payload?.token ?? null;
      state.user = action.payload?.user ?? null;
      state.ready = true;
    },
    // Called when storage is empty, or the token was rejected.
    sessionCleared(state) {
      state.token = null;
      state.user = null;
      state.ready = true;
    },
  },
});

export const { sessionStarted, sessionCleared } = authSlice.actions;
export default authSlice.reducer;

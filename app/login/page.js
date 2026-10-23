// app/login/page.js
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ErrorText, Field } from '@/components/ui';
import { sessionFromBody } from '@/lib/apiResult';
import { writeSession } from '@/lib/session';
import { useHealthQuery, useLoginMutation } from '@/store/api';
import { sessionStarted } from '@/store/authSlice';
import { useAppDispatch } from '@/store/hooks';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const health = useHealthQuery();
  const [login, loginState] = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const apiUp = health?.data?.status === 'healthy';
  const apiLabel = health?.isLoading
    ? 'Checking the API…'
    : (apiUp ? 'API is reachable' : 'API is not reachable on port 3000');

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const result = await login({
        email: email.trim(),
        password,
      }).unwrap();
      const session = sessionFromBody(result);
      if (!session.token) {
        return;
      }
      dispatch(sessionStarted(session));
      writeSession(session);
      router.push('/products');
    } catch {
      // The error object is rendered from loginState.error.
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={onSubmit}>
        <h1>Sign in</h1>
        <p className={apiUp ? 'ok' : 'muted'}>{apiLabel}</p>
        <ErrorText error={health?.error} />
        <Field label="Email">
          <input
            type="email"
            value={email}
            autoComplete="username"
            onChange={(event) => setEmail(event?.target?.value ?? '')}
            required
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(event) => setPassword(event?.target?.value ?? '')}
            required
          />
        </Field>
        <ErrorText error={loginState?.error} />
        <button type="submit" disabled={loginState?.isLoading}>
          {loginState?.isLoading ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="link-row">
          No account yet? <Link href="/signup">Create one</Link>
        </p>
      </form>
    </div>
  );
}

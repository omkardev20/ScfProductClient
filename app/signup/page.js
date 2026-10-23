// app/signup/page.js
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ErrorText, Field } from '@/components/ui';
import { sessionFromBody } from '@/lib/apiResult';
import { writeSession } from '@/lib/session';
import { useSignupMutation } from '@/store/api';
import { sessionStarted } from '@/store/authSlice';
import { useAppDispatch } from '@/store/hooks';

export default function SignupPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [signup, signupState] = useSignupMutation();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'SUPPLIER_ADMIN',
    outletId: '',
  });

  const set = (key) => (event) => {
    setForm((current) => ({
      ...current,
      [key]: event?.target?.value ?? '',
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const role = form?.role ?? 'SUPPLIER_ADMIN';
    const body = {
      fullName: form?.fullName?.trim?.() ?? '',
      email: form?.email?.trim?.() ?? '',
      password: form?.password ?? '',
      role,
      outletId: role === 'OUTLET_MANAGER' ? (form?.outletId?.trim?.() || null) : null,
    };

    try {
      const result = await signup(body).unwrap();
      const session = sessionFromBody(result);
      if (!session.token) {
        return;
      }
      dispatch(sessionStarted(session));
      writeSession(session);
      router.push('/products');
    } catch {
      // Rendered from signupState.error.
    }
  };

  const isManager = form?.role === 'OUTLET_MANAGER';

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={onSubmit}>
        <h1>Create an account</h1>
        <p className="muted">Create the supplier admin first, then an outlet, then a manager for that outlet.</p>
        <Field label="Full name">
          <input value={form?.fullName ?? ''} onChange={set('fullName')} required />
        </Field>
        <Field label="Email">
          <input type="email" value={form?.email ?? ''} onChange={set('email')} required />
        </Field>
        <Field label="Password (8 or more characters)">
          <input type="password" value={form?.password ?? ''} onChange={set('password')} minLength={8} required />
        </Field>
        <Field label="Role">
          <select value={form?.role ?? 'SUPPLIER_ADMIN'} onChange={set('role')}>
            <option value="SUPPLIER_ADMIN">Supplier admin</option>
            <option value="OUTLET_MANAGER">Outlet manager</option>
          </select>
        </Field>
        {isManager ? (
          <Field label="Outlet id">
            <input value={form?.outletId ?? ''} onChange={set('outletId')} required />
          </Field>
        ) : null}
        <ErrorText error={signupState?.error} />
        <button type="submit" disabled={signupState?.isLoading}>
          {signupState?.isLoading ? 'Creating…' : 'Create account'}
        </button>
        <p className="link-row">
          Already registered? <Link href="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

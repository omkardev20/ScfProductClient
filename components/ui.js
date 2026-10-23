// components/ui.js
'use client';

import { errorMessage } from '@/lib/apiResult';

/** Shows the API error sentence, or nothing when the request succeeded. */
export function ErrorText({ error }) {
  if (!error) {
    return null;
  }
  return <p className="error">{errorMessage(error)}</p>;
}

/** Label plus control. Children are the input. */
export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Page({ title, lede, children }) {
  return (
    <section className="page">
      <header className="page-head">
        <h1>{title}</h1>
        {lede ? <p className="muted">{lede}</p> : null}
      </header>
      {children}
    </section>
  );
}

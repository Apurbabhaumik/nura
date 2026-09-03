'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('NURA application error', error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-black/20 p-8 text-center backdrop-blur">
        <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/50">NURA</p>
        <h1 className="text-2xl font-semibold text-white">Something went wrong</h1>
        <p className="mt-3 text-sm leading-6 text-white/60">
          NURA hit an unexpected error. Your workspace data is safe. Try again, and if the problem continues,
          check the service status or contact support.
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:opacity-90"
        >
          Try again
        </button>
      </section>
    </main>
  );
}

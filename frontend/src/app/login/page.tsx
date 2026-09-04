'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi, getStoredToken, setStoredToken } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getStoredToken()) router.replace('/');
  }, [router]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await fetchApi<{ accessToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      setStoredToken(result.accessToken);
      router.replace('/');
    } catch (err: any) {
      setError(err?.message || 'Unable to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem', background: 'hsl(var(--background))' }}>
      <section style={{ width: '100%', maxWidth: 440, padding: '2rem', borderRadius: 24, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card) / 0.92)', boxShadow: '0 24px 80px rgba(0,0,0,.18)' }}>
        <Link href="/" style={{ textDecoration: 'none', fontWeight: 800, fontSize: '1.1rem' }}>NURA</Link>
        <h1 style={{ fontSize: '2rem', margin: '2rem 0 .5rem' }}>Welcome back</h1>
        <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem' }}>Sign in to continue learning with your AI study workspace.</p>
        <form onSubmit={submit}>
          <label style={{ display: 'block', marginBottom: '.4rem', fontSize: '.9rem' }}>Email</label>
          <input aria-label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', marginBottom: '1rem', padding: '.85rem 1rem', borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', color: 'inherit' }} />
          <label style={{ display: 'block', marginBottom: '.4rem', fontSize: '.9rem' }}>Password</label>
          <input aria-label="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', marginBottom: '1rem', padding: '.85rem 1rem', borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', color: 'inherit' }} />
          {error && <p role="alert" style={{ color: '#f43f5e', fontSize: '.9rem', marginBottom: '1rem' }}>{error}</p>}
          <button disabled={loading} type="submit" style={{ width: '100%', padding: '.9rem 1rem', border: 0, borderRadius: 12, cursor: loading ? 'wait' : 'pointer', fontWeight: 700, opacity: loading ? .7 : 1 }}>{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'hsl(var(--text-secondary))' }}>New to NURA? <Link href="/register">Create an account</Link></p>
      </section>
    </main>
  );
}

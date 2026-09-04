'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi, setStoredToken } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      await fetchApi('/auth/register', { method: 'POST', body: JSON.stringify({ name: name.trim(), email: email.trim(), password }) });
      const result = await fetchApi<{ accessToken: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email: email.trim(), password }) });
      setStoredToken(result.accessToken);
      router.replace('/');
    } catch (err: any) {
      setError(err?.message || 'Unable to create your account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem', background: 'hsl(var(--background))' }}>
      <section style={{ width: '100%', maxWidth: 440, padding: '2rem', borderRadius: 24, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card) / 0.92)', boxShadow: '0 24px 80px rgba(0,0,0,.18)' }}>
        <Link href="/" style={{ textDecoration: 'none', fontWeight: 800, fontSize: '1.1rem' }}>NURA</Link>
        <h1 style={{ fontSize: '2rem', margin: '2rem 0 .5rem' }}>Create your account</h1>
        <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem' }}>Build courses from your own learning material and study with AI.</p>
        <form onSubmit={submit}>
          <label style={{ display: 'block', marginBottom: '.4rem', fontSize: '.9rem' }}>Full name</label>
          <input aria-label="Full name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', marginBottom: '1rem', padding: '.85rem 1rem', borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', color: 'inherit' }} />
          <label style={{ display: 'block', marginBottom: '.4rem', fontSize: '.9rem' }}>Email</label>
          <input aria-label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', marginBottom: '1rem', padding: '.85rem 1rem', borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', color: 'inherit' }} />
          <label style={{ display: 'block', marginBottom: '.4rem', fontSize: '.9rem' }}>Password</label>
          <input aria-label="Password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', marginBottom: '1rem', padding: '.85rem 1rem', borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', color: 'inherit' }} />
          {error && <p role="alert" style={{ color: '#f43f5e', fontSize: '.9rem', marginBottom: '1rem' }}>{error}</p>}
          <button disabled={loading} type="submit" style={{ width: '100%', padding: '.9rem 1rem', border: 0, borderRadius: 12, cursor: loading ? 'wait' : 'pointer', fontWeight: 700, opacity: loading ? .7 : 1 }}>{loading ? 'Creating account…' : 'Create account'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'hsl(var(--text-secondary))' }}>Already have an account? <Link href="/login">Sign in</Link></p>
      </section>
    </main>
  );
}

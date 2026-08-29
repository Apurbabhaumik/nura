'use client';

import React from 'react';
import styles from '../app/page.module.css';

interface AuthModalProps {
  show: boolean;
  onClose: () => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  email: string;
  setEmail: (e: string) => void;
  password: string;
  setPassword: (p: string) => void;
  name: string;
  setName: (n: string) => void;
  authError: string;
  onSubmit: (e: React.FormEvent) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  show,
  authMode,
  setAuthMode,
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  authError,
  onSubmit,
}) => {
  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 style={{ marginBottom: '0.5rem' }}>{authMode === 'login' ? 'Sign In' : 'Create Account'}</h2>
        <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem' }}>
          Access your TeachStack workspace and AI courses.
        </p>

        <form onSubmit={onSubmit}>
          {authMode === 'register' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem' }}>Full Name</label>
              <input
                type="text"
                className={styles.inputControl}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.85rem' }}>Email Address</label>
            <input
              type="email"
              className={styles.inputControl}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.85rem' }}>Password</label>
            <input
              type="password"
              className={styles.inputControl}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {authError && <p style={{ color: '#f43f5e', fontSize: '0.85rem', marginBottom: '1rem' }}>{authError}</p>}

          <button type="submit" className={styles.btnGradient} style={{ width: '100%' }}>
            {authMode === 'login' ? 'Sign In' : 'Register Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
          {authMode === 'login' ? "Don't have an account? " : 'Already registered? '}
          <button
            style={{ background: 'none', border: 'none', color: 'hsl(var(--primary))', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
          >
            {authMode === 'login' ? 'Register' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

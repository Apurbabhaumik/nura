'use client';

import React from 'react';
import styles from '../app/page.module.css';

interface NavbarProps {
  workspaces: any[];
  selectedWorkspaceId: string;
  setSelectedWorkspaceId: (id: string) => void;
  dailyStreakDays: number;
  user: any;
  onSignOut: () => void;
  onOpenAuth: () => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  workspaces,
  selectedWorkspaceId,
  setSelectedWorkspaceId,
  dailyStreakDays,
  user,
  onSignOut,
  onOpenAuth,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className={styles.header}>
      <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }} className={styles.brand}>
        NURA<span>.</span>
      </a>

      <nav style={{ display: 'flex', gap: '2rem' }}>
        <button className={activeTab === 'dashboard' ? `${styles.tabBtn} ${styles.tabBtnActive}` : styles.tabBtn} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
        <button className={activeTab === 'ingestion' ? `${styles.tabBtn} ${styles.tabBtnActive}` : styles.tabBtn} onClick={() => setActiveTab('ingestion')}>Ingest</button>
        <button className={activeTab === 'reader' ? `${styles.tabBtn} ${styles.tabBtnActive}` : styles.tabBtn} onClick={() => setActiveTab('reader')}>Reader</button>
        <button className={activeTab === 'tutor' ? `${styles.tabBtn} ${styles.tabBtnActive}` : styles.tabBtn} onClick={() => setActiveTab('tutor')}>Tutor</button>
        <button className={activeTab === 'quizzes' ? `${styles.tabBtn} ${styles.tabBtnActive}` : styles.tabBtn} onClick={() => setActiveTab('quizzes')}>Assessments</button>
        <button className={activeTab === 'analytics' ? `${styles.tabBtn} ${styles.tabBtnActive}` : styles.tabBtn} onClick={() => setActiveTab('analytics')}>Analytics</button>
      </nav>

      <div className={styles.navControls}>
        <select
          style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', outline: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase' }}
          value={selectedWorkspaceId}
          onChange={(e) => setSelectedWorkspaceId(e.target.value)}
        >
          {workspaces.map((ws) => <option key={ws.id} value={ws.id} style={{ background: '#000', color: '#fff' }}>[{ws.name}]</option>)}
        </select>

        {user ? (
          <button style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase' }} onClick={onSignOut}>
            [EXIT: {user.name.split(' ')[0]}]
          </button>
        ) : (
          <a href="/login" className={styles.primaryBtn} style={{ textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); onOpenAuth(); }}>
            Sign in
          </a>
        )}
      </div>
    </header>
  );
};

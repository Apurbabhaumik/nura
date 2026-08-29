'use client';

import React from 'react';
import styles from '../app/page.module.css';
import { Clock, Award, Flame, Sparkles, ArrowRight } from 'lucide-react';

interface DashboardTabProps {
  stats: any;
  courses: any[];
  onSelectCourse: (c: any) => void;
  onNewCourse: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  stats,
  courses,
  onSelectCourse,
  onNewCourse,
}) => {
  return (
    <div style={{ marginTop: '4rem' }}>
      <div className={styles.bentoHeader} style={{ marginBottom: '1.5rem' }}>
        <span>TELEMETRY METRICS</span>
      </div>
      
      <div className={styles.bentoGrid} style={{ marginBottom: '4rem', gridAutoRows: 'auto' }}>
        <div className={`${styles.bentoItem} ${styles.bentoSquare}`} style={{ padding: '2rem' }}>
          <Clock size={24} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
          <div style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1 }}>{stats.totalStudyMinutes}m</div>
          <div className={styles.bentoHeader} style={{ marginTop: '0.5rem', marginBottom: 0 }}>Total Study Time</div>
        </div>

        <div className={`${styles.bentoItem} ${styles.bentoSquare}`} style={{ padding: '2rem' }}>
          <Award size={24} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
          <div style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1 }}>{stats.completionRate}%</div>
          <div className={styles.bentoHeader} style={{ marginTop: '0.5rem', marginBottom: 0 }}>Course Completion</div>
        </div>

        <div className={`${styles.bentoItem} ${styles.bentoSquare}`} style={{ padding: '2rem' }}>
          <Flame size={24} style={{ color: 'var(--text-primary)', marginBottom: '1rem' }} />
          <div style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1 }}>{stats.dailyStreakDays}</div>
          <div className={styles.bentoHeader} style={{ marginTop: '0.5rem', marginBottom: 0 }}>Active Day Streak</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div className={styles.bentoHeader} style={{ marginBottom: 0 }}>
          <span>ACTIVE WORKSPACE INDEXES</span>
        </div>
        <button className={styles.primaryBtn} onClick={onNewCourse} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.5rem' }}>
          <Sparkles size={16} /> New Index
        </button>
      </div>

      <div className={styles.bentoGrid} style={{ gridAutoRows: 'auto', marginBottom: '4rem' }}>
        {courses.map((c) => (
          <div key={c.id} className={`${styles.bentoItem} ${styles.bentoSquare}`} onClick={() => onSelectCourse(c)} style={{ cursor: 'pointer', padding: '2rem' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', border: '1px solid var(--border-light)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                {c.difficulty.toUpperCase()}
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '1rem 0' }}>{c.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.description}</p>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
               <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>67% SYNCED</span>
               <ArrowRight size={16} style={{ color: 'var(--text-secondary)' }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div className={styles.bentoHeader} style={{ marginBottom: 0 }}>
          <span>COMMUNITY KNOWLEDGE HUB (FREE DOWNLOADS)</span>
        </div>
      </div>

      <div className={styles.bentoGrid} style={{ gridAutoRows: 'auto' }}>
        
        <div className={`${styles.bentoItem} ${styles.bentoSquare}`} style={{ padding: '2rem' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', background: 'var(--bg-primary)', border: '1px solid var(--text-primary)', color: 'var(--text-primary)', padding: '0.2rem 0.5rem', borderRadius: '0' }}>
              P2P SHARED
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '1rem 0' }}>MIT 6.006: Intro to Algorithms</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Pre-indexed 1536d vector space for MIT's core algorithm course. Includes 300+ generated flashcards.
            </p>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <button className={styles.primaryBtn} style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              Download Index (12MB)
            </button>
          </div>
        </div>

        <div className={`${styles.bentoItem} ${styles.bentoSquare}`} style={{ padding: '2rem' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', background: 'var(--bg-primary)', border: '1px solid var(--text-primary)', color: 'var(--text-primary)', padding: '0.2rem 0.5rem', borderRadius: '0' }}>
              P2P SHARED
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '1rem 0' }}>React 19 Official Docs</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Latest React documentation ingested and vectorized for instant RAG tutoring.
            </p>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <button className={styles.primaryBtn} style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              Download Index (4MB)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

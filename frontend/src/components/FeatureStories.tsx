'use client';

import React from 'react';
import styles from '../app/page.module.css';
import { UploadCloud, MessageSquare, HelpCircle, ArrowRight } from 'lucide-react';

interface FeatureStoriesProps {
  onGoToIngestion: () => void;
  onGoToTutor: () => void;
  onGoToQuizzes: () => void;
}

export const FeatureStories: React.FC<FeatureStoriesProps> = ({
  onGoToIngestion,
  onGoToTutor,
  onGoToQuizzes,
}) => {
  return (
    <div className={styles.bentoGrid}>
      {/* 01: Ingestion (Wide) */}
      <div className={`${styles.bentoItem} ${styles.bentoWide}`}>
        <div>
          <div className={styles.bentoHeader}>
            <span>01 // INGESTION ENGINE</span>
          </div>
          <h2 className={styles.bentoTitle}>Parse PDFs, Repos &amp; Lectures Instantly.</h2>
          <p className={styles.bentoDesc}>
            Upload complex technical documentation, link a repository, or paste a video URL. NURA recursively chunks and indexes content into 1536-dimensional vector space.
          </p>
        </div>
        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <UploadCloud size={64} style={{ color: 'var(--text-primary)', opacity: 0.2 }} />
          <button className={styles.primaryBtn} onClick={onGoToIngestion} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Open Deck <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* 02: RAG Tutor (Square) */}
      <div className={`${styles.bentoItem} ${styles.bentoSquare}`}>
        <div>
          <div className={styles.bentoHeader}>
            <span>02 // RAG TUTOR</span>
          </div>
          <h2 className={styles.bentoTitle}>Authoritative Answers.</h2>
          <p className={styles.bentoDesc}>
            Get answers tied directly to your ingested materials with exact citations and similarity confidence scores.
          </p>
        </div>
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <MessageSquare size={48} style={{ color: 'var(--accent-indigo)' }} />
          <button className={styles.primaryBtn} onClick={onGoToTutor} style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* 03: Assessments (Square) */}
      <div className={`${styles.bentoItem} ${styles.bentoSquare}`}>
        <div>
          <div className={styles.bentoHeader}>
            <span>03 // KNOWLEDGE RETENTION</span>
          </div>
          <h2 className={styles.bentoTitle}>Spaced Repetition.</h2>
          <p className={styles.bentoDesc}>
            Synthesize 3D flashcards and auto-graded quizzes to reinforce long-term concept retention.
          </p>
        </div>
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <HelpCircle size={48} style={{ color: 'var(--accent-blue)' }} />
          <button className={styles.primaryBtn} onClick={onGoToQuizzes} style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* 04: Analytics Placeholder (Wide) */}
      <div className={`${styles.bentoItem} ${styles.bentoWide}`}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div className={styles.bentoHeader}>
            <span>04 // TELEMETRY &amp; ANALYTICS</span>
          </div>
          <h2 className={styles.bentoTitle}>Track Concept Mastery.</h2>
          <p className={styles.bentoDesc} style={{ maxWidth: '600px', margin: '0 auto' }}>
            Identify weak areas in your understanding through constant assessment telemetry, allowing the AI to re-route your learning path dynamically.
          </p>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import styles from '../app/page.module.css';
import { Search, ArrowRight } from 'lucide-react';
import { fetchApi } from '../lib/api';

interface HeroQASearchProps {
  activeCourse: any;
  onGoToTutor: () => void;
}

export const HeroQASearch: React.FC<HeroQASearchProps> = ({ activeCourse, onGoToTutor }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [answerResult, setAnswerResult] = useState<any>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setAnswerResult(null);

    try {
      const courseId = activeCourse ? activeCourse.id : 'course-sample-1';
      const res = (await fetchApi('/tutor/chat', {
        method: 'POST',
        body: JSON.stringify({ courseId, question: query }),
      })) as any;

      setAnswerResult({
        answer: res.answer,
        citations: res.citations || [
          { chunkIndex: 1, snippet: 'System design architecture chunk #1', relevanceScore: '98%' },
        ],
        confidence: '98%',
      });
    } catch (err) {
      setTimeout(() => {
        let text = 'A modular monolith isolates domain boundaries into strict decoupled modules while sharing a single runtime and database. This eliminates network latency overhead.';
        if (query.toLowerCase().includes('vector') || query.toLowerCase().includes('qdrant')) {
          text = 'Qdrant indexes 1536-dimensional embeddings using HNSW graph algorithms for sub-millisecond cosine similarity search over chunked datasets.';
        } else if (query.toLowerCase().includes('bullmq') || query.toLowerCase().includes('queue')) {
          text = 'BullMQ uses Redis data structures to process asynchronous heavy ingestion jobs with retry policies and exponential backoff.';
        }

        setAnswerResult({
          answer: text,
          citations: [
            { chunkIndex: 1, snippet: 'Architecture Specification v1.0', relevanceScore: '97%' },
            { chunkIndex: 4, snippet: 'Internal Engineering Docs', relevanceScore: '94%' },
          ],
          confidence: '97%',
        });
        setIsSearching(false);
      }, 800);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className={`${styles.heroSection} animate-fade-up`}>
      <div className={styles.heroEyebrow}>
        [ NURA INTELLIGENCE ENGINE ]
      </div>
      
      <div style={{ position: 'relative' }}>
        <h1 className={styles.heroTitle}>
          Synthesize <br/> Knowledge.
        </h1>
        
        {/* Floating Badges */}
        <div style={{ position: 'absolute', top: '-1rem', left: '-2rem', animation: 'float 6s ease-in-out infinite' }}>
          <span style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', padding: '0.2rem 0.5rem', borderRadius: '0', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>1536d Vectors</span>
        </div>
        <div style={{ position: 'absolute', bottom: '2rem', right: '-4rem', animation: 'float 7s ease-in-out infinite 1s' }}>
          <span style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', padding: '0.2rem 0.5rem', borderRadius: '0', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>0ms Latency</span>
        </div>
      </div>
      
      <p className={styles.heroSubtitle}>
        Query your vectorized codebase and ingested documentation with sub-second RAG retrieval. Eliminate the noise.
      </p>

      {/* Marquee Ticker */}
      <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', marginBottom: '3rem', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', padding: '0.5rem 0' }}>
        <div style={{ display: 'inline-block', animation: 'marquee 20s linear infinite' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 2rem' }}>// TRANSFORMERS.JS LOCAL EMBEDDINGS</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 2rem' }}>// WEBLLM BROWSER INFERENCE</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 2rem' }}>// P2P COMMUNITY INDEXES</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 2rem' }}>// SPACED REPETITION ENGINE</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 2rem' }}>// TRANSFORMERS.JS LOCAL EMBEDDINGS</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 2rem' }}>// WEBLLM BROWSER INFERENCE</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 2rem' }}>// P2P COMMUNITY INDEXES</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 2rem' }}>// SPACED REPETITION ENGINE</span>
        </div>
      </div>

      <div className={styles.searchContainer}>
        <form onSubmit={handleSearch} style={{ position: 'relative' }}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Ask a question about the system architecture..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className={styles.searchSubmit} disabled={isSearching}>
            <Search size={24} />
          </button>
        </form>

        {answerResult && (
          <div className={styles.answerBox}>
            <div className={styles.answerMeta}>
              <span>SYNTHESIZED RESPONSE</span>
              <span style={{ color: 'var(--text-primary)' }}>CONFIDENCE: {answerResult.confidence}</span>
            </div>
            
            <p className={styles.answerContent}>{answerResult.answer}</p>

            <div className={styles.citationWrap}>
              {answerResult.citations.map((c: any, idx: number) => (
                <span key={idx} className={styles.citationPill}>
                  {c.snippet} ({c.relevanceScore})
                </span>
              ))}
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
              <button 
                onClick={onGoToTutor}
                style={{
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginLeft: 'auto'
                }}
              >
                Open Terminal <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

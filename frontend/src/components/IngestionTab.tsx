'use client';

import React from 'react';
import styles from '../app/page.module.css';
import { UploadCloud, Sparkles, RotateCw } from 'lucide-react';

interface IngestionTabProps {
  ingestUrl: string;
  setIngestUrl: (u: string) => void;
  ingestFilename: string;
  setIngestFilename: (f: string) => void;
  isProcessing: boolean;
  processingStep: number;
  onFileSelect: (file: File) => void;
  onTrigger: (e: React.FormEvent) => void;
}

export const IngestionTab: React.FC<IngestionTabProps> = ({ ingestUrl, setIngestUrl, ingestFilename, setIngestFilename, isProcessing, processingStep, onFileSelect, onTrigger }) => (
  <div>
    <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>AI Ingestion Deck</h2></div>
    <div className={styles.ingestionLayout}>
      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>📁 Document Upload</h3>
        <label className={styles.dropzoneArea} style={{ display: 'block', cursor: 'pointer' }}>
          <input type="file" accept=".pdf,.txt,.md,.csv" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) { setIngestFilename(file.name); onFileSelect(file); } }} />
          <UploadCloud size={48} style={{ color: 'hsl(var(--primary))', marginBottom: '1rem' }} />
          <h4>Choose a PDF, TXT, MD, or CSV file</h4>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', marginTop: '0.5rem' }}>{ingestFilename ? `Selected: ${ingestFilename}` : 'Max file size 50MB'}</p>
        </label>
        {ingestFilename && <button type="button" className={styles.btnGradient} style={{ marginTop: '1.5rem', width: '100%' }} onClick={onTrigger}>Process File & Generate Course</button>}
      </div>
      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>🌐 Web / Repository Ingestion</h3>
        <form onSubmit={onTrigger}>
          <label style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>GitHub Repository or YouTube Lecture URL</label>
          <input type="url" className={styles.inputControl} placeholder="https://github.com/org/repo or YouTube URL" value={ingestUrl} onChange={(e) => setIngestUrl(e.target.value)} />
          <div style={{ marginTop: '1.5rem' }}><button type="submit" className={styles.btnGradient} style={{ width: '100%' }}><Sparkles size={18} /> Ingest & Generate Curriculum</button></div>
        </form>
        {isProcessing && <div style={{ marginTop: '2rem', padding: '1rem', background: 'hsla(var(--bg-primary), 0.6)', borderRadius: '12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}><RotateCw size={18} style={{ color: 'hsl(var(--secondary))' }} /><span style={{ fontWeight: 600 }}>Step {processingStep}/4: Executing AI Pipeline</span></div><p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>{processingStep === 1 && 'Reading source content...'}{processingStep === 2 && 'Chunking source material...'}{processingStep === 3 && 'Indexing retrieved knowledge...'}{processingStep === 4 && 'Building lessons, flashcards and quizzes...'}</p></div>}
      </div>
    </div>
  </div>
);

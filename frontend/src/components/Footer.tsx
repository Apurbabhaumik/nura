'use client';

import React from 'react';
import styles from '../app/page.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerBrand}>
        NURA<span>.</span>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Intelligence Engine &copy; 2026
        </p>
      </div>

      <div className={styles.footerCol}>
        <h4>Platform</h4>
        <ul>
          <li><a href="#dashboard">Dashboard</a></li>
          <li><a href="#ingest">Ingestion Deck</a></li>
          <li><a href="#reader">Course Reader</a></li>
          <li><a href="#tutor">Tutor Console</a></li>
        </ul>
      </div>

      <div className={styles.footerCol}>
        <h4>Architecture</h4>
        <ul>
          <li><a href="#qdrant">Qdrant Vector DB</a></li>
          <li><a href="#bullmq">BullMQ & Redis</a></li>
          <li><a href="#nestjs">NestJS Monolith</a></li>
          <li><a href="#prisma">Prisma ORM</a></li>
        </ul>
      </div>
    </footer>
  );
};

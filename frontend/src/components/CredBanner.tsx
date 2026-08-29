'use client';

import React from 'react';
import styles from '../app/page.module.css';
import { Terminal, Key, ArrowRight } from 'lucide-react';

interface CredBannerProps {
  onAutoFill: () => void;
}

export const CredBanner: React.FC<CredBannerProps> = ({ onAutoFill }) => {
  return (
    <div className={styles.credBanner}>
      <div className={styles.credInfo}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className={styles.pulseDot} />
          <span>[SYSTEM_AUTH]</span>
        </div>
        <span style={{ opacity: 0.7 }}>
          USER: student@nura.ai | PASS: password123
        </span>
      </div>
      <button className={styles.autoFillBtn} onClick={onAutoFill}>
        INITIALIZE LOGIN
      </button>
    </div>
  );
};

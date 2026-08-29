'use client';

import React from 'react';
import styles from '../app/page.module.css';

export const BigStatement: React.FC = () => {
  return (
    <section className={styles.statementSection}>
      <h2 className={styles.statementText}>
        Traditional learning is broken. Unindexed codebases, disconnected docs, and passive tutorials cost engineers hundreds of hours. <br />
        <span>NURA turns raw data into structured mastery.</span>
      </h2>
    </section>
  );
};

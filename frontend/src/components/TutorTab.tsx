'use client';

import React from 'react';
import styles from '../app/page.module.css';
import { MessageSquare, Send } from 'lucide-react';

interface TutorTabProps {
  activeCourse: any;
  chatMessages: any[];
  chatInput: string;
  setChatInput: (val: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
}

export const TutorTab: React.FC<TutorTabProps> = ({
  activeCourse,
  chatMessages,
  chatInput,
  setChatInput,
  onSendMessage,
}) => {
  return (
    <div className={styles.splitView}>
      <div className="glass-card">
        <h3>🤖 RAG Tutor Context</h3>
        <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', marginTop: '0.5rem' }}>
          Course: <strong>{activeCourse?.title || 'Active Course'}</strong>
        </p>
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'hsla(var(--bg-primary), 0.5)', borderRadius: '12px' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Indexed Vector Store</h4>
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
            Qdrant Collection ID: <code>{activeCourse?.id || 'default'}</code>
          </p>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <span className={styles.citationTag}>1536-dim vectors</span>
            <span className={styles.citationTag}>Cosine Similarity</span>
          </div>
        </div>
      </div>

      <div className={styles.chatConsole}>
        <div className={styles.chatHeader}>
          <span style={{ fontWeight: 600 }}>TeachStack RAG Tutor</span>
          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--secondary))' }}>● Online</span>
        </div>

        <div className={styles.chatMessages}>
          {chatMessages.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'hsl(var(--text-muted))' }}>
              <MessageSquare size={36} style={{ marginBottom: '0.5rem' }} />
              <p>Ask any question about your course materials!</p>
            </div>
          ) : (
            chatMessages.map((msg, idx) => (
              <div key={idx} className={msg.sender === 'user' ? styles.msgUser : styles.msgBot}>
                <div>{msg.text}</div>
                {msg.citations && (
                  <div>
                    {msg.citations.map((c: any, cIdx: number) => (
                      <div key={cIdx} className={styles.citationTag}>
                        📌 [Chunk #{c.chunkIndex}] Score: {c.relevanceScore}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <form onSubmit={onSendMessage} className={styles.chatInputBox}>
          <input
            type="text"
            className={styles.inputControl}
            style={{ marginTop: 0 }}
            placeholder="Ask a question about the course..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <button type="submit" className={styles.btnGradient}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

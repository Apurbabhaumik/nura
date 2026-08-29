'use client';

import React, { useState } from 'react';
import styles from '../app/page.module.css';
import { CheckCircle, BrainCircuit } from 'lucide-react';

interface AssessmentTabProps {
  selectedLesson: any;
  userAnswers: Record<string, string>;
  setUserAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  quizResult: any;
  onSubmitQuiz: () => void;
  currentFcIndex: number;
  setCurrentFcIndex: React.Dispatch<React.SetStateAction<number>>;
  isFlipped: boolean;
  setIsFlipped: (val: boolean) => void;
}

export const AssessmentTab: React.FC<AssessmentTabProps> = ({
  selectedLesson,
  userAnswers,
  setUserAnswers,
  quizResult,
  onSubmitQuiz,
  currentFcIndex,
  setCurrentFcIndex,
  isFlipped,
  setIsFlipped,
}) => {
  const [clozeAnswer, setClozeAnswer] = useState('');
  const [clozeStatus, setClozeStatus] = useState<null | 'correct' | 'incorrect'>(null);

  const handleClozeSubmit = () => {
    if (clozeAnswer.toLowerCase().trim() === 'cosine similarity') {
      setClozeStatus('correct');
    } else {
      setClozeStatus('incorrect');
    }
  };

  return (
    <div>
      <div className={styles.bentoHeader} style={{ marginBottom: '2rem' }}>
        <span>ACTIVE ASSESSMENT PROTOCOLS</span>
      </div>

      {/* 1. ACTIVE RECALL CLOZE DELETIONS */}
      <div className={styles.glassCard} style={{ marginBottom: '2.5rem', border: '1px solid var(--border-light)' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BrainCircuit size={20} style={{ color: 'var(--text-primary)' }} />
          Active Recall (Cloze Deletion)
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Fill in the blank from memory. Passive reading is insufficient for mastery.
        </p>

        <div style={{ fontSize: '1.25rem', lineHeight: 1.8, fontFamily: 'var(--font-mono)' }}>
          When comparing vectors in Qdrant, the most common metric used to determine how close two concepts are is called 
          <input 
            type="text" 
            value={clozeAnswer}
            onChange={(e) => { setClozeAnswer(e.target.value); setClozeStatus(null); }}
            placeholder="[ type answer ]"
            style={{ 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-light)',
              borderBottom: clozeStatus === 'correct' ? '2px solid var(--text-primary)' : clozeStatus === 'incorrect' ? '2px solid var(--text-muted)' : '2px solid var(--border-light)',
              color: clozeStatus === 'correct' ? 'var(--text-primary)' : clozeStatus === 'incorrect' ? 'var(--text-muted)' : 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '1.25rem',
              padding: '0 0.5rem',
              margin: '0 0.5rem',
              width: '250px',
              outline: 'none',
              textAlign: 'center'
            }}
          />
          .
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <button className={styles.primaryBtn} onClick={handleClozeSubmit}>VERIFY RECALL</button>
        </div>
      </div>

      {/* 2. FLASHCARDS */}
      <div className={styles.glassCard} style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>🎴 Spaced Repetition Flashcards</h3>

        {selectedLesson?.flashcards?.length > 0 ? (
          <div>
            <div className={styles.cardContainer} onClick={() => setIsFlipped(!isFlipped)}>
              <div className={isFlipped ? styles.cardInner + ' ' + styles.cardFlipped : styles.cardInner}>
                <div className={styles.cardFront}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    QUESTION / CONCEPT
                  </span>
                  <h3 style={{ fontSize: '1.25rem' }}>{selectedLesson.flashcards[currentFcIndex]?.front}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                    Click to flip card
                  </span>
                </div>
                <div className={styles.cardBack}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    EXPLANATION / ANSWER
                  </span>
                  <p style={{ fontSize: '1.1rem' }}>{selectedLesson.flashcards[currentFcIndex]?.back}</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button
                className={styles.primaryBtn}
                style={{ background: 'transparent', border: '1px solid var(--text-primary)', color: 'var(--text-primary)' }}
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentFcIndex((prev) => (prev + 1) % selectedLesson.flashcards.length);
                }}
              >
                Easy (Got it!)
              </button>
              <button
                className={styles.primaryBtn}
                style={{ background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-muted)' }}
                onClick={() => setIsFlipped(false)}
              >
                Hard (Review again)
              </button>
            </div>
          </div>
        ) : (
          <p>No flashcards created for this lesson yet.</p>
        )}
      </div>

      {/* 3. MULTIPLE CHOICE */}
      {selectedLesson?.quizzes?.[0] && (
        <div className={styles.glassCard}>
          <h3 style={{ marginBottom: '1.5rem' }}>📝 Verification Quiz</h3>

          {selectedLesson.quizzes[0].questions?.map((q: any) => (
            <div key={q.id} style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '1rem' }}>{q.question}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {q.options?.map((opt: string, oIdx: number) => (
                  <button
                    key={oIdx}
                    style={{
                      textAlign: 'left', padding: '1rem', borderRadius: '8px',
                      background: userAnswers[q.id] === opt ? 'rgba(255,255,255,0.1)' : 'transparent',
                      border: `1px solid ${userAnswers[q.id] === opt ? 'var(--text-primary)' : 'var(--border-light)'}`,
                      color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between'
                    }}
                    onClick={() => setUserAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                  >
                    <span>{opt}</span>
                    {userAnswers[q.id] === opt && <CheckCircle size={16} />}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button className={styles.primaryBtn} onClick={onSubmitQuiz} style={{ marginTop: '1rem' }}>
            Submit Assessment
          </button>

          {quizResult && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                borderRadius: '8px',
                border: `1px solid ${quizResult.passed ? 'var(--text-primary)' : 'var(--text-muted)'}`,
                background: 'var(--bg-secondary)'
              }}
            >
              <h4>
                Score: {quizResult.score} / {quizResult.total} ({quizResult.percentage}%)
              </h4>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {quizResult.passed ? 'NODE MASTERY ACHIEVED' : 'SUB-OPTIMAL RETENTION'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

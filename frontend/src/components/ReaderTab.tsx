'use client';

import React, { useState, useEffect } from 'react';
import styles from '../app/page.module.css';
import { ArrowRight, Clock, Play, Terminal, CheckCircle2, Maximize2, Minimize2, Timer } from 'lucide-react';

interface ReaderTabProps {
  activeCourse: any;
  selectedLesson: any;
  setSelectedLesson: (les: any) => void;
  onGoToQuizzes: () => void;
}

// ------------------------------------------------------------------
// Sub-component: Simulated Interactive Code Sandbox
// ------------------------------------------------------------------
const InteractiveSandbox = ({ code }: { code: string }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  const handleRun = () => {
    setIsRunning(true);
    setOutput(null);
    // Simulate compilation/execution delay
    setTimeout(() => {
      setIsRunning(false);
      setOutput('> Build successful.\n> [NURA_EXEC] Processing...\n> Output: Core abstractions initialized.\n> Execution time: 14ms');
    }, 800);
  };

  return (
    <div style={{ margin: '2rem 0', border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden', background: '#0a0a0a' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-light)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>NURA_LIVE_ENV</span>
        <button 
          onClick={handleRun}
          style={{ 
            background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', 
            padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer'
          }}
        >
          {isRunning ? 'EXECUTING...' : <><Play size={12}/> RUN CODE</>}
        </button>
      </div>
      <div style={{ padding: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#a5b4fc', whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
        {code}
      </div>
      {output && (
        <div style={{ borderTop: '1px solid var(--border-light)', padding: '1rem', background: '#050505', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#10b981', whiteSpace: 'pre-wrap' }}>
          <Terminal size={14} style={{ display: 'inline', marginBottom: '-2px', marginRight: '4px' }} />
          {output}
        </div>
      )}
    </div>
  );
};

// ------------------------------------------------------------------
// Main Component: ReaderTab
// ------------------------------------------------------------------
export const ReaderTab: React.FC<ReaderTabProps> = ({
  activeCourse,
  selectedLesson,
  setSelectedLesson,
  onGoToQuizzes,
}) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isELI5, setIsELI5] = useState(false);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => setPomodoroSeconds(p => p - 1), 1000);
    } else if (pomodoroSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroSeconds]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!activeCourse) {
    return <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>No course selected.</div>;
  }

  // Parse markdown to inject custom interactive elements
  const renderMarkdown = (text: string) => {
    const parts = text.split('```typescript');
    if (parts.length === 1) return <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{text}</div>;

    const elements: JSX.Element[] = [];
    elements.push(<div key="part0" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{parts[0]}</div>);
    
    for (let i = 1; i < parts.length; i++) {
      const codeSplit = parts[i].split('```');
      const code = codeSplit[0].trim();
      const remainder = codeSplit[1] || '';
      
      elements.push(<InteractiveSandbox key={`code${i}`} code={code} />);
      elements.push(<div key={`part${i}`} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{remainder}</div>);
    }
    return elements;
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', height: isFocusMode ? '100vh' : 'auto', position: isFocusMode ? 'fixed' : 'relative', top: isFocusMode ? 0 : 'auto', left: isFocusMode ? 0 : 'auto', right: isFocusMode ? 0 : 'auto', background: 'var(--bg-primary)', zIndex: isFocusMode ? 999 : 1, padding: isFocusMode ? '2rem' : 0 }}>
      
      {/* Sidebar: Hidden in focus mode */}
      {!isFocusMode && (
        <div className={styles.glassCard} style={{ flex: '0 0 350px', maxHeight: '80vh', overflowY: 'auto' }}>
          <div className={styles.bentoHeader}>
            <span>LEARNING ROADMAP</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>
            {activeCourse.title}
          </h3>

          {activeCourse.modules?.map((mod: any, mIdx: number) => (
            <div key={mod.id || mIdx} style={{ marginBottom: '2rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-indigo)', marginBottom: '1rem', textTransform: 'uppercase' }}>
                {mod.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {mod.lessons?.map((les: any, lIdx: number) => (
                  <button
                    key={les.id || lIdx}
                    style={{
                      textAlign: 'left',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: `1px solid ${selectedLesson?.id === les.id ? 'var(--text-primary)' : 'var(--border-light)'}`,
                      background: selectedLesson?.id === les.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setSelectedLesson(les)}
                  >
                    <span style={{ fontSize: '0.9rem', fontWeight: selectedLesson?.id === les.id ? 600 : 400 }}>{les.title}</span>
                    <Clock size={14} style={{ color: 'var(--text-secondary)' }} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <div className={styles.glassCard} style={{ flex: 1, maxHeight: isFocusMode ? 'calc(100vh - 4rem)' : '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        {/* Focus Mode & Pomodoro Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className={styles.bentoHeader} style={{ margin: 0 }}>
              <span style={{ color: isTimerRunning ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                <Timer size={14} style={{ display: 'inline', marginBottom: '-2px', marginRight: '4px' }}/>
                DEEP WORK TIMER: {formatTime(pomodoroSeconds)}
              </span>
            </div>
            <button onClick={toggleTimer} style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>
              {isTimerRunning ? 'PAUSE' : 'START'}
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setIsFocusMode(!isFocusMode)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isFocusMode ? <><Minimize2 size={16}/> Exit Focus</> : <><Maximize2 size={16}/> Enter Focus</>}
            </button>
          </div>
        </div>

        {/* Lesson Content */}
        {selectedLesson ? (
          <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '4rem' }}>
            
            {/* ELI5 Adaptive Difficulty Toggle */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
                <button 
                  onClick={() => setIsELI5(false)}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    fontSize: '0.75rem', 
                    fontFamily: 'var(--font-mono)', 
                    background: !isELI5 ? 'var(--text-primary)' : 'transparent',
                    color: !isELI5 ? '#000' : 'var(--text-secondary)',
                    border: 'none', cursor: 'pointer', fontWeight: 600
                  }}
                >
                  [ TECHNICAL ]
                </button>
                <button 
                  onClick={() => setIsELI5(true)}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    fontSize: '0.75rem', 
                    fontFamily: 'var(--font-mono)', 
                    background: isELI5 ? 'var(--text-primary)' : 'transparent',
                    color: isELI5 ? '#000' : 'var(--text-secondary)',
                    border: 'none', cursor: 'pointer', fontWeight: 600
                  }}
                >
                  [ ELI5 MODE ]
                </button>
              </div>
            </div>

            <div style={{ fontSize: '1.1rem' }}>
              {isELI5 ? (
                <div style={{ padding: '2rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
                  <h3 style={{ color: '#10b981', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🧩 Simplified Explanation (ELI5)
                  </h3>
                  <p style={{ lineHeight: 1.8 }}>
                    Imagine a library where instead of finding books by their title, you find them by their <em>vibe</em> or meaning. That's what a Vector Database does!<br/><br/>
                    When you put text into the system, an AI turns that text into a list of numbers (a vector). Similar ideas get similar numbers. So when you ask a question, the system turns your question into numbers too, and finds the "books" (data chunks) that have the closest matching numbers. This is much faster and smarter than just searching for exact keywords!
                  </p>
                </div>
              ) : (
                renderMarkdown(selectedLesson.markdown)
              )}
            </div>

            <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '2rem' }}>
              <button className={styles.primaryBtn} onClick={onGoToQuizzes} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} /> Mark Complete & Take Assessment
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            Select a lesson from the roadmap to view contents.
          </div>
        )}
      </div>
    </div>
  );
};

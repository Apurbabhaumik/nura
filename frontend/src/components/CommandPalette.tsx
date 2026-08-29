'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Compass, BookOpen, BrainCircuit, Activity, FileText } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: 'dashboard' | 'ingestion' | 'reader' | 'tutor' | 'quizzes' | 'analytics') => void;
}

const commands = [
  { id: 'dashboard', label: 'Go to Dashboard', icon: Compass, tab: 'dashboard' },
  { id: 'ingestion', label: 'Ingest New Syllabus', icon: Search, tab: 'ingestion' },
  { id: 'reader', label: 'Open Reader (Course Material)', icon: BookOpen, tab: 'reader' },
  { id: 'tutor', label: 'Launch AI Tutor Chat', icon: BrainCircuit, tab: 'tutor' },
  { id: 'quizzes', label: 'Active Assessment (Flashcards)', icon: FileText, tab: 'quizzes' },
  { id: 'analytics', label: 'View Knowledge Graph', icon: Activity, tab: 'analytics' },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, setActiveTab }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          setActiveTab(filteredCommands[selectedIndex].tab as any);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, setActiveTab, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          width: '100%',
          maxWidth: '600px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.2s cubic-bezier(0.19, 1, 0.22, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-light)' }}>
          <Search size={20} color="var(--text-secondary)" style={{ marginRight: '1rem' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '1.25rem',
              fontFamily: 'var(--font-sans)',
            }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', border: '1px solid var(--border-light)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>ESC</span>
        </div>

        <div style={{ padding: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => (
              <div
                key={cmd.id}
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => {
                  setActiveTab(cmd.tab as any);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  background: selectedIndex === idx ? 'var(--border-light)' : 'transparent',
                  color: selectedIndex === idx ? 'var(--text-primary)' : 'var(--text-secondary)',
                  transition: 'all 0.1s ease',
                }}
              >
                <cmd.icon size={18} style={{ marginRight: '1rem' }} />
                <span style={{ fontSize: '1rem', fontWeight: 500 }}>{cmd.label}</span>
                {selectedIndex === idx && (
                  <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>↵ ENTER</span>
                )}
              </div>
            ))
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
              No commands found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

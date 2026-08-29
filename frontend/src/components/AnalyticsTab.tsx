'use client';

import React from 'react';
import styles from '../app/page.module.css';

interface AnalyticsTabProps {
  stats: any;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ stats }) => {
  // Simulated Knowledge Graph Nodes
  const nodes = [
    { id: '1', label: 'Algorithms', status: 'mastered', x: 20, y: 20 },
    { id: '2', label: 'System Design', status: 'mastered', x: 50, y: 10 },
    { id: '3', label: 'Microservices', status: 'learning', x: 80, y: 30 },
    { id: '4', label: 'Vector Math', status: 'weak', x: 30, y: 60 },
    { id: '5', label: 'RAG Pipelines', status: 'learning', x: 70, y: 70 },
    { id: '6', label: 'Data Structures', status: 'mastered', x: 10, y: 80 },
  ];

  // Edges connecting the nodes
  const edges = [
    { from: '1', to: '2' },
    { from: '2', to: '3' },
    { from: '1', to: '4' },
    { from: '2', to: '5' },
    { from: '4', to: '5' },
    { from: '1', to: '6' },
  ];

  const getColor = (status: string) => {
    switch (status) {
      case 'mastered': return '#ffffff'; // Stark white
      case 'weak': return '#444444'; // Dark grey
      default: return '#888888'; // Mid grey
    }
  };

  return (
    <div style={{ marginTop: '4rem' }}>
      <div className={styles.bentoHeader} style={{ marginBottom: '1.5rem' }}>
        <span>VISUAL KNOWLEDGE GRAPH</span>
      </div>

      <div className={styles.glassCard} style={{ padding: 0, height: '600px', position: 'relative', overflow: 'hidden' }}>
        
        {/* Graph Legend */}
        <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 10, background: 'rgba(0,0,0,0.6)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>NODE STATUS</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '8px', height: '8px', borderRadius: '0', background: '#ffffff' }}/> Mastered (&gt;90%)</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '8px', height: '8px', borderRadius: '0', background: '#888888' }}/> In Progress</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '8px', height: '8px', borderRadius: '0', background: '#444444' }}/> Weak Area (Requires Review)</span>
          </div>
        </div>

        {/* SVG Edges */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
          {edges.map((edge, idx) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;
            return (
              <line 
                key={idx}
                x1={`${fromNode.x}%`} 
                y1={`${fromNode.y}%`} 
                x2={`${toNode.x}%`} 
                y2={`${toNode.y}%`} 
                stroke="var(--border-light)" 
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            );
          })}
        </svg>

        {/* HTML Nodes */}
        {nodes.map(node => (
          <div 
            key={node.id} 
            style={{ 
              position: 'absolute', 
              top: `${node.y}%`, 
              left: `${node.x}%`, 
              transform: 'translate(-50%, -50%)',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }}
          >
            <div 
              style={{
                width: node.status === 'weak' ? '24px' : '20px',
                height: node.status === 'weak' ? '24px' : '20px',
                borderRadius: '0', // Square nodes
                background: getColor(node.status),
                boxShadow: `0 0 10px ${getColor(node.status)}40`,
                border: '1px solid var(--border-light)',
                transition: 'all 0.3s ease'
              }}
            />
            <span style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.75rem', 
              color: node.status === 'mastered' ? '#000' : 'var(--text-secondary)',
              background: node.status === 'mastered' ? '#fff' : 'var(--bg-secondary)',
              padding: '0.2rem 0.5rem',
              borderRadius: '0',
              border: `1px solid var(--border-light)`
            }}>
              {node.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

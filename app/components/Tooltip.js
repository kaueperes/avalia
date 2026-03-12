'use client';
import { useState } from 'react';

export default function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 4 }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: 'var(--border)',
          color: 'var(--text-muted)',
          fontSize: 9,
          fontWeight: 700,
          cursor: 'default',
          flexShrink: 0,
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        i
      </span>
      {visible && (
        <span
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: 0,
            background: '#1e1e2e',
            color: '#fff',
            fontSize: 12,
            fontWeight: 400,
            textTransform: 'none',
            letterSpacing: 'normal',
            padding: '8px 14px',
            borderRadius: 7,
            width: 280,
            whiteSpace: 'pre-wrap',
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            zIndex: 9999,
            pointerEvents: 'none',
            lineHeight: 1.5,
          }}
        >
          {text}
          <span
            style={{
              position: 'absolute',
              top: '100%',
              left: 14,
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid #1e1e2e',
            }}
          />
        </span>
      )}
    </span>
  );
}

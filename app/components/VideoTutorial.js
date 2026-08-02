'use client';
import { useState } from 'react';
import { TUTORIALS } from '@/lib/tutorials';

const IconPlay = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
);

function VideoModal({ videoId, title, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', borderRadius: 16, width: '100%', maxWidth: 720, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-sub)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4, flexShrink: 0 }}>✕</button>
        </div>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
            title={title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

// ── Link compacto — usado no topo das páginas de ferramenta ──────────────────
export function VideoTutorialLink({ slug }) {
  const [open, setOpen] = useState(false);
  const t = TUTORIALS[slug];
  if (!t) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 14, padding: '6px 12px 6px 6px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-content)', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        <span style={{ position: 'relative', width: 56, height: 34, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#0a0c18' }}>
          <img src={`https://i.ytimg.com/vi/${t.videoId}/mqdefault.jpg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <span style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <IconPlay size={14} />
          </span>
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
          Ver tutorial <span style={{ fontWeight: 400, color: 'var(--text-sub)' }}>({t.duration})</span>
        </span>
      </button>
      {open && <VideoModal videoId={t.videoId} title={t.title} onClose={() => setOpen(false)} />}
    </>
  );
}

// ── Card de galeria — usado na central de ajuda ───────────────────────────────
export function VideoTutorialCard({ slug }) {
  const [open, setOpen] = useState(false);
  const t = TUTORIALS[slug];
  if (!t) return null;

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 12, borderRadius: 14, border: '1px solid var(--border, #E5E7EB)', background: 'var(--bg-card, #fff)', cursor: 'pointer', transition: 'border-color .15s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#0081f0'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border, #E5E7EB)'}
      >
        <span style={{ position: 'relative', width: 120, height: 72, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#0a0c18' }}>
          <img src={`https://i.ytimg.com/vi/${t.videoId}/mqdefault.jpg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <span style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <IconPlay size={22} />
          </span>
          <span style={{ position: 'absolute', right: 5, bottom: 5, background: 'rgba(0,0,0,0.75)', color: 'white', fontSize: 10, fontWeight: 600, padding: '1px 5px', borderRadius: 3 }}>{t.duration}</span>
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#0081f0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Tutorial em vídeo</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main, #111827)', lineHeight: 1.35 }}>{t.title}</div>
        </div>
      </div>
      {open && <VideoModal videoId={t.videoId} title={t.title} onClose={() => setOpen(false)} />}
    </>
  );
}

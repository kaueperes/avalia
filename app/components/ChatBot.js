'use client';

import { useState, useRef, useEffect } from 'react';

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const ChatIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/>
    <path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

export default function ChatBot({ darkMode }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const [botName, setBotName] = useState(() => ['Murilo', 'Luca'][Math.floor(Math.random() * 2)]);
  const [welcome, setWelcome] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) setUserName(u.name.split(' ')[0]);
      }
    } catch {}

    fetch('/api/chatbot-config')
      .then(r => r.json())
      .then(data => {
        setEnabled(data.enabled ?? true);
        if (data.name) setBotName(data.name); // só sobrescreve se tiver nome configurado
        if (data.welcome) setWelcome(data.welcome);
      })
      .catch(() => {});
  }, []);

  const bg      = darkMode ? '#1a1e28' : '#ffffff';
  const bgHeader= darkMode ? '#0f1117' : '#f3f4f6';
  const border  = darkMode ? '#252a38' : '#e5e7eb';
  const textMain= darkMode ? '#F1F5F9' : '#111827';
  const textMuted=darkMode ? '#8B95A8' : '#6B7280';
  const bgUser  = 'linear-gradient(135deg, #0081f0, #810cfa)';
  const bgBot   = darkMode ? '#252a38' : '#f3f4f6';
  const bgInput = darkMode ? '#13161c' : '#f9fafb';

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, ocorreu um erro. Tente novamente.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro de conexão. Tente novamente.' }]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  if (!enabled) return null;

  return (
    <>
      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 88, right: 24, zIndex: 999,
          width: 360, height: 500,
          background: bg, border: `1px solid ${border}`,
          borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            background: bgHeader, borderBottom: `1px solid ${border}`,
            padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #0081f0, #810cfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white',
              }}>
                <ChatIcon />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: textMain }}>{botName} · AvaliA</div>
                <div style={{ fontSize: 11, color: textMuted }}>Assistente virtual</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  title="Limpar conversa"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted, padding: '4px 6px', borderRadius: 6, display: 'flex' }}
                  onMouseEnter={e => e.currentTarget.style.color = textMain}
                  onMouseLeave={e => e.currentTarget.style.color = textMuted}
                >
                  <TrashIcon />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted, padding: '4px 6px', borderRadius: 6, display: 'flex' }}
                onMouseEnter={e => e.currentTarget.style.color = textMain}
                onMouseLeave={e => e.currentTarget.style.color = textMuted}
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>👋</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: textMain, marginBottom: 6 }}>
                  {userName ? `Olá, ${userName}!` : 'Olá!'}
                </div>
                <div style={{ fontSize: 13, color: textMuted, lineHeight: 1.5 }}>
                  {(welcome || `Eu sou o {nome}, assistente do AvaliA. O que deseja perguntar?`).replace('{nome}', botName)}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%', padding: '9px 13px', borderRadius: 12,
                  fontSize: 13, lineHeight: 1.55, whiteSpace: 'pre-wrap',
                  background: msg.role === 'user' ? bgUser : bgBot,
                  color: msg.role === 'user' ? 'white' : textMain,
                  borderBottomRightRadius: msg.role === 'user' ? 4 : 12,
                  borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 12,
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '9px 13px', borderRadius: 12, borderBottomLeftRadius: 4, background: bgBot, display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: textMuted,
                      animation: 'bounce 1.2s infinite',
                      animationDelay: `${i * 0.2}s`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: `1px solid ${border}`, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Escreva sua dúvida..."
              rows={1}
              style={{
                flex: 1, resize: 'none', border: `1px solid ${border}`,
                borderRadius: 10, padding: '8px 12px', fontSize: 13,
                background: bgInput, color: textMain, outline: 'none',
                fontFamily: 'inherit', lineHeight: 1.5, maxHeight: 100, overflowY: 'auto',
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: !input.trim() || loading ? (darkMode ? '#252a38' : '#e5e7eb') : 'linear-gradient(135deg, #0081f0, #810cfa)',
                color: !input.trim() || loading ? textMuted : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'background .15s',
              }}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        title={`${botName} · Assistente AvaliA`}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #0081f0, #810cfa)',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,129,240,0.4)',
          transition: 'transform .15s, box-shadow .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,129,240,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,129,240,0.4)'; }}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}

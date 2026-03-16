'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/AppLayout';
import { DEFAULT_BOT_NAME, DEFAULT_WELCOME, DEFAULT_MODEL, DEFAULT_SYSTEM_PROMPT, MODELS } from '@/lib/chatbot';

export default function AdminChatbotPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [enabled, setEnabled] = useState(true);
  const [name, setName] = useState(DEFAULT_BOT_NAME);
  const [welcome, setWelcome] = useState(DEFAULT_WELCOME);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);

  function token() { return localStorage.getItem('token'); }

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (!u.is_admin) { router.push('/inicio'); return; }
      if (u.name) setUserName(u.name);
    } catch { router.push('/inicio'); return; }

    fetch('/api/admin/chatbot', { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => {
        setEnabled(data.enabled ?? true);
        setName(data.name || DEFAULT_BOT_NAME);
        setWelcome(data.welcome || DEFAULT_WELCOME);
        setModel(data.model || DEFAULT_MODEL);
        setSystemPrompt(data.systemPrompt || DEFAULT_SYSTEM_PROMPT);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  async function save() {
    setSaving(true);
    await fetch('/api/admin/chatbot', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled, name, welcome, model, systemPrompt }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function resetPrompt() {
    if (!confirm('Restaurar o prompt padrão?')) return;
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
  }

  const inpStyle = {
    padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 9,
    fontSize: 13, outline: 'none', background: 'var(--bg-card)',
    color: 'var(--text-main)', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
  };

  const labelStyle = { fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6, display: 'block' };
  const subStyle = { fontSize: 12, color: 'var(--text-muted)', marginTop: 4 };

  return (
    <AppLayout userName={userName}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Painel Administrativo</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Configurar Chatbot</h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>Ajuste o comportamento e identidade do assistente virtual.</p>
        </div>
        <button
          onClick={() => router.push('/admin')}
          style={{ padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 9, background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', fontFamily: 'inherit' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-content)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          ← Voltar
        </button>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 14 }}>Carregando...</div>}

      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 760 }}>

          {/* Habilitado */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>Chatbot ativo</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Quando desabilitado, o botão do chat some para todos os usuários.</p>
              </div>
              <div
                onClick={() => setEnabled(e => !e)}
                style={{ width: 44, height: 24, borderRadius: 12, background: enabled ? '#0081f0' : '#D1D5DB', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background .2s' }}
              >
                <div style={{ position: 'absolute', top: 3, left: enabled ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </div>
            </div>
          </div>

          {/* Identidade */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: -4 }}>Identidade</p>

            <div>
              <label style={labelStyle}>Nome do assistente</label>
              <input style={inpStyle} value={name} onChange={e => setName(e.target.value)} placeholder={DEFAULT_BOT_NAME} />
              <p style={subStyle}>Aparece no cabeçalho do chat e na mensagem de boas-vindas.</p>
            </div>

            <div>
              <label style={labelStyle}>Mensagem de boas-vindas</label>
              <input style={inpStyle} value={welcome} onChange={e => setWelcome(e.target.value)} placeholder={DEFAULT_WELCOME} />
              <p style={subStyle}>Texto exibido quando o usuário abre o chat pela primeira vez.</p>
            </div>
          </div>

          {/* Modelo */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: '20px 24px' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 16 }}>Modelo de IA</p>
            <select style={inpStyle} value={model} onChange={e => setModel(e.target.value)}>
              {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <p style={{ ...subStyle, marginTop: 8 }}>Haiku é mais rápido e econômico. Sonnet é mais inteligente mas custa mais por mensagem.</p>
          </div>

          {/* Prompt do sistema */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>Prompt do sistema</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Instrui a IA sobre como se comportar. Alterações afetam todas as conversas novas.</p>
              </div>
              <button
                onClick={resetPrompt}
                style={{ padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 7, background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-content)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                Restaurar padrão
              </button>
            </div>
            <textarea
              style={{ ...inpStyle, minHeight: 320, resize: 'vertical', lineHeight: 1.6 }}
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
            />
            <p style={{ ...subStyle, marginTop: 8 }}>{systemPrompt.length} caracteres</p>
          </div>

          {/* Salvar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            {saved && <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600, alignSelf: 'center' }}>Salvo!</span>}
            <button
              onClick={save}
              disabled={saving}
              style={{ padding: '11px 32px', background: 'linear-gradient(135deg, #0081f0, #810cfa)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'inherit' }}
            >
              {saving ? 'Salvando...' : 'Salvar configurações'}
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

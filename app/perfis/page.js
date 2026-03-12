'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TONES } from '@/lib/types';
import AppLayout from '../components/AppLayout';
import Tooltip from '../components/Tooltip';

const BLANK = { name: '', discipline: '', turma: '', tone: 'neutro', teachingLevel: '', writingSample: '', institutionLogo: '' };

const TEACHING_LEVELS = [
  { value: 'fundamental', label: '📚 Fundamental' },
  { value: 'medio',       label: '🎓 Médio' },
  { value: 'superior',    label: '🏛️ Superior' },
];

const Field = ({ label, hint, tooltip, children }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
      {tooltip ? <Tooltip text={tooltip}>{label}</Tooltip> : label}
      {hint && <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-sub)' }}> {hint}</span>}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: '1px solid var(--border)', borderRadius: 10,
  fontSize: 14, outline: 'none',
  background: 'var(--bg-content)', color: 'var(--text-main)',
  fontFamily: 'inherit', boxSizing: 'border-box',
  transition: 'border-color .15s',
};

export default function PerfisPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Professor');
  const [profiles, setProfiles] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', ok: true });

  function token() { return localStorage.getItem('token'); }

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    try { const u = JSON.parse(localStorage.getItem('user') || '{}'); if (u.name) setUserName(u.name); } catch {}
    load();
  }, [router]);

  async function load() {
    const r = await fetch('/api/profiles', { headers: { Authorization: `Bearer ${token()}` } });
    if (r.ok) setProfiles(await r.json());
  }

  async function save() {
    if (!form.name || !form.discipline) { setMsg({ text: 'Nome e disciplina são obrigatórios', ok: false }); return; }
    setLoading(true);
    try {
      const url = editingId ? `/api/profiles/${editingId}` : '/api/profiles';
      const method = editingId ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (r.ok) {
        setMsg({ text: editingId ? 'Perfil atualizado!' : 'Perfil criado!', ok: true });
        setForm(BLANK); setEditingId(null); load();
      } else {
        const d = await r.json(); setMsg({ text: d.error || 'Erro ao salvar', ok: false });
      }
    } finally { setLoading(false); setTimeout(() => setMsg({ text: '', ok: true }), 3000); }
  }

  async function del(id) {
    if (!confirm('Deletar este perfil?')) return;
    await fetch(`/api/profiles/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    load();
  }

  function startEdit(p) {
    setForm({ name: p.name, discipline: p.discipline, turma: p.turma || '', tone: p.tone || 'neutro', teachingLevel: p.teachingLevel || '', writingSample: p.writingSample || '', institutionLogo: p.institutionLogo || '' });
    setEditingId(p.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() { setForm(BLANK); setEditingId(null); }

  return (
    <AppLayout userName={userName}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Configurações</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Perfil do Professor</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>Configure seus perfis por disciplina para avaliações personalizadas.</p>
      </div>

      {/* Mensagem */}
      {msg.text && (
        <div style={{
          background: msg.ok ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${msg.ok ? '#10B98133' : '#EF444433'}`,
          color: msg.ok ? '#10B981' : '#EF4444',
          borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 14, fontWeight: 500,
        }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: profiles.length > 0 ? '1fr 1.2fr' : '1fr', gap: 24, alignItems: 'start', minWidth: 0, overflow: 'hidden' }}>

        {/* Lista de perfis */}
        {profiles.length > 0 && (
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>Perfis criados</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {profiles.map(p => (
                <div key={p.id} style={{
                  background: 'var(--bg-card)', border: `1px solid ${editingId === p.id ? '#0081f0' : 'var(--border-card)'}`,
                  borderRadius: 12, padding: '16px 20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', overflow: 'hidden' }}>
                    <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.discipline}{p.turma ? ` · ${p.turma}` : ''} · {TONES.find(t => t.id === p.tone)?.label || p.tone}{p.teachingLevel ? ` · ${TEACHING_LEVELS.find(l => l.value === p.teachingLevel)?.label}` : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 12 }}>
                      <button
                        onClick={() => startEdit(p)}
                        style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'var(--bg-content)', color: 'var(--text-main)' }}>
                        Editar
                      </button>
                      <button
                        onClick={() => del(p.id)}
                        style={{ padding: '5px 12px', border: '1px solid #EF444433', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: '#EF4444' }}>
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulário */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', padding: '28px 28px' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 24 }}>
            {editingId ? 'Editar perfil' : 'Novo perfil'}
          </h2>

          <div className="form-grid">
            <Field label="Nome do Professor *" tooltip="Seu nome completo. Aparece como assinatura nos relatórios e PDFs gerados.">
              <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Prof. Dr. Fulano" />
            </Field>
            <Field label="Disciplina *" tooltip="Matéria que você leciona. Ex: Design Gráfico, Animação 3D. Aparece nos relatórios.">
              <input style={inputStyle} value={form.discipline} onChange={e => setForm(f => ({ ...f, discipline: e.target.value }))} placeholder="Design Gráfico" />
            </Field>
          </div>

          <div className="form-grid">
            <Field label="Turma" hint="(opcional)" tooltip="Identificação da turma. Útil para criar perfis diferentes por semestre ou turno.">
              <input style={inputStyle} value={form.turma} onChange={e => setForm(f => ({ ...f, turma: e.target.value }))} placeholder="Turma B" />
            </Field>
            <Field label="Tom de feedback" tooltip="Define o estilo do texto da IA nos feedbacks — do mais técnico e direto ao mais encorajador e didático.">
              <select style={inputStyle} value={form.tone} onChange={e => setForm(f => ({ ...f, tone: e.target.value }))}>
                {TONES.map(t => <option key={t.id} value={t.id}>{t.label} — {t.desc}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Nível de ensino" hint="(opcional)" tooltip="Informa à IA o nível dos alunos para adaptar o tom e a complexidade do feedback.">
            <div style={{ display: 'flex', gap: 8 }}>
              {TEACHING_LEVELS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, teachingLevel: f.teachingLevel === value ? '' : value }))}
                  style={{
                    flex: 1, padding: '9px 10px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', border: '1.5px solid',
                    borderColor: form.teachingLevel === value ? '#0081f0' : 'var(--border)',
                    background: form.teachingLevel === value ? 'rgba(0,129,240,0.08)' : 'var(--bg-content)',
                    color: form.teachingLevel === value ? '#0081f0' : 'var(--text-muted)',
                    transition: 'all .15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>

          <div className="form-grid">
            <Field label="Amostra de escrita" hint="(opcional)" tooltip="Cole um trecho do seu jeito de escrever feedback. A IA vai imitar seu estilo e vocabulário.">
              <textarea
                style={{ ...inputStyle, minHeight: 120, resize: 'vertical', lineHeight: 1.6 }}
                value={form.writingSample}
                onChange={e => setForm(f => ({ ...f, writingSample: e.target.value }))}
                placeholder="Cole aqui um trecho de feedback que você mesmo escreveria a um aluno. A IA vai imitar seu estilo."
              />
              <p style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 6, fontStyle: 'italic' }}>
                Ex: "O trabalho demonstra domínio técnico, mas a topologia precisa de atenção especial..."
              </p>
            </Field>

            <Field label="Logo da Instituição" hint="(opcional — para PDF timbrado)" tooltip="Imagem que aparece no topo dos PDFs gerados. Aceita .png, .jpg ou .svg.">
            <div
              onClick={() => document.getElementById('logo-upload').click()}
              style={{
                border: '2px dashed var(--border)', borderRadius: 10, padding: '20px 16px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                cursor: 'pointer', background: 'var(--bg-content)',
                transition: 'border-color .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#0081f0'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {form.institutionLogo ? (
                <>
                  <img src={form.institutionLogo} alt="Logo" style={{ maxHeight: 60, maxWidth: '100%', objectFit: 'contain' }} />
                  <p style={{ fontSize: 12, color: 'var(--text-sub)', margin: 0 }}>Clique para trocar</p>
                </>
              ) : (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-sub)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p style={{ fontSize: 13, color: 'var(--text-sub)', margin: 0 }}>Clique para enviar .png, .jpg ou .svg</p>
                </>
              )}
            </div>
            <input
              id="logo-upload"
              type="file"
              accept=".png,.jpg,.jpeg,.svg"
              style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => setForm(f => ({ ...f, institutionLogo: ev.target.result }));
                reader.readAsDataURL(file);
              }}
            />
            {form.institutionLogo && (
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, institutionLogo: '' }))}
                style={{ marginTop: 8, fontSize: 12, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Remover logo
              </button>
            )}
          </Field>

          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              onClick={save} disabled={loading}
              style={{ padding: '11px 24px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Criar perfil'}
            </button>
            {editingId && (
              <button
                onClick={cancelEdit}
                style={{ padding: '11px 20px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)' }}>
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

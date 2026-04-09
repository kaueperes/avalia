'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../components/AppLayout';

const TEACHING_LEVELS = [
  { value: 'fundamental', label: 'Fundamental' },
  { value: 'medio',       label: 'Médio' },
  { value: 'superior',    label: 'Superior' },
  { value: 'tecnico',     label: 'Técnico' },
  { value: 'outro',       label: 'Outro' },
];

const BLANK = { name: '', logoUrl: '', educationLevel: '' };

const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: '1px solid var(--border-input)', borderRadius: 10,
  fontSize: 14, outline: 'none',
  background: 'var(--bg-card)', color: 'var(--text-main)',
  fontFamily: 'inherit', boxSizing: 'border-box',
  transition: 'border-color .15s',
};

const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
      {label}
      {hint && <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-sub)' }}> {hint}</span>}
    </label>
    {children}
  </div>
);

export default function InstituicaoPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Professor');
  const [institutions, setInstitutions] = useState([]);
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
    const r = await fetch('/api/institutions', { headers: { Authorization: `Bearer ${token()}` } });
    if (r.ok) setInstitutions(await r.json());
  }

  async function save() {
    if (!form.name) { setMsg({ text: 'Nome da instituição é obrigatório', ok: false }); return; }
    setLoading(true);
    try {
      const url = editingId ? `/api/institutions/${editingId}` : '/api/institutions';
      const method = editingId ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (r.ok) {
        setMsg({ text: editingId ? 'Instituição atualizada!' : 'Instituição criada!', ok: true });
        setForm(BLANK); setEditingId(null); load();
      } else {
        const d = await r.json(); setMsg({ text: d.error || 'Erro ao salvar', ok: false });
      }
    } finally { setLoading(false); setTimeout(() => setMsg({ text: '', ok: true }), 3000); }
  }

  async function del(id) {
    if (!confirm('Excluir esta instituição? As disciplinas e turmas vinculadas perderão o vínculo.')) return;
    await fetch(`/api/institutions/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    load();
  }

  function startEdit(inst) {
    setForm({ name: inst.name, logoUrl: inst.logoUrl || '', educationLevel: inst.educationLevel || '' });
    setEditingId(inst.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() { setForm(BLANK); setEditingId(null); }

  return (
    <AppLayout userName={userName}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Cadastro</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Cadastro de Instituição</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>Cadastre sua escola ou faculdade para vincular turmas e gerar relatórios com identidade visual.</p>
      </div>

      {msg.text && (
        <div style={{ background: msg.ok ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${msg.ok ? '#10B98133' : '#EF444433'}`, color: msg.ok ? '#10B981' : '#EF4444', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 14, fontWeight: 500 }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: institutions.length > 0 ? '1fr 1.2fr' : '1fr', gap: 24, alignItems: 'start' }}>

        {/* Lista */}
        {institutions.length > 0 && (
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>Instituições cadastradas</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {institutions.map(inst => (
                <div key={inst.id} style={{ background: 'var(--bg-card)', border: `1px solid ${editingId === inst.id ? '#0081f0' : 'var(--border-card)'}`, borderRadius: 12, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                      {inst.logoUrl && (
                        <img src={inst.logoUrl} alt="Logo" style={{ height: 36, width: 36, objectFit: 'contain', borderRadius: 6, flexShrink: 0 }} />
                      )}
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inst.name}</p>
                        {inst.educationLevel && (
                          <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>{TEACHING_LEVELS.find(l => l.value === inst.educationLevel)?.label || inst.educationLevel}</p>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 12 }}>
                      <button onClick={() => startEdit(inst)} style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'var(--bg-content)', color: 'var(--text-main)' }}>Editar</button>
                      <button onClick={() => del(inst.id)} style={{ padding: '5px 9px', border: '1px solid #EF444433', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: 'transparent', color: '#EF4444', display: 'flex', alignItems: 'center' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulário */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>
            {editingId ? 'Editar instituição' : 'Nova instituição'}
          </h2>
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', padding: '28px 28px' }}>

          <Field label="Nome da Instituição *">
            <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Colégio Estadual, FAAP, USP..." />
          </Field>

          <Field label="Nível de Ensino" hint="(opcional)">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TEACHING_LEVELS.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => setForm(f => ({ ...f, educationLevel: f.educationLevel === value ? '' : value }))}
                  style={{ padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1.5px solid', borderColor: form.educationLevel === value ? '#0081f0' : 'var(--border)', background: form.educationLevel === value ? 'rgba(0,129,240,0.08)' : 'var(--bg-content)', color: form.educationLevel === value ? '#0081f0' : 'var(--text-muted)', transition: 'all .15s' }}>
                  {label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Logo da Instituição" hint="(opcional — aparece nos PDFs gerados)">
            <div onClick={() => document.getElementById('logo-upload').click()}
              style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', background: 'var(--bg-content)', transition: 'border-color .15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#0081f0'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {form.logoUrl ? (
                <>
                  <img src={form.logoUrl} alt="Logo" style={{ maxHeight: 60, maxWidth: '100%', objectFit: 'contain' }} />
                  <p style={{ fontSize: 12, color: 'var(--text-sub)', margin: 0 }}>Clique para trocar</p>
                </>
              ) : (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-sub)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <p style={{ fontSize: 13, color: 'var(--text-sub)', margin: 0 }}>Clique para enviar .png, .jpg ou .svg</p>
                </>
              )}
            </div>
            <input id="logo-upload" type="file" accept=".png,.jpg,.jpeg,.svg" style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => setForm(f => ({ ...f, logoUrl: ev.target.result }));
                reader.readAsDataURL(file);
              }}
            />
            {form.logoUrl && (
              <button type="button" onClick={() => setForm(f => ({ ...f, logoUrl: '' }))}
                style={{ marginTop: 8, fontSize: 12, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Remover logo
              </button>
            )}
          </Field>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button onClick={save} disabled={loading}
              style={{ padding: '11px 24px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Criar instituição'}
            </button>
            {editingId && (
              <button onClick={cancelEdit}
                style={{ padding: '11px 20px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)' }}>
                Cancelar
              </button>
            )}
          </div>
        </div>
        </div>
      </div>
    </AppLayout>
  );
}

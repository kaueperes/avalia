'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../components/AppLayout';

const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: '1px solid var(--border-input)', borderRadius: 10,
  fontSize: 14, outline: 'none',
  background: 'var(--bg-card)', color: 'var(--text-main)',
  fontFamily: 'inherit', boxSizing: 'border-box',
};

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

export default function TurmasPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Professor');
  const [institutions, setInstitutions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [studentsByClass, setStudentsByClass] = useState({});
  const [expandedClass, setExpandedClass] = useState(null);

  // Form turma
  const [formClass, setFormClass] = useState({ name: '', institutionId: '' });
  const [editingClassId, setEditingClassId] = useState(null);
  const [loadingClass, setLoadingClass] = useState(false);

  // Adicionar alunos
  const [importText, setImportText] = useState('');
  const [loadingImport, setLoadingImport] = useState(false);

  // Editar / selecionar alunos
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editingStudentName, setEditingStudentName] = useState('');
  const [selectedStudents, setSelectedStudents] = useState(new Set());

  const [msg, setMsg] = useState({ text: '', ok: true });

  function token() { return localStorage.getItem('token'); }
  function flash(text, ok = true) { setMsg({ text, ok }); setTimeout(() => setMsg({ text: '', ok: true }), 3000); }

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    try { const u = JSON.parse(localStorage.getItem('user') || '{}'); if (u.name) setUserName(u.name); } catch {}
    loadAll();
  }, [router]);

  async function loadAll() {
    const [rInst, rClasses] = await Promise.all([
      fetch('/api/institutions', { headers: { Authorization: `Bearer ${token()}` } }),
      fetch('/api/classes', { headers: { Authorization: `Bearer ${token()}` } }),
    ]);
    if (rInst.ok) setInstitutions(await rInst.json());
    if (rClasses.ok) setClasses(await rClasses.json());
  }

  async function loadStudents(classId) {
    const r = await fetch(`/api/students?classId=${classId}`, { headers: { Authorization: `Bearer ${token()}` } });
    if (r.ok) {
      const data = await r.json();
      setStudentsByClass(prev => ({ ...prev, [classId]: data }));
    }
  }

  async function toggleExpand(classId) {
    if (expandedClass === classId) {
      setExpandedClass(null);
      setSelectedStudents(new Set());
      setEditingStudentId(null);
      return;
    }
    setExpandedClass(classId);
    setSelectedStudents(new Set());
    setEditingStudentId(null);
    if (!studentsByClass[classId]) await loadStudents(classId);
  }

  async function saveClass() {
    if (!formClass.name) { flash('Nome da turma é obrigatório', false); return; }
    setLoadingClass(true);
    try {
      const url = editingClassId ? `/api/classes/${editingClassId}` : '/api/classes';
      const method = editingClassId ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' }, body: JSON.stringify(formClass) });
      if (r.ok) {
        flash(editingClassId ? 'Turma atualizada!' : 'Turma criada!');
        setFormClass({ name: '', institutionId: '' }); setEditingClassId(null);
        await loadAll();
      } else {
        const d = await r.json(); flash(d.error || 'Erro ao salvar', false);
      }
    } finally { setLoadingClass(false); }
  }

  async function deleteClass(id) {
    if (!confirm('Excluir esta turma? Os alunos vinculados também serão excluídos.')) return;
    await fetch(`/api/classes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    if (expandedClass === id) setExpandedClass(null);
    await loadAll();
    flash('Turma excluída');
  }

  function startEditClass(cls) {
    setFormClass({ name: cls.name, institutionId: cls.institutionId || '' });
    setEditingClassId(cls.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function updateStudent(classId) {
    if (!editingStudentName.trim()) return;
    await fetch(`/api/students/${editingStudentId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingStudentName.trim() }),
    });
    setEditingStudentId(null);
    setEditingStudentName('');
    await loadStudents(classId);
  }

  async function deleteStudent(studentId, name, classId) {
    if (!confirm(`Excluir "${name}"?`)) return;
    await fetch(`/api/students/${studentId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setSelectedStudents(prev => { const next = new Set(prev); next.delete(studentId); return next; });
    await loadStudents(classId);
  }

  async function deleteSelectedStudents(classId) {
    const count = selectedStudents.size;
    if (!confirm(`Excluir ${count} aluno${count !== 1 ? 's' : ''} selecionado${count !== 1 ? 's' : ''}?`)) return;
    for (const id of selectedStudents) {
      await fetch(`/api/students/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    }
    setSelectedStudents(new Set());
    await loadStudents(classId);
    flash(`${count} aluno${count !== 1 ? 's' : ''} excluído${count !== 1 ? 's' : ''}!`);
  }

  function toggleSelect(studentId) {
    setSelectedStudents(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId); else next.add(studentId);
      return next;
    });
  }

  function parseNames(text) {
    return text
      .split(/[\n;,]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  async function importStudents(classId) {
    const names = parseNames(importText);
    if (names.length === 0) return;
    setLoadingImport(true);
    try {
      for (const name of names) {
        await fetch('/api/students', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, classId }),
        });
      }
      flash(`${names.length} aluno${names.length !== 1 ? 's' : ''} adicionado${names.length !== 1 ? 's' : ''}!`);
      setImportText('');
      await loadStudents(classId);
    } finally { setLoadingImport(false); }
  }

  return (
    <AppLayout userName={userName}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Cadastro</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Cadastro de Turmas</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>Cadastre suas turmas e adicione os alunos para gerar relatórios individuais e de turma.</p>
      </div>

      {msg.text && (
        <div style={{ background: msg.ok ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${msg.ok ? '#10B98133' : '#EF444433'}`, color: msg.ok ? '#10B981' : '#EF4444', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 14, fontWeight: 500 }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: classes.length > 0 ? '1.4fr 1fr' : '1fr', gap: 24, alignItems: 'start' }}>

        {/* Lista de turmas */}
        {classes.length > 0 && (
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>Turmas cadastradas</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {classes.map(cls => {
                const instName = institutions.find(i => i.id === cls.institutionId)?.name;
                const isExpanded = expandedClass === cls.id;
                const students = studentsByClass[cls.id] || [];

                return (
                  <div key={cls.id} style={{ background: 'var(--bg-card)', border: `1px solid ${editingClassId === cls.id ? '#0081f0' : 'var(--border-card)'}`, borderRadius: 12, overflow: 'hidden' }}>
                    {/* Cabeçalho da turma */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cls.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                          {instName ? `${instName} · ` : ''}{studentsByClass[cls.id] ? `${students.length} aluno${students.length !== 1 ? 's' : ''}` : 'Clique para ver alunos'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 12 }}>
                        <button onClick={() => toggleExpand(cls.id)}
                          style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: isExpanded ? 'rgba(0,129,240,0.08)' : 'var(--bg-content)', color: isExpanded ? '#0081f0' : 'var(--text-main)', borderColor: isExpanded ? '#0081f0' : 'var(--border)' }}>
                          {isExpanded ? 'Fechar' : 'Alunos'}
                        </button>
                        <button onClick={() => startEditClass(cls)}
                          style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'var(--bg-content)', color: 'var(--text-main)' }}>
                          Editar
                        </button>
                        <button onClick={() => deleteClass(cls.id)}
                          style={{ padding: '5px 9px', border: '1px solid #EF444433', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: 'transparent', color: '#EF4444', display: 'flex', alignItems: 'center' }}>
                          <TrashIcon />
                        </button>
                      </div>
                    </div>

                    {/* Painel de alunos */}
                    {isExpanded && (
                      <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px', background: 'var(--bg-content)' }}>
                        {/* Lista de alunos */}
                        {students.length > 0 ? (
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, padding: '0 10px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>
                                <input type="checkbox"
                                  checked={students.length > 0 && selectedStudents.size === students.length}
                                  onChange={e => setSelectedStudents(e.target.checked ? new Set(students.map(s => s.id)) : new Set())}
                                  style={{ cursor: 'pointer', accentColor: '#0081f0' }}
                                />
                                Selecionar todos
                              </label>
                              {selectedStudents.size > 0 && (
                                <button onClick={() => deleteSelectedStudents(cls.id)}
                                  style={{ padding: '4px 12px', border: '1px solid #EF444433', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: '#EF4444' }}>
                                  Excluir selecionados ({selectedStudents.size})
                                </button>
                              )}
                            </div>
                            {students.map((s, idx) => (
                              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8, background: idx % 2 === 0 ? 'var(--bg-card)' : 'transparent' }}>
                                <input type="checkbox"
                                  checked={selectedStudents.has(s.id)}
                                  onChange={() => toggleSelect(s.id)}
                                  style={{ cursor: 'pointer', flexShrink: 0, accentColor: '#0081f0' }}
                                />
                                {editingStudentId === s.id ? (
                                  <>
                                    <input
                                      style={{ ...inputStyle, flex: 1, padding: '4px 8px', fontSize: 13 }}
                                      value={editingStudentName}
                                      onChange={e => setEditingStudentName(e.target.value)}
                                      onKeyDown={e => e.key === 'Enter' && updateStudent(cls.id)}
                                      autoFocus
                                    />
                                    <button onClick={() => updateStudent(cls.id)}
                                      style={{ padding: '4px 10px', background: '#0081f0', color: 'white', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                                      Salvar
                                    </button>
                                    <button onClick={() => { setEditingStudentId(null); setEditingStudentName(''); }}
                                      style={{ padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)', flexShrink: 0 }}>
                                      Cancelar
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <span style={{ fontSize: 14, color: 'var(--text-main)', flex: 1 }}>{s.name}</span>
                                    <button onClick={() => { setEditingStudentId(s.id); setEditingStudentName(s.name); }}
                                      style={{ padding: '3px 9px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)', flexShrink: 0 }}>
                                      Editar
                                    </button>
                                    <button onClick={() => deleteStudent(s.id, s.name, cls.id)}
                                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', padding: '2px 4px', borderRadius: 4, flexShrink: 0 }}
                                      onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-sub)'}>
                                      <TrashIcon />
                                    </button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 12, fontStyle: 'italic' }}>Nenhum aluno cadastrado ainda.</p>
                        )}

                        {/* Adicionar alunos */}
                        <p style={{ fontSize: 12, color: 'var(--text-sub)', marginBottom: 6 }}>
                          Cole os nomes — um por linha, ou separados por vírgula/ponto-e-vírgula. Também aceita colunas copiadas de planilha.
                        </p>
                        <textarea
                          style={{ ...inputStyle, minHeight: 110, resize: 'vertical', fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}
                          value={importText}
                          onChange={e => setImportText(e.target.value)}
                          placeholder={"João Silva\nMaria Oliveira\nPedro Santos"}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => importStudents(cls.id)} disabled={loadingImport || !importText.trim()}
                            style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: loadingImport ? 'wait' : 'pointer', opacity: !importText.trim() ? 0.5 : 1 }}>
                            {loadingImport ? 'Adicionando...' : `Adicionar${parseNames(importText).length > 0 ? ` (${parseNames(importText).length})` : ''}`}
                          </button>
                          <button onClick={() => setImportText('')}
                            style={{ padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 9, fontSize: 13, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)' }}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Formulário de turma */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>
            {editingClassId ? 'Editar turma' : 'Nova turma'}
          </h2>
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', padding: '28px 28px' }}>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>Nome da Turma *</label>
            <input style={inputStyle} value={formClass.name} onChange={e => setFormClass(f => ({ ...f, name: e.target.value }))} placeholder="Ex: 3º Ano B, Turma Manhã, 2025.1..." />
          </div>

          {institutions.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Instituição <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-sub)' }}>(opcional)</span>
              </label>
              <select style={inputStyle} value={formClass.institutionId} onChange={e => setFormClass(f => ({ ...f, institutionId: e.target.value }))}>
                <option value="">Sem vínculo</option>
                {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
          )}

          <div style={{ padding: '12px 14px', background: 'var(--bg-content)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Após criar a turma, clique em <strong>Alunos</strong> para adicionar os alunos à turma.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={saveClass} disabled={loadingClass}
              style={{ padding: '11px 24px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loadingClass ? 'not-allowed' : 'pointer', opacity: loadingClass ? 0.6 : 1 }}>
              {loadingClass ? 'Salvando...' : editingClassId ? 'Salvar alterações' : 'Criar turma'}
            </button>
            {editingClassId && (
              <button onClick={() => { setFormClass({ name: '', institutionId: '' }); setEditingClassId(null); }}
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

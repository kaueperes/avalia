-- ── Instituição e turma compartilhadas pela organização (Fase 4) ───────────
-- Mesmo padrão da Fase 2 (disciplinas): NULL = pessoal, preenchido = da
-- instituição, gerenciado pelo admin, visível (leitura) por todos os
-- professores da org.
--
-- students não ganha coluna própria — herda o escopo via students.class_id
-- → classes.org_id (uma turma da org já implica que os alunos dela são "da org").

ALTER TABLE institutions ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organizations(id);
ALTER TABLE classes ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organizations(id);

CREATE INDEX IF NOT EXISTS institutions_org_idx ON institutions(org_id);
CREATE INDEX IF NOT EXISTS classes_org_idx ON classes(org_id);

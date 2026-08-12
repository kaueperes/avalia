-- ── Equipes (cursos) e coordenadores ─────────────────────────────────────────
-- Um professor pode estar em várias equipes ao mesmo tempo (a mesma disciplina
-- dada em cursos diferentes), por isso é muitos-pra-muitos via org_team_members,
-- não uma coluna team_id direto em users.
--
-- coordinator_id não é um papel fixo da pessoa (org_role continua só admin/member)
-- — é "ser dono de uma equipe específica". A mesma pessoa pode coordenar uma
-- equipe e só dar aula (sem coordenar) em outra.

CREATE TABLE IF NOT EXISTS org_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  coordinator_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- discipline_id aponta pra disciplina COMPARTILHADA da Fase 2 — vincula
-- "professor X dá a disciplina Y dentro desta equipe". RESTRICT em vez de
-- CASCADE: admin não consegue excluir uma disciplina ainda em uso numa equipe,
-- evita perder o vínculo sem avisar.
CREATE TABLE IF NOT EXISTS org_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES org_teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  discipline_id uuid NOT NULL REFERENCES disciplines(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id, discipline_id)
);

CREATE INDEX IF NOT EXISTS org_teams_org_idx ON org_teams(org_id);
CREATE INDEX IF NOT EXISTS org_team_members_team_idx ON org_team_members(team_id);
CREATE INDEX IF NOT EXISTS org_team_members_user_idx ON org_team_members(user_id);

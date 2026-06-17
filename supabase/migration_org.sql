-- ── Organizações ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  quota_pool integer NOT NULL DEFAULT 0,
  quota_used integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ── Convites ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS org_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  role text NOT NULL DEFAULT 'member',
  status text NOT NULL DEFAULT 'pending',
  invited_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz
);

CREATE INDEX IF NOT EXISTS org_invites_token_idx ON org_invites(token);
CREATE INDEX IF NOT EXISTS org_invites_email_idx ON org_invites(email, status);
CREATE INDEX IF NOT EXISTS org_invites_org_idx ON org_invites(org_id, status);

-- ── Colunas novas em users (todas nullable — usuários existentes não são afetados) ──
ALTER TABLE users ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organizations(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS org_role text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS org_joined_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS org_quota_limit integer;
ALTER TABLE users ADD COLUMN IF NOT EXISTS org_quota_used integer DEFAULT 0;

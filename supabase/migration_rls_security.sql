-- ── RLS: resolve os 10 avisos CRITICAL do Supabase Advisor ─────────────────
-- Habilita Row Level Security nas tabelas que estavam sem nenhuma proteção.
-- Sem policies criadas = acesso negado por padrão para as roles "anon" e
-- "authenticated" (as que a API REST pública do Supabase usa).
--
-- O app (lib/supabase.js) só acessa o banco via SUPABASE_SERVICE_KEY, cuja role
-- (service_role) tem BYPASSRLS por padrão no Supabase — ou seja, nenhuma rota
-- existente é afetada por esta migration. É seguro rodar em produção.
--
-- Também resolve o aviso "Sensitive Columns Exposed" em org_invites: sem RLS,
-- a coluna `token` (usada para aceitar convite em /convite) podia ser lida por
-- qualquer um com a anon key. Com RLS habilitado e sem policy pública, ela deixa
-- de ser acessível fora do backend.

ALTER TABLE evaluation_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_invites       ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplines       ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE students          ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports           ENABLE ROW LEVEL SECURITY;

-- ── GraphQL: resolve os 26 avisos "Public/Signed-In Users Can See Object in
-- GraphQL Schema" ────────────────────────────────────────────────────────────
-- Habilitar RLS bloqueia leitura de linhas, mas não remove o GRANT de tabela
-- que o Supabase concede por padrão para "anon"/"authenticated" na criação da
-- tabela — e é esse GRANT que o pg_graphql usa pra decidir o que expor no
-- schema GraphQL, independente de RLS. Revogar o GRANT dessas roles resolve os
-- warnings e não afeta o app, que só acessa via service_role e não usa GraphQL
-- em nenhum lugar do código.
--
-- Inclui evaluations, exercises, profiles e users: essas 4 já tinham RLS com
-- policies antes desta limpeza, mas ainda apareciam no schema GraphQL pelo
-- mesmo motivo de GRANT.

REVOKE ALL ON TABLE public.classes           FROM anon, authenticated;
REVOKE ALL ON TABLE public.disciplines       FROM anon, authenticated;
REVOKE ALL ON TABLE public.evaluation_drafts FROM anon, authenticated;
REVOKE ALL ON TABLE public.evaluations       FROM anon, authenticated;
REVOKE ALL ON TABLE public.exercises         FROM anon, authenticated;
REVOKE ALL ON TABLE public.institutions      FROM anon, authenticated;
REVOKE ALL ON TABLE public.org_invites       FROM anon, authenticated;
REVOKE ALL ON TABLE public.organizations     FROM anon, authenticated;
REVOKE ALL ON TABLE public.profiles          FROM anon, authenticated;
REVOKE ALL ON TABLE public.reports           FROM anon, authenticated;
REVOKE ALL ON TABLE public.settings          FROM anon, authenticated;
REVOKE ALL ON TABLE public.students          FROM anon, authenticated;
REVOKE ALL ON TABLE public.users             FROM anon, authenticated;

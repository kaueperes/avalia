-- ── Cobrança institucional recorrente via Stripe ────────────────────────────
-- Hoje `organizations.quota_pool`/`quota_used` são só números manuais, sem
-- nenhum vínculo com Stripe e sem reset automático. Isso adiciona:
--   1) Vínculo com uma assinatura Stripe (criada manualmente por contrato
--      negociado — não passa pelo checkout do app, é preço customizado por
--      instituição).
--   2) Cota extra que NUNCA reseta (comprada avulsa, fora do contrato),
--      espelhando o par quota_ciclo/quota_extra que já existe pra usuário
--      individual.
--   3) O mesmo esquema (contratado + usado + extra) para relatórios, que
--      hoje não existe pra organização nenhuma.
--
-- `quota_pool` e `quota_relatorios_pool` passam a representar o valor
-- CONTRATADO — o que a assinatura reseta `quota_used`/`quota_relatorios_used`
-- de volta a cada renovação (ver app/api/stripe/webhook/route.js).

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS quota_pool_extra integer NOT NULL DEFAULT 0;

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS quota_relatorios_pool integer NOT NULL DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS quota_relatorios_used integer NOT NULL DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS quota_relatorios_pool_extra integer NOT NULL DEFAULT 0;

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

CREATE INDEX IF NOT EXISTS organizations_stripe_subscription_idx ON organizations(stripe_subscription_id);

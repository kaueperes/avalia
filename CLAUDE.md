# KriterIA — Guia para o Claude Code

SaaS educacional brasileiro para professores avaliarem trabalhos de alunos com IA.
- **Produção:** https://www.avalia.education
- **Repositório:** https://github.com/kaueperes/avalia
- **Deploy:** Vercel (auto-deploy ao push em `main`)

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Banco de dados | Supabase (PostgreSQL) |
| Auth | JWT customizado — `lib/auth.js` |
| IA principal | Claude API (Anthropic) |
| IA para vídeo/áudio | Google Gemini 2.0 Flash |
| Pagamentos | Stripe (assinaturas + avulsos) |
| Deploy | Vercel |

---

## Rodar localmente

```bash
cd "c:\Users\kauep\Desktop\Kaue\AvaliA"
npm run dev
# Abre em http://localhost:3000
```

Variáveis de ambiente necessárias (configuradas no Vercel):
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `SUPABASE_URL` + `SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`
- `JWT_SECRET`

---

## Arquitetura de roteamento de IA

Esta é a decisão mais importante do sistema. Cada avaliação é roteada para a IA mais adequada:

```
Texto / código           → Claude Haiku (simples) ou Sonnet (complexo)
Imagem(ns)               → Claude Sonnet (visão)
Vídeo (mp4, mov...)      → Gemini 2.0 Flash
Áudio puro (mp3, wav...) → Gemini 2.0 Flash  ← foi bug até março/2026, áudio caía no Claude
Vídeo + imagens juntos   → Gemini (vídeo) + Claude não mistura; Gemini processa tudo
```

A lógica fica em `app/api/evaluate/route.js`:
```js
const hasVideoOrAudio = images?.some(img =>
  img.mediaType?.startsWith('video/') || img.mediaType?.startsWith('audio/')
);
// hasVideoOrAudio → Gemini; caso contrário → Claude
```

**Por que não Whisper?** Whisper só transcreve fala — perde entonação, ritmo e dicção. Para locução, apresentação oral, etc., o Gemini ouve o áudio e avalia diretamente. Qualidade superior.

**Por que não ElevenLabs?** Não agrega à qualidade da avaliação. Poderia ser um botão "ouvir feedback" no futuro, mas não é prioridade.

**Seleção de modelo Claude** (`selectModel` em `route.js`):
- Complexidade calculada por: tamanho do trabalho, nº de critérios, se tem amostra de escrita, contexto longo, tons exigentes
- Complexidade ≥ 4 → Sonnet; abaixo → Haiku

---

## Sistema de cotas

Cada avaliação gerada consome 1 cota, independente da IA usada (Claude ou Gemini).

**Tabela `users` no Supabase:**
- `quota_ciclo` — renova mensalmente via webhook Stripe
- `quota_extra` — compradas avulsas, **nunca expiram**, acumulam
- `quota_relatorios_ciclo` — relatórios de turma, renova mensalmente
- `quota_relatorios_extra` — relatórios extras, nunca expiram

**Regra de consumo:** sempre consome `quota_ciclo` primeiro; só usa `quota_extra` quando ciclo chega a zero.

**Bloqueio:** só bloqueia quando AMBAS (ciclo e extra) são zero ou nulas.

---

## Planos (`lib/types.js` → `PLANS`)

| Plano | Preço | Avaliações | Relatórios | Chatbot |
|---|---|---|---|---|
| Gratuito | R$ 0 | 5/mês | — | — |
| Essencial | R$ 29 | 120/mês | — | 50 msg |
| Pro | R$ 59 | 300/mês | 10/mês | 150 msg |
| Premium | R$ 119 | 600/mês | 30/mês | 300 msg |

**Addons one-time (Stripe):**
- `extra_50`: 50 avaliações — R$15
- `extra_100`: 100 avaliações — R$25
- `extra_rel_5`: 5 relatórios — R$19
- `extra_rel_10`: 10 relatórios — R$35

---

## Tipos de trabalho (`lib/types.js` → `TYPES`)

60+ tipos organizados em 11 categorias (`CATEGORIES`). Cada tipo tem:
- `cat`: categoria pai
- `input`: `'text'` | `'img'` | `'imgs'` | `'video'` | `'obj'`
- `hint`: instrução exibida ao professor
- `criteria`: critérios padrão com pesos

**Tipos `input: 'video'` aceitam também áudio** (mp3, wav, m4a) — a UI aceita `video/*,audio/*` e o backend roteia ambos para Gemini.

**TCC/Monografia:** aceita até 15 arquivos extras. Para ABNT, professor deve enviar páginas-chave como imagem; para conteúdo, cola texto ou envia .docx (processado via mammoth.js no cliente).

---

## API Routes (`app/api/`)

| Rota | Função |
|---|---|
| `evaluate/` | Avaliação principal (Claude ou Gemini) |
| `chat/` | Chatbot Luca (Claude Haiku por padrão) |
| `analyze-class/` | Relatório de turma com IA |
| `analyze-student/` | Relatório individual de aluno |
| `auth/` | Login, signup, refresh JWT |
| `exercises/` | CRUD de exercícios |
| `profiles/` | CRUD de perfis de professor |
| `evaluations/` | Histórico de avaliações |
| `reports/` | Histórico de relatórios |
| `me/` | Dados do usuário logado |
| `stripe/` | Checkout, webhook, portal |
| `admin/` | Painel administrativo (restrito) |
| `chatbot-config/` | Configurações do chatbot (admin) |
| `onboarding/` | Fluxo de primeiro acesso |

---

## Chatbot Luca (`lib/chatbot.js`)

- Assistente virtual da plataforma, disponível no Essencial em diante
- Model padrão: `claude-haiku-4-5-20251001` (configurável via admin)
- System prompt: `DEFAULT_SYSTEM_PROMPT` em `lib/chatbot.js`
- Configurações (nome, prompt, model, on/off) ficam na tabela `settings` do Supabase
- **Proibições absolutas no prompt:** nunca avaliar trabalhos de alunos, nunca dar gabaritos

---

## Stripe — fluxo de pagamento

1. Usuário escolhe plano → `api/stripe/checkout` cria sessão
2. Pagamento confirmado → webhook `api/stripe/webhook` atualiza `users.plan` e `quota_ciclo`
3. Renovação mensal → webhook `invoice.paid` renova `quota_ciclo`
4. Cancelamento → webhook `customer.subscription.deleted` volta para gratuito
5. Addons (one-time) → webhook `checkout.session.completed` incrementa `quota_extra` ou `quota_relatorios_extra`

---

## Estrutura de páginas públicas

Páginas sem autenticação (landing + suporte):
- `/` — landing page (app/page.js)
- `/central-de-ajuda` — FAQ e guia de uso
- `/contato` — formulário via Formspree (`FORMSPREE_ID = 'xqeyqlly'`)
- `/privacidade` — política de privacidade
- `/termos` — termos de uso

Todas têm o mesmo navbar com 5 links: Funcionalidades · Tipos de Trabalho · Para Coordenadores · Planos · Ajuda

---

## Decisões que já foram tomadas — não questionar

- **JWT customizado** em vez de NextAuth: mais controle sobre o payload e sem dependência extra
- **Gemini para vídeo/áudio** em vez de processar tudo no Claude: Claude não processa vídeo; Gemini tem tier gratuito generoso
- **mammoth.js no cliente** para .docx: extrai texto sem precisar de servidor; sem custo de storage
- **Sem Whisper:** qualidade inferior ao Gemini para avaliação de fala (perde prosódia)
- **Sem ElevenLabs:** não agrega à qualidade de avaliação; TTS é feature cosmética
- **Grid de 2 colunas** nos botões de tipo de trabalho (era 3): labels longas quebravam linha ao ficar em negrito
- **Sidebar vertical** para categorias (era horizontal): 11 categorias não cabiam em tabs horizontais

---

## Padrões de código

- Ícones: Lucide SVG inline (sem biblioteca externa)
- Estilos: inline styles com variáveis CSS (`var(--border)`, `var(--bg-card)`, etc.) no app autenticado; inline styles puros nas páginas públicas
- Componentes compartilhados: `app/components/` (AppLayout, Tooltip, useAuthGuard...)
- Sem TypeScript — projeto em JavaScript puro
- Sem testes automatizados atualmente

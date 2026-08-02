# KriterIA — Guia para o Claude Code

SaaS educacional brasileiro para professores avaliarem trabalhos de alunos com IA.
- **Produção:** https://www.kriteria.education
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
| IA para vídeo/áudio/avaliação primária | Google Gemini (cascata 2.5-flash → 2.5-flash-lite → 3.5-flash) |
| Pagamentos | Stripe (assinaturas + avulsos) |
| Email transacional | Resend (`noreply@kriteria.education`) |
| Email de suporte | Hostinger Titan (`contato@kriteria.education`) |
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
- `JWT_SECRET` — `lib/auth.js` lança erro no boot se não estiver definida (sem fallback inseguro)
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL` — usada para montar links absolutos (redefinição de senha, convites, portal Stripe)

---

## Arquitetura de roteamento de IA

Gemini primeiro, Claude como fallback. Gemini tem tier gratuito generoso e suporta todos os tipos de mídia — evita dependência de um único provedor.

```
Qualquer avaliação       → Gemini (cascata: 2.5-flash → 2.5-flash-lite → 3.5-flash)
Se todos os Gemini falharem → Claude Sonnet (imagens) ou Haiku/Sonnet (texto)
```

A lógica fica em `app/api/evaluate/route.js` (mesmo padrão em `evaluate-basica/`, `evaluate-test/` e `generate-exam/`):
```js
try {
  parsed = await callGemini(prompt, images);
} catch {
  parsed = await callClaude(prompt, images, modelConfig);
}
```

**Modelos 1.x e 2.0 do Gemini foram descontinuados pelo Google** — por isso a cascata começa em 2.5-flash. Cada modelo recebe 2 tentativas antes de cascatear pro próximo, tanto em erro 503 (sobrecarga) quanto 404 (modelo descontinuado).

**Por que não Whisper?** Whisper só transcreve fala — perde entonação, ritmo e dicção. Para locução, apresentação oral, etc., o Gemini ouve o áudio e avalia diretamente. Qualidade superior.

**Por que não ElevenLabs?** Não agrega à qualidade da avaliação. Poderia ser um botão "ouvir feedback" no futuro, mas não é prioridade.

**Seleção de modelo Claude** (`selectModel` em `route.js`):
- Complexidade calculada por: tamanho do trabalho, nº de critérios, se tem amostra de escrita, contexto longo, tons exigentes
- Complexidade ≥ 4 → Sonnet; abaixo → Haiku

---

## Sistema de cotas

Cada avaliação gerada (Avançada ou Básica) consome 1 cota, independente da IA usada (Claude ou Gemini). Gerador de Provas e Modo Teste têm cotas próprias, independentes da cota de avaliações.

**Tabela `users` no Supabase:**
- `quota_ciclo` — avaliações do ciclo do plano, renova mensalmente via webhook Stripe
- `quota_extra` — avaliações compradas avulsas, **nunca expiram**, acumulam
- `quota_relatorios_ciclo` — relatórios de turma/aluno, renova mensalmente
- `quota_relatorios_extra` — relatórios extras, nunca expiram
- `quota_provas` + `quota_provas_reset_date` — Gerador de Provas, 10/mês fixo pra todo plano pago (nenhuma no Gratuito), reset mensal *lazy* (verificado a cada request em `generate-exam/route.js`, não depende só do webhook Stripe)
- `quota_testes` + `quota_testes_reset_date` — Modo Teste, 10/mês pra todos os planos (inclusive Gratuito), mesmo padrão de reset lazy em `evaluate-test/route.js`
- `chatbot_msgs_used` + `chatbot_msgs_reset_date` — mensagens do chatbot no mês, mesmo padrão de reset lazy, checado em `api/chat/route.js` contra `plan.limits.chatbot` (50/150/300 conforme o plano)

**Regra de consumo (avaliações e relatórios):** sempre consome a cota do ciclo primeiro; só usa a extra quando o ciclo chega a zero.

**Bloqueio:** só bloqueia quando AMBAS (ciclo e extra) são zero ou nulas. Organizações institucionais têm uma camada extra de bloqueio: pool de cota da organização (`organizations.quota_pool`/`quota_used`) e, opcionalmente, um limite individual por professor (`users.org_quota_limit`/`org_quota_used`).

---

## Planos (`lib/types.js` → `PLANS`)

| Plano | Preço | Avaliações | Relatórios | Chatbot | Gerador de Provas |
|---|---|---|---|---|---|
| Gratuito | R$ 0 | 5/mês | — | — | — |
| Essencial | R$ 29 | 120/mês | — | 50 msg | 10/mês |
| Pro | R$ 59 | 180/mês | 10/mês | 150 msg | 10/mês |
| Premium | R$ 119 | 240/mês | 30/mês | 300 msg | 10/mês |

A **Nova Avaliação Básica** não tem cota própria — usa a mesma cota de avaliações do plano (`quota_ciclo`/`quota_extra`), disponível inclusive no Gratuito.

**Addons one-time (Stripe):**
- `extra_50`: 50 avaliações — R$15
- `extra_100`: 100 avaliações — R$25
- `extra_rel_5`: 5 relatórios — R$19
- `extra_rel_10`: 10 relatórios — R$35

**Quais campos de `PLANS[x].features` são realmente checados no backend** (antes de adicionar um novo, confirme se vale a pena aplicar de verdade — vários já foram só texto de marketing por um tempo):
- `chatbot` (on/off) → `api/chat/route.js`; `limits.chatbot` (nº de mensagens) → idem, aplicado com contador real
- `relatorioAluno`/`relatorioTurma` → `api/analyze-student/` e `api/analyze-class/`
- `exportCSV` → checado no frontend em `app/avaliacoes/page.js` antes de habilitar o botão (não há chamada de API pra exportar, é só formatação local — por isso a checagem é só client-side)
- `limits.perfis` → `api/profiles/route.js`; `limits.exercicios` → `api/exercises/route.js`
- **`avaliacaoLote` não é mais tratado como diferencial de plano** — múltiplos alunos de uma vez nunca foi de fato restrito, e a Avaliação Básica já oferece isso pra todo mundo por decisão de produto. A UI mostra "Avaliação Individual e em Lote" igual em todos os planos, sem checagem de plano nenhuma
- **`filtrosAvancados` não existe em lugar nenhum da interface** — é só um campo de dados sem função nenhuma associada. Não construir a partir dele sem antes decidir se vale investir na feature de verdade

---

## Tipos de trabalho (`lib/types.js` → `TYPES`)

60+ tipos organizados em 11 categorias (`CATEGORIES`). Cada tipo tem:
- `cat`: categoria pai
- `input`: `'text'` | `'img'` | `'imgs'` | `'video'` | `'obj'`
- `hint`: instrução exibida ao professor
- `criteria`: critérios padrão com pesos

**Tipos `input: 'video'` aceitam também áudio** (mp3, wav, m4a) — a UI aceita `video/*,audio/*` e o backend roteia ambos para Gemini.

**TCC/Monografia:** aceita até 15 arquivos extras. Para ABNT, professor deve enviar páginas-chave como imagem; para conteúdo, cola texto ou envia .docx (processado via mammoth.js no cliente).

Esses tipos e critérios valem só para a **Nova Avaliação Avançada**. A **Nova Avaliação Básica** não usa `TYPES`/critérios — é uma correção livre por foto ou texto, com prompt próprio focado em certo/errado por questão.

---

## Novas Avaliações: Básica vs. Avançada

Duas entradas separadas no menu, ambas consumindo a mesma cota de avaliações:

**Nova Avaliação Básica** (`/avaliar-basica`, API `evaluate-basica/`)
- Sem cadastro prévio: sem exercício, sem critérios, sem turma/aluno cadastrado
- Suporta vários alunos de uma vez (slots), cada um com nome opcional + foto/texto
- Contexto/gabarito opcional, em texto e/ou foto (rotulado "Gabarito/Referência do professor" pra IA não confundir com a prova do aluno)
- Resultado por questão: `certo` | `errado` | `incerto` — a IA resolve questões objetivas sozinha, mas marca `incerto` quando a resposta depende do que foi ensinado em aula e não há gabarito fornecido
- **Não salva nada** — sem histórico, sem PDF. Pensada pra o professor ler na tela e escrever direto na prova física

**Nova Avaliação Avançada** (`/avaliar-avancado`, API `evaluate/`)
- Fluxo completo: perfil de professor, disciplina/exercício com critérios com pesos, tom de feedback, upload de arquivos, gabarito de referência com peso ajustável
- Salva histórico (`evaluations`), gera PDF, alimenta relatórios de turma/aluno

---

## Gerador de Provas (`/gerador-provas`, API `generate-exam/`)

Gera o **texto** de uma prova (matéria, tema, nível, quantidade e tipo de questão, com gabarito opcional ao final) pra o professor copiar e colar — sem layout, sem PDF, sem exportação.

Disponível a partir do plano Essencial (bloqueado no Gratuito, checado por `plan` no backend). Cota fixa de 10/mês pra todo plano pago (não escalona por plano) — decisão consciente pra evitar abuso (ex: um professor gerando provas pra vários colegas) sem precisar diferenciar por tier.

---

## Modo Teste (`evaluate-test/`, lightbox em `/disciplinas`)

Permite testar critérios/prompt antes de usar em avaliações reais, sem consumir a cota de avaliações e sem salvar no histórico de avaliações (fica em `evaluation_drafts`). Cota própria: `quota_testes`, 10/mês, disponível em todos os planos inclusive o Gratuito.

---

## Organizações institucionais (`api/org/`, páginas `/org/*`)

Plano institucional para coordenadores administrarem uma equipe de professores com cota compartilhada:
- `organizations.quota_pool`/`quota_used` — pool de cota compartilhado entre todos os professores da organização
- `users.org_id`/`org_role`/`org_quota_limit`/`org_quota_used` — vínculo do professor à organização, papel (admin/membro) e limite individual opcional dentro do pool
- Convite por email via Resend (`api/org/invites/`), aceito em `/convite`
- Painel da Instituição (`/org/dashboard`), gestão de professores (`/org/professores`) e avaliações da instituição (`/org/avaliacoes`) — visíveis no menu só para `org_role === 'admin'`

---

## API Routes (`app/api/`)

| Rota | Função |
|---|---|
| `evaluate/` | Avaliação Avançada (Claude ou Gemini) |
| `evaluate-basica/` | Correção rápida sem cadastro, mesma cota de `evaluate/`, sem persistência |
| `evaluate-test/` | Modo Teste — cota própria, sem consumir cota de avaliação |
| `generate-exam/` | Gerador de Provas — cota própria, só planos pagos |
| `generate-criteria/` | Sugere critérios de avaliação via IA para um exercício |
| `chat/` | Chatbot Luca (Claude Haiku por padrão) |
| `analyze-class/` | Relatório de turma com IA |
| `analyze-student/` | Relatório individual de aluno |
| `auth/` | Login, signup, refresh JWT, esqueci/redefinir senha |
| `institutions/` | CRUD de instituições (nome + logo) |
| `disciplines/` | CRUD de disciplinas |
| `exercises/` | CRUD de exercícios |
| `classes/` | CRUD de turmas |
| `students/` | CRUD de alunos |
| `profiles/` | CRUD de perfis de professor |
| `evaluations/` | Histórico de avaliações (Avançada) |
| `reports/` | Histórico de relatórios |
| `me/` | Dados do usuário logado |
| `contact/` | Formulário público `/contato`, envia via Resend para `contato@kriteria.education` |
| `storage/` + `upload-gemini/` | Upload de arquivo: Supabase Storage → Gemini Files API (contorna limite de 4,5MB do Vercel) |
| `stripe/` | Checkout, webhook, portal |
| `org/` | Organizações institucionais: convites, membros, dashboard |
| `admin/` | Painel administrativo (restrito, `is_admin` reconfirmado no backend) |
| `chatbot-config/` | Configurações do chatbot (admin) |
| `onboarding/` | Fluxo de primeiro acesso |

---

## Chatbot Luca (`lib/chatbot.js`)

- Assistente virtual da plataforma, disponível no Essencial em diante
- Model padrão: `claude-haiku-4-5-20251001` (configurável via admin)
- System prompt: `DEFAULT_SYSTEM_PROMPT` em `lib/chatbot.js` — documenta o menu completo, Avaliação Básica/Avançada, Gerador de Provas, Modo Teste, organizações institucionais, planos e cotas
- Configurações (nome, prompt, model, on/off) ficam na tabela `settings` do Supabase — se alteradas pelo admin, sobrescrevem os defaults do código pra sempre (não recebem atualizações futuras do `DEFAULT_SYSTEM_PROMPT` automaticamente). Botão "Restaurar padrão" em `/admin/chatbot` resolve isso quando o prompt salvo ficar desatualizado
- **Proibições absolutas no prompt:** nunca avaliar trabalhos de alunos, nunca dar gabaritos
- Limite de mensagens/mês por plano (50/150/300) é aplicado de verdade via `chatbot_msgs_used` — antes só existia como número no marketing, sem checagem nenhuma
- **`api/chatbot-config/route.js` precisa de `export const dynamic = 'force-dynamic'`** — sem isso o Next.js gera a rota como estática no build (ela não lê nada do `request`), e mudanças salvas no admin ficam "congeladas" até o próximo deploy. Já corrigido, mas cuidado ao mexer nessa rota de novo

---

## Stripe — fluxo de pagamento

1. Usuário escolhe plano → `api/stripe/checkout` cria sessão
2. Pagamento confirmado → webhook `checkout.session.completed` atualiza `users.plan`, `quota_ciclo`, `quota_relatorios_ciclo`, `quota_provas` e zera `chatbot_msgs_used`
3. Renovação mensal → webhook `invoice.payment_succeeded` (só em `billing_reason === 'subscription_cycle'`) renova `quota_ciclo`, `quota_relatorios_ciclo`, `quota_testes`, `quota_provas` e `chatbot_msgs_used`
4. Cancelamento → webhook `customer.subscription.deleted` volta para gratuito (zera `quota_provas` também)
5. Addons (one-time) → webhook `checkout.session.completed` incrementa `quota_extra` ou `quota_relatorios_extra`

---

## Estrutura de páginas públicas

Páginas sem autenticação (landing + suporte):
- `/` — landing page (app/page.js). Se já houver token válido no `localStorage`, redireciona automaticamente para `/inicio` (ou `/onboarding`)
- `/login` — mesmo redirecionamento automático se já houver sessão válida
- `/central-de-ajuda` — FAQ e guia de uso
- `/contato` — formulário envia via Resend (`api/contact`) para `contato@kriteria.education`
- `/privacidade` — política de privacidade
- `/termos` — termos de uso

Todas têm o mesmo navbar com 5 links: Funcionalidades · Tipos de Trabalho · Para Coordenadores · Planos · Ajuda

**Cuidado ao criar/editar página pública:** nenhuma delas pode usar `useAuthGuard()` (hook de `app/components/useAuthGuard.js`) — ele redireciona pra `/login` se não houver token, o que já aconteceu por engano em `/central-de-ajuda` (corrigido). Esse hook é só pra páginas dentro do app autenticado.

---

## Domínio e email

- Domínio de produção: `kriteria.education` (migrado de `avalia.education`, que hoje só existe como **redirect permanente 308** para `www.kriteria.education` — configurado no Vercel, não no código)
- Email transacional (cadastro, redefinição de senha, convite de organização, formulário de contato): Resend, remetente `noreply@kriteria.education` — domínio verificado no Resend via DKIM (`resend._domainkey`) e SPF/MX no subdomínio `send.kriteria.education`, sem conflito com os registros de email da Hostinger
- Email de suporte real (recebe respostas e o formulário de contato): `contato@kriteria.education`, hospedado na Hostinger (Titan Email) — MX, DKIM e SPF próprios da Hostinger no domínio raiz, sem tocar nos registros do Resend

---

## Decisões que já foram tomadas — não questionar

- **JWT customizado** em vez de NextAuth: mais controle sobre o payload e sem dependência extra. Sem fallback de secret hardcoded — o app falha no boot se `JWT_SECRET` não estiver definida, em vez de aceitar silenciosamente um segredo público
- **Gemini para vídeo/áudio** em vez de processar tudo no Claude: Claude não processa vídeo; Gemini tem tier gratuito generoso
- **mammoth.js no cliente** para .docx: extrai texto sem precisar de servidor; sem custo de storage
- **Sem Whisper:** qualidade inferior ao Gemini para avaliação de fala (perde prosódia)
- **Sem ElevenLabs:** não agrega à qualidade de avaliação; TTS é feature cosmética
- **Grid de 2 colunas** nos botões de tipo de trabalho (era 3): labels longas quebravam linha ao ficar em negrito
- **Sidebar vertical** para categorias (era horizontal): 11 categorias não cabiam em tabs horizontais
- **Avaliação Básica não persiste dados** (sem histórico, sem PDF): mantém o modo simples de verdade; se precisar de histórico/PDF, o professor usa a Avançada
- **Avaliação Básica dentro dos planos existentes** (sem plano novo mais barato): evita canibalizar o Essencial; os dois modos consomem a mesma cota
- **Gerador de Provas com cota fixa (10/mês) igual para todo plano pago**, em vez de escalonar por tier: resolve o receio de abuso (gerar provas pra terceiros) sem precisar diferenciar plano
- **Menu ordenado por frequência de uso**: ações do dia a dia (Avaliação Básica/Avançada, Gerador de Provas) ficam acima dos cadastros (Perfil, Instituição, Disciplinas, Turmas), que são configuração feita uma vez
- **Formspree removido do `/contato`** em favor de envio direto via Resend: só fazia sentido enquanto a plataforma não tinha domínio de email próprio
- **Portfólio pessoal removido do repositório**: não fazia parte do produto, ficava em `/portfolio` só por conveniência de deploy
- **`/avaliar`, `/dashboard` e `/painel` removidos**: versões antigas do fluxo de avaliação e do painel, de antes da reestruturação pra `/inicio` e `/avaliar-avancado`. Não estavam mais em nenhum menu, só acessíveis por link direto — vários pontos do código (email de boas-vindas, botões de "primeira avaliação") ainda apontavam pra `/avaliar` por engano antes da correção
- **Copy pública nunca cita "IA"/"inteligência artificial"** (home, meta description, títulos de botão): muitos professores ainda têm resistência a ferramentas de IA. Sempre "o Kriteria corrige/avalia/sugere", nunca a tecnologia como sujeito da frase
- **Home reforça que o Kriteria não substitui o professor** ("o Kriteria sugere, você decide"): é honesto sobre a experiência real de quem já testou (parte das correções precisa de ajuste manual) e funciona como argumento de confiança pra quem é cético com IA
- **Limites de plano só valem a pena se forem de fato aplicados**: cota de chatbot, exportação CSV e "filtros avançados" ficaram um tempo existindo só como texto de marketing sem checagem no backend — ver seção Planos acima pra saber o que já foi corrigido

---

## Padrões de código

- Ícones: Lucide SVG inline (sem biblioteca externa)
- Estilos: inline styles com variáveis CSS (`var(--border)`, `var(--bg-card)`, etc.) no app autenticado; inline styles puros nas páginas públicas
- Componentes compartilhados: `app/components/` (AppLayout, Tooltip, useAuthGuard...)
- Sem TypeScript — projeto em JavaScript puro
- Sem testes automatizados atualmente
- HTML gerado dinamicamente (PDFs via `document.write`, emails) deve sempre escapar valores de usuário/IA (`esc()`/`_esc()`) antes de interpolar — evita XSS que poderia expor o token JWT do `localStorage`

---

## Pendências (retomar na próxima sessão)

- **Nova cota de avaliações decidida e validada, falta só aplicar no código:** conversa com a irmã do Kaué (professora) confirmou 300 avaliações/mês como número ideal pro Essencial. Estudo de custo/margem validou que é sustentável com os modelos econômicos atuais (Gemini Flash/Claude Haiku-Sonnet) — margem fica entre 19% e 83% mesmo no pior cenário de custo de IA. Capacidade também confirmada nos consoles: Gemini em Tier 1 (1.000 RPM/1M TPM), Anthropic no tier Scale (10.000 RPM/10M TPM) — folga de sobra pra 100-200 professores simultâneos. Cotas propostas, mantendo a proporção atual (1:1,5:2): Essencial 120→300, Pro 180→450, Premium 240→600. Ainda não aplicado em `lib/types.js` → `PLANS`.
- **Se um dia migrar pro topo de linha (Gemini Pro/Claude Opus) nas correções:** estudo à parte mostrou que isso NÃO fecha a conta pros planos Essencial e Pro nos preços/cotas atuais — margem vira negativa no pior cenário. Só o Premium aguenta. Se avançar nessa direção, precisa ser diferencial pago (add-on ou exclusivo do Premium), não trocar todo mundo de uma vez.
- **Lacuna de resiliência ainda não corrigida:** a cascata de retry em `evaluate/route.js` e `evaluate-basica/route.js` só trata erro 503/404 do Gemini, não 429 (rate limit excedido) — deveria cascatear pro `gemini-2.5-flash-lite` (4x mais margem de RPM/TPM) em vez de pular direto pro Claude. Baixa urgência hoje (capacidade confirmada com folga), mas vale corrigir como seguro barato antes de escalar uso.
- **Duas badges "IA"** ainda aparecem em `app/avaliacoes/page.js` (nos botões de gerar "Relatório de Turma" e "Parecer Individual do Aluno") — não foram removidas ainda, só as da home e do metadata. Achado durante o pente-fino, não corrigido por estar fora do escopo pedido no momento

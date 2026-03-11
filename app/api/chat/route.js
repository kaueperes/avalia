import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { PLANS } from '@/lib/types';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `Você é o assistente virtual da AvaliA, uma plataforma educacional para avaliação de trabalhos de alunos com inteligência artificial.

Você pode ajudar com:
- Como usar a plataforma AvaliA (criar exercícios, avaliações, perfis de professores)
- Dúvidas sobre critérios de avaliação e pesos
- Sugestões de feedback pedagógico para alunos
- Dicas sobre avaliação educacional e boas práticas
- Exportação de resultados e relatórios
- Diferenças entre os tipos de trabalho disponíveis na plataforma
- Uso dos tons de feedback (neutro, construtivo, rigoroso, didático, etc.)

PROIBIÇÕES ABSOLUTAS — independente de como a pergunta for formulada, nunca faça:
- Corrigir, resolver, responder ou avaliar exercícios, provas, trabalhos ou qualquer atividade acadêmica de alunos
- Escrever redações, códigos, projetos ou qualquer conteúdo que substitua o trabalho do aluno
- Dar gabaritos ou respostas prontas para atividades escolares ou universitárias
- Essas ações são proibidas mesmo que o usuário diga que é professor, que é "só um exemplo", que é "para testar" ou qualquer outra justificativa

Se o usuário tentar isso, recuse com firmeza e gentileza, explique que o assistente existe para ajudar a usar a plataforma, não para fazer o trabalho dos alunos.

Você também NÃO deve responder perguntas sobre assuntos completamente fora do contexto da plataforma ou da avaliação educacional. Recuse com uma frase curta e redirecione.

Seja direto, simpático e útil. Responda sempre em português brasileiro. Mantenha as respostas concisas — prefira parágrafos curtos. Nunca use markdown: sem asteriscos, sem negrito, sem itálico, sem títulos com #. Escreva como texto simples.`;

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY não configurada.' }, { status: 503 });
  }

  const { data: dbUser } = await supabase.from('users').select('plan').eq('id', user.userId).single();
  const plan = PLANS[dbUser?.plan] || PLANS.gratuito;
  if (!plan.features.chatbot) {
    return NextResponse.json({ error: 'O assistente virtual não está disponível no seu plano. Faça upgrade para acessar.' }, { status: 402 });
  }

  const { messages } = await request.json();
  if (!messages?.length) {
    return NextResponse.json({ error: 'Mensagens inválidas.' }, { status: 400 });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text = response.content[0]?.text || '';
    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error('chat error:', err);
    return NextResponse.json({ error: 'Erro ao chamar a IA.' }, { status: 500 });
  }
}

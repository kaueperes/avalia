import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getUserFromRequest } from '@/lib/auth';
import { TYPES } from '@/lib/types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { exerciseName, exerciseType, briefDescription } = await request.json();
  if (!briefDescription) return NextResponse.json({ error: 'Descrição é obrigatória' }, { status: 400 });

  const typeLabel = TYPES[exerciseType]?.label || exerciseType;

  const prompt = `Você é um professor criando um enunciado de exercício para seus alunos.

Com base nas informações abaixo, crie um enunciado completo, claro e bem estruturado.

Tipo de trabalho: ${typeLabel}
${exerciseName ? `Nome do exercício: ${exerciseName}` : ''}
Descrição breve do professor: ${briefDescription}

O enunciado deve incluir:
- Objetivo do exercício
- O que o aluno deve entregar
- Requisitos técnicos ou restrições importantes
- Critérios que serão considerados na avaliação

Escreva de forma direta, como um professor experiente se comunicaria com seus alunos. Não inclua títulos como "Objetivo:", "Entrega:" — escreva em texto corrido ou com marcadores simples. Máximo de 200 palavras.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0]?.text || '';
    return NextResponse.json({ context: text });
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao gerar enunciado' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getUserFromRequest } from '@/lib/auth';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { exerciseName, briefDescription } = await request.json();
  if (!briefDescription) return NextResponse.json({ error: 'Descrição é obrigatória' }, { status: 400 });

  const prompt = `Você é um professor criando um exercício para seus alunos.

Com base nas informações abaixo, gere:
1. Um enunciado completo e claro (máximo 200 palavras)
2. Entre 3 e 6 critérios de avaliação com pesos

${exerciseName ? `Nome do exercício: ${exerciseName}` : ''}
Descrição breve: ${briefDescription}

Responda APENAS com JSON válido, sem markdown, no seguinte formato:
{
  "context": "texto do enunciado aqui",
  "criteria": [
    { "name": "Nome do critério", "weight": 3 },
    { "name": "Nome do critério", "weight": 2 },
    { "name": "Nome do critério", "weight": 1 }
  ]
}

Regras:
- O enunciado deve incluir objetivo, o que entregar e requisitos principais. Escreva de forma direta, sem títulos como "Objetivo:".
- Os critérios devem refletir o que será avaliado no trabalho. Peso 3 = mais importante, peso 1 = menos importante.
- Use apenas pesos 1, 2 ou 3.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0]?.text || '';
    const parsed = JSON.parse(text);
    return NextResponse.json({ context: parsed.context, criteria: parsed.criteria });
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao gerar exercício' }, { status: 500 });
  }
}

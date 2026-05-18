import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getUserFromRequest } from '@/lib/auth';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const INPUT_TYPE_LABELS = {
  text: 'texto escrito',
  image: 'imagem',
  images: 'múltiplas imagens',
  video: 'vídeo ou áudio',
};

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { description, inputType } = await request.json();
  if (!description?.trim()) return NextResponse.json({ error: 'Descrição é obrigatória' }, { status: 400 });

  const typeLabel = INPUT_TYPE_LABELS[inputType] || 'trabalho';

  const prompt = `Você é um professor experiente criando uma avaliação. Com base na descrição abaixo, gere:
1. Um nome curto e claro para o exercício (máximo 60 caracteres)
2. Um enunciado completo e bem estruturado (máximo 200 palavras, sem títulos como "Objetivo:" — escreva em texto corrido)
3. De 3 a 5 critérios de avaliação com pesos (peso de 1 a 3, onde 1 = menos importante, 3 = muito importante)

Formato de entrega do trabalho: ${typeLabel}
Descrição do professor: ${description}

Responda APENAS com JSON válido, sem markdown:
{
  "exerciseName": "Nome do exercício",
  "exerciseContext": "Enunciado completo...",
  "criteria": [
    {"name": "Nome do critério", "weight": 2},
    {"name": "Outro critério", "weight": 1}
  ]
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('no_json');
    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: 'Erro ao gerar critérios' }, { status: 500 });
  }
}

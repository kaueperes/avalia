import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getUserFromRequest } from '@/lib/auth';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { exerciseName, disciplinaName, briefDescription } = await request.json();
  if (!briefDescription) return NextResponse.json({ error: 'Descrição é obrigatória' }, { status: 400 });

  const prompt = `Você é um professor criando um exercício para seus alunos.

Com base nas informações abaixo, gere:
1. Um enunciado estruturado por tópicos
2. Entre 3 e 6 critérios de avaliação com pesos

${disciplinaName ? `Disciplina: ${disciplinaName}` : ''}
${exerciseName ? `Nome do exercício: ${exerciseName}` : ''}
Descrição do professor: ${briefDescription}

Responda APENAS com JSON válido, sem markdown:
{
  "context": "texto do enunciado aqui",
  "criteria": [
    { "name": "Nome do critério", "weight": 3 },
    ...
  ]
}

Regras do enunciado:
- Estruture em tópicos com os labels exatos: Objetivo, O que entregar, Requisitos, Observações
- Separe cada tópico com uma linha em branco
- Seja conciso mas completo — inclua tudo que o aluno precisa saber para realizar o exercício, sem informações desnecessárias
- Escreva de forma direta, sem introduções

Regras dos critérios:
- Devem ser específicos para a disciplina e exercício informados
- Não use critérios genéricos sem contexto (ex: "Criatividade", "Organização" sozinhos não servem)
- Peso 3 = critério mais importante para a nota final
- Peso 2 = critério de importância média
- Peso 1 = critério complementar
- Use apenas pesos 1, 2 ou 3`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'Resposta inválida da IA' }, { status: 500 });
    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ context: parsed.context, criteria: parsed.criteria });
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao gerar exercício' }, { status: 500 });
  }
}

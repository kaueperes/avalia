import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60;

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY não configurada.' }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const label = formData.get('label') || 'Trabalho do aluno';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Arquivo obrigatório.' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type || 'application/octet-stream' });

    const uploaded = await ai.files.upload({
      file: blob,
      config: { mimeType: file.type, displayName: file.name },
    });

    return NextResponse.json({
      fileUri: uploaded.uri,
      mimeType: uploaded.mimeType || file.type,
      name: file.name,
      label,
    });
  } catch (err) {
    console.error('upload-gemini error:', err?.message || err);
    return NextResponse.json(
      { error: 'Erro ao enviar arquivo para o servidor de IA. Tente novamente.' },
      { status: 500 }
    );
  }
}

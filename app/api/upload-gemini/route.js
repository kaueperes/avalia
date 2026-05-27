import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';

const BUCKET = 'avaliacoes-temp';
export const maxDuration = 60;

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY não configurada.' }, { status: 503 });
  }

  try {
    const { supabasePath, mimeType, name, label } = await request.json();

    if (!supabasePath || !mimeType || !name) {
      return NextResponse.json(
        { error: 'supabasePath, mimeType e name são obrigatórios.' },
        { status: 400 }
      );
    }

    // Download from Supabase Storage (outgoing request — not subject to Vercel body limit)
    const { data: fileBlob, error: dlErr } = await supabase.storage
      .from(BUCKET)
      .download(supabasePath);

    if (dlErr) {
      return NextResponse.json(
        { error: 'Erro ao baixar arquivo do storage: ' + dlErr.message },
        { status: 500 }
      );
    }

    // Ensure correct MIME type on the blob
    const typedBlob = new Blob([await fileBlob.arrayBuffer()], { type: mimeType });

    // Upload to Gemini Files API
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const uploaded = await ai.files.upload({
      file: typedBlob,
      config: { mimeType, displayName: name },
    });

    // Cleanup: delete from Supabase (fire-and-forget)
    supabase.storage.from(BUCKET).remove([supabasePath])
      .catch(e => console.warn('storage cleanup error:', e?.message));

    return NextResponse.json({
      fileUri: uploaded.uri,
      mimeType: uploaded.mimeType || mimeType,
      name,
      label: label || 'Trabalho do aluno',
    });
  } catch (err) {
    console.error('upload-gemini error:', err?.message || err);
    return NextResponse.json(
      { error: 'Erro ao enviar arquivo para o servidor de IA. Tente novamente.' },
      { status: 500 }
    );
  }
}

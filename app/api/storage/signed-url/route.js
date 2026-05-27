import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const BUCKET = 'avaliacoes-temp';

// Creates the bucket on first use — no-op if it already exists.
async function ensureBucket() {
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: 52428800, // 50 MB
  });
  if (error && !error.message?.toLowerCase().includes('already exist')) throw error;
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const { filename } = await request.json();
    if (!filename) return NextResponse.json({ error: 'filename obrigatório' }, { status: 400 });

    await ensureBucket();

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${user.userId}/${Date.now()}-${safeName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ signedUrl: data.signedUrl, path });
  } catch (err) {
    console.error('signed-url error:', err?.message || err);
    return NextResponse.json({ error: 'Erro ao criar URL de upload.' }, { status: 500 });
  }
}

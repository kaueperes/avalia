import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

function fmt(i) {
  return {
    id: i.id,
    userId: i.user_id,
    name: i.name,
    logoUrl: i.logo_url,
    educationLevel: i.education_level,
    createdAt: i.created_at,
  };
}

export async function PUT(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { name, logoUrl, educationLevel } = await request.json();
  if (!name) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });

  const { data, error } = await supabase
    .from('institutions')
    .update({ name, logo_url: logoUrl || '', education_level: educationLevel || '' })
    .eq('id', params.id)
    .eq('user_id', user.userId)
    .select().single();

  if (error || !data) return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  return NextResponse.json(fmt(data));
}

export async function DELETE(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { error } = await supabase
    .from('institutions')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.userId);

  if (error) return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  return NextResponse.json({ success: true });
}

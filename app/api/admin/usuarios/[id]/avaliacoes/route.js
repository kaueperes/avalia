import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
  const decoded = getUserFromRequest(request);
  if (!decoded) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: admin } = await supabase.from('users').select('is_admin').eq('id', decoded.userId).single();
  if (!admin?.is_admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const { data } = await supabase
    .from('evaluations')
    .select('id, student_name, type, score, turma, exercise_name, institution, profile_name, created_at')
    .eq('user_id', params.id)
    .order('created_at', { ascending: false });

  return NextResponse.json(data || []);
}

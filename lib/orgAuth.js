import { getUserFromRequest } from './auth';
import { supabase } from './supabase';

// Contexto de organização do usuário logado — usado pra decidir se ele pode
// acessar dado de OUTRO usuário (admin vendo PDF/relatório de um professor, etc.).
export async function getOrgContext(request) {
  const user = getUserFromRequest(request);
  if (!user) return null;
  const { data } = await supabase.from('users').select('org_id, org_role').eq('id', user.userId).single();
  return { userId: user.userId, orgId: data?.org_id || null, orgRole: data?.org_role || null };
}

// true se o requester pode acessar dado pertencente a `ownerId`: é o próprio dono,
// ou é admin da mesma organização que o dono. (Coordenador entra aqui na Fase 3.)
export async function canAccessOrgMember(ctx, ownerId) {
  if (!ctx) return false;
  if (ctx.userId === ownerId) return true;
  if (!ctx.orgId || ctx.orgRole !== 'admin') return false;
  const { data: owner } = await supabase.from('users').select('org_id').eq('id', ownerId).single();
  return owner?.org_id === ctx.orgId;
}

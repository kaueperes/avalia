import { getUserFromRequest } from './auth';
import { supabase } from './supabase';

// Contexto de organização do usuário logado — usado pra decidir se ele pode
// acessar dado de OUTRO usuário (admin/coordenador vendo PDF/relatório de um professor, etc.).
export async function getOrgContext(request) {
  const user = getUserFromRequest(request);
  if (!user) return null;
  const { data } = await supabase.from('users').select('org_id, org_role').eq('id', user.userId).single();
  return { userId: user.userId, orgId: data?.org_id || null, orgRole: data?.org_role || null };
}

// Ids das equipes que o usuário do contexto coordena (dono da equipe, não membro comum).
export async function coordinatedTeamIds(ctx) {
  if (!ctx?.orgId) return [];
  const { data } = await supabase.from('org_teams').select('id').eq('org_id', ctx.orgId).eq('coordinator_id', ctx.userId);
  return (data || []).map(t => t.id);
}

// true se o requester pode acessar dado pertencente a `ownerId`:
// - é o próprio dono
// - é admin da mesma organização do dono
// - é coordenador de uma equipe que o dono também está — se `disciplina` for
//   informado (nome em texto, como salvo em evaluations.disciplina), só libera
//   se bater com a disciplina vinculada ao dono naquela equipe; sem disciplina
//   informada, basta compartilhar a equipe.
export async function canAccessOrgMember(ctx, ownerId, disciplina) {
  if (!ctx) return false;
  if (ctx.userId === ownerId) return true;
  if (!ctx.orgId) return false;

  if (ctx.orgRole === 'admin') {
    const { data: owner } = await supabase.from('users').select('org_id').eq('id', ownerId).single();
    return owner?.org_id === ctx.orgId;
  }

  const teamIds = await coordinatedTeamIds(ctx);
  if (!teamIds.length) return false;

  const { data: memberships } = await supabase
    .from('org_team_members')
    .select('discipline_id')
    .eq('user_id', ownerId)
    .in('team_id', teamIds);
  if (!memberships?.length) return false;
  if (!disciplina) return true;

  const disciplineIds = memberships.map(m => m.discipline_id);
  const { data: disciplines } = await supabase.from('disciplines').select('subject').in('id', disciplineIds);
  return (disciplines || []).some(d => d.subject === disciplina);
}

// Ids de disciplinas que o requester enxerga como "gerenciador" (admin vê todas
// as disciplinas da org; coordenador só as vinculadas às equipes que coordena).
// Usado por rotas que filtram por discipline_id direto (exercises).
export async function managedDisciplineIds(ctx) {
  if (!ctx?.orgId) return [];
  if (ctx.orgRole === 'admin') {
    const { data } = await supabase.from('disciplines').select('id').eq('org_id', ctx.orgId);
    return (data || []).map(d => d.id);
  }
  const teamIds = await coordinatedTeamIds(ctx);
  if (!teamIds.length) return [];
  const { data } = await supabase.from('org_team_members').select('discipline_id').in('team_id', teamIds);
  return [...new Set((data || []).map(m => m.discipline_id))];
}

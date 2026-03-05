// Dados em memória (temporário - futuramente substituído por banco de dados)
// Os dados ficam salvos enquanto o servidor estiver rodando.

const store = globalThis.__avalia_store ?? {
  users: [],
  profiles: [],
  evaluations: [],
  exercises: [],
};

// Garante que o Next.js em modo dev não perde os dados ao recarregar
if (process.env.NODE_ENV !== 'production') {
  globalThis.__avalia_store = store;
}

export const { users, profiles, evaluations, exercises } = store;

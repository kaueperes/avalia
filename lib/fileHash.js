// Detecção de arquivo idêntico entre alunos diferentes — hash de conteúdo,
// funciona pra qualquer tipo de arquivo (foto, vídeo, PDF, objeto 3D, etc),
// já que não olha o conteúdo, só os bytes. Sinal mais forte que a similaridade
// de texto (lib/textSimilarity.js): hash batendo é certeza, não probabilidade.
// Só pega duplicata exata — arquivo reexportado/recortado não bate mais.

export async function hashFile(file) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// entries: [{ id, name, files: [{ hash, name }] }]
// Retorna um item por par aluno+arquivo coincidente.
export function findDuplicateFiles(entries) {
  const results = [];
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i], b = entries[j];
      for (const fa of a.files || []) {
        if (!fa.hash) continue;
        for (const fb of b.files || []) {
          if (fa.hash === fb.hash) {
            results.push({ aId: a.id, aName: a.name, bId: b.id, bName: b.name, fileName: fa.name || fb.name });
          }
        }
      }
    }
  }
  return results;
}

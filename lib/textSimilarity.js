// Comparação determinística de similaridade de texto — usada pra sinalizar respostas
// muito parecidas entre alunos de um mesmo lote (Avaliação Básica e Avançada).
// Não usa IA: é mais confiável e mais barato que pedir pro modelo "achar coincidência"
// dentro do mesmo prompt de correção.

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Shingles de 2 palavras (bigramas) — testado contra texto parafraseado real:
// tamanhos maiores (4-5 palavras) quebram com qualquer reescrita leve e não
// pegam cola parafraseada, que é o caso mais comum. Bigramas ainda exigem
// sequência de palavras coincidindo (não é bag-of-words), então não confunde
// dois textos independentes só por falarem do mesmo assunto.
const SHINGLE_SIZE = 2;

function shingles(text) {
  const words = normalize(text).split(' ').filter(Boolean);
  const set = new Set();
  if (words.length < SHINGLE_SIZE) {
    if (words.length) set.add(words.join(' '));
    return set;
  }
  for (let i = 0; i <= words.length - SHINGLE_SIZE; i++) {
    set.add(words.slice(i, i + SHINGLE_SIZE).join(' '));
  }
  return set;
}

function wordCount(text) {
  return normalize(text).split(' ').filter(Boolean).length;
}

export function jaccardSimilarity(textA, textB) {
  const setA = shingles(textA);
  const setB = shingles(textB);
  if (!setA.size || !setB.size) return 0;
  let intersection = 0;
  for (const shingle of setA) if (setB.has(shingle)) intersection++;
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// entries: [{ id, name, text }]. Ignora textos curtos demais (resposta objetiva
// curta legitimamente igual entre alunos não é plágio) e textos ausentes.
// Retorna pares acima do limiar, ordenados do mais suspeito pro menos.
export function findSimilarPairs(entries, { threshold = 0.25, minWords = 8 } = {}) {
  const usable = (entries || []).filter(e => e.text && wordCount(e.text) >= minWords);
  const pairs = [];
  for (let i = 0; i < usable.length; i++) {
    for (let j = i + 1; j < usable.length; j++) {
      const a = usable[i], b = usable[j];
      const score = jaccardSimilarity(a.text, b.text);
      if (score >= threshold) {
        pairs.push({ aId: a.id, aName: a.name, bId: b.id, bName: b.name, score });
      }
    }
  }
  return pairs.sort((x, y) => y.score - x.score);
}

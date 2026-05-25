export function computeIDF(recipes: string[][]): Map<string, number> {
  const N = recipes.length;
  if (N === 0) return new Map();
  const df = new Map<string, number>();
  for (const r of recipes) {
    const seen = new Set(r);
    for (const id of seen) {
      df.set(id, (df.get(id) ?? 0) + 1);
    }
  }
  const idf = new Map<string, number>();
  for (const [id, count] of df) {
    idf.set(id, Math.log(N / count));
  }
  return idf;
}

export function cosineSimilarity(
  a: Set<string>,
  b: Set<string>,
  idf: Map<string, number>
): number {
  if (a.size === 0 || b.size === 0) return 0;
  const vocab = new Set([...a, ...b]);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const id of vocab) {
    const w = idf.get(id) ?? 0;
    const va = a.has(id) ? w : 0;
    const vb = b.has(id) ? w : 0;
    dot += va * vb;
    normA += va * va;
    normB += vb * vb;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

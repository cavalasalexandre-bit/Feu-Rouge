export type Rng = () => number

/** Générateur pseudo-aléatoire reproductible (utile pour les tests). */
export function seeded(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const defaultRng: Rng = Math.random

export function shuffle<T>(items: readonly T[], rng: Rng = defaultRng): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Tirage pondéré sans remise (méthode d'Efraimidis-Spirakis) :
 * chaque élément reçoit la clé u^(1/poids), on garde les n plus grandes.
 */
export function weightedSample<T>(
  items: readonly T[],
  weight: (item: T) => number,
  n: number,
  rng: Rng = defaultRng,
): T[] {
  return items
    .map((item) => {
      const w = Math.max(weight(item), 1e-6)
      return { item, key: Math.pow(rng(), 1 / w) }
    })
    .sort((a, b) => b.key - a.key)
    .slice(0, n)
    .map((x) => x.item)
}

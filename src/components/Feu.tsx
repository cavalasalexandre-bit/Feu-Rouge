/**
 * Voyant de tableau de bord indiquant l'état d'un thème :
 * 0 = rouge (à travailler), 1 = ambre (en progrès), 2 = vert (maîtrisé), null = éteint (pas encore évalué).
 * Rouge et ambre « s'allument » (halo) pour attirer l'œil sur ce qui coûte des points.
 */
export function Feu({ niveau, label, taille = 12 }: { niveau: 0 | 1 | 2 | null; label?: string; taille?: number }) {
  return (
    <span
      className="voyant"
      data-level={niveau ?? 'x'}
      style={{ width: taille, height: taille }}
      role="img"
      aria-label={label ?? libelleNiveau(niveau)}
    />
  )
}

export function libelleNiveau(niveau: 0 | 1 | 2 | null): string {
  if (niveau === null) return 'Pas encore évalué'
  return ['À travailler', 'En progrès', 'Maîtrisé'][niveau]
}

/** Niveau du voyant selon la précision lissée et le nombre de questions vues. */
export function niveauTheme(precision: number, vues: number): 0 | 1 | 2 | null {
  if (vues === 0) return null
  if (precision >= 0.85) return 2
  if (precision >= 0.65) return 1
  return 0
}

/** Couleur CSS correspondant à un niveau (pour les barres et graphiques). */
export function couleurNiveau(niveau: 0 | 1 | 2 | null): string {
  if (niveau === null) return 'var(--dim)'
  return ['var(--signal)', 'var(--amber)', 'var(--go)'][niveau]
}

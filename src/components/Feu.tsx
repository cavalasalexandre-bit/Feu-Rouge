/** Feu tricolore : 0 = rouge (à travailler), 1 = orange (en progrès), 2 = vert (maîtrisé). */
export function Feu({ niveau, label }: { niveau: 0 | 1 | 2 | null; label?: string }) {
  return (
    <span className="feu" data-level={niveau ?? 'x'} role="img" aria-label={label ?? libelleNiveau(niveau)}>
      <i />
      <i />
      <i />
    </span>
  )
}

export function libelleNiveau(niveau: 0 | 1 | 2 | null): string {
  if (niveau === null) return 'Pas encore évalué'
  return ['À travailler', 'En progrès', 'Maîtrisé'][niveau]
}

/** Niveau du feu selon la précision lissée et le nombre de questions vues. */
export function niveauTheme(precision: number, vues: number): 0 | 1 | 2 | null {
  if (vues === 0) return null
  if (precision >= 0.85) return 2
  if (precision >= 0.65) return 1
  return 0
}

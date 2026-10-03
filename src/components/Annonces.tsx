import { useEffect, useState } from 'react'
import { QUESTIONS } from '../data'
import { marquerBadgesVus, nouveauxBadges, serieEnCours } from '../lib/motivation'
import { jourCle } from '../lib/storage'
import { useStore } from '../lib/store'

/** Encouragements affichés en fin de série : objectif du jour, série de jours, nouveaux badges. */
export function Annonces() {
  const { state, update } = useStore()
  // Figé au premier affichage : les badges annoncés ne disparaissent pas quand on les marque comme vus.
  const [badges] = useState(() => nouveauxBadges(QUESTIONS, state))
  const fait = state.activite[jourCle()] ?? 0
  const objectif = state.settings.objectifJour
  const serie = serieEnCours(state.activite)

  useEffect(() => {
    if (badges.length) update((s) => marquerBadgesVus(s, badges.map((b) => b.id)))
  }, [badges, update])

  if (!badges.length && fait < objectif) return null

  return (
    <section className="annonces" aria-live="polite">
      {fait >= objectif && (
        <p className="annonce">
          <span className="voyant" data-level="2" style={{ width: 12, height: 12 }} />
          <span>
            <strong>Objectif du jour atteint</strong> · {fait} questions aujourd'hui
            {serie > 1 && <> · série de {serie} jours</>}
          </span>
        </p>
      )}
      {badges.map((b) => (
        <p key={b.id} className="annonce annonce-badge">
          <span className="voyant" data-level="1" style={{ width: 12, height: 12 }} />
          <span>
            <strong>Nouveau badge : {b.titre}</strong> · {b.description}
          </span>
        </p>
      ))}
    </section>
  )
}

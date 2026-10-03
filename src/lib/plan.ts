import type { AppState, Question, ThemeId } from '../types'
import { questionsAReviser, themesFaibles } from './adaptive'
import { jourCle } from './storage'

export type Tache =
  | { type: 'positionnement' }
  | { type: 'erreurs'; nombre: number }
  | { type: 'theme'; theme: ThemeId; nombre: number }
  | { type: 'graves'; nombre: number }
  | { type: 'examen' }

export interface PlanDuJour {
  joursRestants: number | null
  objectif: number
  faitAujourdhui: number
  taches: Tache[]
}

export function joursAvant(dateExamen: string | null, aujourdhui: Date = new Date()): number | null {
  if (!dateExamen) return null
  const [a, m, j] = dateExamen.split('-').map(Number)
  if (!a || !m || !j) return null
  const cible = new Date(a, m - 1, j)
  const debut = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate())
  return Math.round((cible.getTime() - debut.getTime()) / 86400000)
}

/**
 * Plan de révision du jour :
 * 1. le test de positionnement s'il n'est pas fait ;
 * 2. les erreurs à rattraper ;
 * 3. un quiz sur les deux thèmes les plus faibles ;
 * 4. un entraînement « fautes graves » s'il en reste à revoir ;
 * 5. un examen blanc, d'autant plus souvent que l'examen approche.
 */
export function planDuJour(questions: readonly Question[], state: AppState, aujourdhui: Date = new Date()): PlanDuJour {
  const joursRestants = joursAvant(state.settings.dateExamen, aujourdhui)
  const faitAujourdhui = state.activite[jourCle(aujourdhui)] ?? 0
  const objectif = state.settings.objectifJour

  if (!state.positionnementFait) {
    return { joursRestants, objectif, faitAujourdhui, taches: [{ type: 'positionnement' }] }
  }

  const taches: Tache[] = []
  const erreurs = questionsAReviser(questions, state.stats).length
  if (erreurs > 0) taches.push({ type: 'erreurs', nombre: Math.min(erreurs, 20) })

  const faibles = themesFaibles(questions, state).slice(0, 2)
  for (const m of faibles) taches.push({ type: 'theme', theme: m.theme, nombre: 10 })

  const graves = faibles.reduce((n, m) => n + m.gravesARevoir, 0)
  if (graves > 0 || (joursRestants !== null && joursRestants <= 14)) taches.push({ type: 'graves', nombre: 15 })

  const dernierExamen = state.examens.at(-1)
  const joursDepuisExamen = dernierExamen
    ? Math.floor((aujourdhui.getTime() - dernierExamen.date) / 86400000)
    : Infinity
  // Plus l'examen est proche, plus les examens blancs sont fréquents.
  const frequence = joursRestants === null ? 3 : joursRestants <= 7 ? 1 : joursRestants <= 21 ? 2 : 3
  if (joursDepuisExamen >= frequence) taches.push({ type: 'examen' })

  return { joursRestants, objectif, faitAujourdhui, taches }
}

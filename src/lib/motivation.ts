import type { AppState, Question, ThemeId } from '../types'
import { BOITE_MAITRISE, maitriseParTheme } from './adaptive'
import { jourCle } from './storage'

const JOUR = 86400000

function veille(cle: string): string {
  const [a, m, j] = cle.split('-').map(Number)
  return jourCle(new Date(new Date(a, m - 1, j).getTime() - JOUR / 2))
}

/**
 * Série en cours : nombre de jours consécutifs avec au moins une réponse.
 * Si rien n'a encore été fait aujourd'hui, la série d'hier compte toujours (elle n'est pas encore perdue).
 */
export function serieEnCours(activite: AppState['activite'], aujourdhui: Date = new Date()): number {
  let cle = jourCle(aujourdhui)
  if (!activite[cle]) cle = veille(cle)
  let n = 0
  while (activite[cle]) {
    n++
    cle = veille(cle)
  }
  return n
}

/** Meilleure série de tous les temps. */
export function meilleureSerie(activite: AppState['activite']): number {
  const jours = Object.keys(activite)
    .filter((k) => activite[k] > 0)
    .sort()
  let best = 0
  let cur = 0
  let prec: string | null = null
  for (const j of jours) {
    cur = prec !== null && veille(j) === prec ? cur + 1 : 1
    best = Math.max(best, cur)
    prec = j
  }
  return best
}

export interface Badge {
  id: string
  titre: string
  description: string
  obtenu: boolean
  /** Progression vers le badge, ex. « 4/7 ». */
  progression?: string
}

/** Badges sobres, calculés à partir de la progression (rien n'est stocké à part ceux déjà annoncés). */
export function badges(questions: readonly Question[], state: AppState): Badge[] {
  const serie = meilleureSerie(state.activite)
  const maitrisees = Object.values(state.stats).filter((s) => s.boite >= BOITE_MAITRISE).length
  const vues = questions.filter((q) => state.stats[q.id]?.vues).length
  const graves = questions.filter((q) => q.grave)
  const gravesMaitrisees = graves.filter((q) => (state.stats[q.id]?.boite ?? 0) >= BOITE_MAITRISE).length
  const ex = state.examens
  let suite = 0
  let meilleureSuite = 0
  for (const e of ex) {
    suite = e.reussi ? suite + 1 : 0
    meilleureSuite = Math.max(meilleureSuite, suite)
  }
  const m = maitriseParTheme(questions, state.stats)
  const themesVerts = [...m.values()].filter((t) => t.vues > 0 && t.precision >= 0.85).length
  const nbThemes = m.size
  const prog = (n: number, max: number) => `${Math.min(n, max)}/${max}`

  return [
    { id: 'diagnostic', titre: 'Contact', description: 'Faire le test de positionnement', obtenu: state.positionnementFait },
    { id: 'serie-3', titre: 'Rodage', description: '3 jours d’affilée', obtenu: serie >= 3, progression: prog(serie, 3) },
    { id: 'serie-7', titre: 'Régulier', description: '7 jours d’affilée', obtenu: serie >= 7, progression: prog(serie, 7) },
    { id: 'serie-30', titre: 'Increvable', description: '30 jours d’affilée', obtenu: serie >= 30, progression: prog(serie, 30) },
    { id: 'premier-examen', titre: 'Feu vert', description: 'Réussir un examen blanc', obtenu: ex.some((e) => e.reussi) },
    { id: 'sans-faute-grave', titre: 'Zéro grave', description: 'Réussir un examen blanc sans faute grave', obtenu: ex.some((e) => e.reussi && e.fautesGraves === 0) },
    { id: 'trois-de-suite', titre: 'Prêt pour le jour J', description: '3 examens blancs réussis d’affilée', obtenu: meilleureSuite >= 3, progression: prog(meilleureSuite, 3) },
    { id: 'maitrise-100', titre: 'Mécanique huilée', description: '100 questions maîtrisées', obtenu: maitrisees >= 100, progression: prog(maitrisees, 100) },
    { id: 'graves', titre: 'Vigilant', description: 'Maîtriser toutes les fautes graves', obtenu: graves.length > 0 && gravesMaitrisees === graves.length, progression: prog(gravesMaitrisees, graves.length) },
    { id: 'tout-vu', titre: 'Grand tour', description: 'Voir toutes les questions', obtenu: vues === questions.length, progression: prog(vues, questions.length) },
    { id: 'tout-vert', titre: 'Tableau au vert', description: 'Tous les voyants au vert', obtenu: themesVerts === nbThemes, progression: prog(themesVerts, nbThemes) },
  ]
}

/** Badges obtenus mais pas encore annoncés. */
export function nouveauxBadges(questions: readonly Question[], state: AppState): Badge[] {
  const vus = new Set(state.badgesVus)
  return badges(questions, state).filter((b) => b.obtenu && !vus.has(b.id))
}

export function marquerBadgesVus(state: AppState, ids: string[]): AppState {
  return { ...state, badgesVus: [...new Set([...state.badgesVus, ...ids])] }
}

/** Thèmes passés au vert : utile pour un message d'encouragement. */
export function themesAuVert(questions: readonly Question[], state: AppState): ThemeId[] {
  return [...maitriseParTheme(questions, state.stats).values()].filter((t) => t.vues > 0 && t.precision >= 0.85).map((t) => t.theme)
}

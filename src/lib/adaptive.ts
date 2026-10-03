import type { AppState, Question, QuestionStat, ThemeId } from '../types'
import { EXAMEN } from './scoring'
import { type Rng, defaultRng, shuffle, weightedSample } from './random'

const JOUR = 24 * 60 * 60 * 1000

/** Délai avant de revoir une question selon sa boîte de Leitner (en jours). */
export const INTERVALLES_JOURS = [0, 1, 2, 4, 8, 16] as const

/** Nombre de réussites d'affilée pour considérer une question maîtrisée. */
export const BOITE_MAITRISE = 3

export function nouvelleStat(): QuestionStat {
  return { vues: 0, justes: 0, boite: 0, derniere: 0, rateeDerniere: false }
}

/** Met à jour le suivi après une réponse : juste → boîte suivante, faux → retour en boîte 0. */
export function majStat(stat: QuestionStat | undefined, juste: boolean, maintenant = Date.now()): QuestionStat {
  const s = stat ?? nouvelleStat()
  return {
    vues: s.vues + 1,
    justes: s.justes + (juste ? 1 : 0),
    boite: juste ? Math.min(5, s.boite + 1) : 0,
    derniere: maintenant,
    rateeDerniere: !juste,
  }
}

/** Une question est « à revoir » si elle a déjà été vue et que son délai est écoulé. */
export function estDue(stat: QuestionStat | undefined, maintenant = Date.now()): boolean {
  if (!stat || stat.vues === 0) return false
  if (stat.rateeDerniere) return true
  return maintenant - stat.derniere >= INTERVALLES_JOURS[stat.boite] * JOUR
}

/** Questions ratées pas encore rattrapées (moins de BOITE_MAITRISE réussites d'affilée). */
export function questionsAReviser(questions: readonly Question[], stats: AppState['stats']): Question[] {
  return questions.filter((q) => {
    const s = stats[q.id]
    return s !== undefined && s.vues > s.justes && s.boite < BOITE_MAITRISE
  })
}

export interface MaitriseTheme {
  theme: ThemeId
  total: number
  vues: number
  /** Taux de bonnes réponses lissé (0 à 1). 0,5 quand on ne sait rien. */
  precision: number
  /** Part des questions du thème maîtrisées (boîte ≥ BOITE_MAITRISE). */
  maitrise: number
  /** Nombre de questions graves ratées et pas encore rattrapées. */
  gravesARevoir: number
}

export function maitriseParTheme(questions: readonly Question[], stats: AppState['stats']): Map<ThemeId, MaitriseTheme> {
  const res = new Map<ThemeId, MaitriseTheme & { _j: number; _v: number }>()
  for (const q of questions) {
    const m = res.get(q.theme) ?? {
      theme: q.theme,
      total: 0,
      vues: 0,
      precision: 0.5,
      maitrise: 0,
      gravesARevoir: 0,
      _j: 0,
      _v: 0,
    }
    const s = stats[q.id]
    m.total++
    if (s && s.vues > 0) {
      m.vues++
      m._j += s.justes
      m._v += s.vues
      if (s.boite >= BOITE_MAITRISE) m.maitrise++
      if (q.grave && s.vues > s.justes && s.boite < BOITE_MAITRISE) m.gravesARevoir++
    }
    res.set(q.theme, m)
  }
  const out = new Map<ThemeId, MaitriseTheme>()
  for (const [k, m] of res) {
    out.set(k, {
      theme: m.theme,
      total: m.total,
      vues: m.vues,
      // Lissage de Laplace : (justes + 1) / (vues + 2)
      precision: (m._j + 1) / (m._v + 2),
      maitrise: m.total ? m.maitrise / m.total : 0,
      gravesARevoir: m.gravesARevoir,
    })
  }
  return out
}

/** Thèmes triés du plus faible au plus fort (prioritaires choisis par l'utilisateur en tête). */
export function themesFaibles(questions: readonly Question[], state: AppState): MaitriseTheme[] {
  const prio = new Set(state.settings.themesPrioritaires)
  return [...maitriseParTheme(questions, state.stats).values()].sort((a, b) => {
    const pa = prio.has(a.theme) ? 1 : 0
    const pb = prio.has(b.theme) ? 1 : 0
    if (pa !== pb) return pb - pa
    return a.precision - b.precision
  })
}

/**
 * Poids d'un thème dans le tirage : plus le thème est faible, plus il pèse.
 * Les thèmes cochés comme prioritaires dans les réglages pèsent deux fois plus.
 */
export function poidsTheme(m: MaitriseTheme | undefined, prioritaire: boolean): number {
  const precision = m?.precision ?? 0.5
  const decouverte = m && m.total ? 1 - m.vues / m.total : 1
  const base = 0.5 + 2.5 * (1 - precision) + 0.5 * decouverte
  return prioritaire ? base * 2 : base
}

/** Poids d'une question : à revoir > jamais vue > peu maîtrisée > maîtrisée. Les graves pèsent un peu plus. */
export function poidsQuestion(q: Question, stat: QuestionStat | undefined, maintenant = Date.now()): number {
  let w: number
  if (estDue(stat, maintenant)) w = stat!.rateeDerniere ? 4 : 2.5
  else if (!stat || stat.vues === 0) w = 2
  else w = 0.3 + (5 - stat.boite) * 0.25
  return q.grave ? w * 1.3 : w
}

export interface OptionsTirage {
  rng?: Rng
  maintenant?: number
  /** Ne garder que ces thèmes. */
  themes?: ThemeId[]
  /** Ne garder que les questions graves. */
  gravesSeulement?: boolean
}

function filtrer(questions: readonly Question[], opts: OptionsTirage): Question[] {
  return questions.filter(
    (q) => (!opts.themes || opts.themes.includes(q.theme)) && (!opts.gravesSeulement || q.grave),
  )
}

/** Tirage adaptatif : les thèmes faibles et les questions ratées reviennent plus souvent. */
export function tirageAdaptatif(
  questions: readonly Question[],
  state: AppState,
  n: number,
  opts: OptionsTirage = {},
): Question[] {
  const rng = opts.rng ?? defaultRng
  const maintenant = opts.maintenant ?? Date.now()
  const pool = filtrer(questions, opts)
  const maitrise = maitriseParTheme(questions, state.stats)
  const prio = new Set(state.settings.themesPrioritaires)
  const pick = weightedSample(
    pool,
    (q) => poidsTheme(maitrise.get(q.theme), prio.has(q.theme)) * poidsQuestion(q, state.stats[q.id], maintenant),
    n,
    rng,
  )
  return shuffle(pick, rng)
}

/**
 * Tirage réparti équitablement entre les thèmes (positionnement, examen « officiel ») :
 * chaque thème reçoit sa part, puis on complète au hasard.
 */
export function tirageEquilibre(questions: readonly Question[], n: number, opts: OptionsTirage = {}): Question[] {
  const rng = opts.rng ?? defaultRng
  const pool = filtrer(questions, opts)
  const parTheme = new Map<ThemeId, Question[]>()
  for (const q of shuffle(pool, rng)) {
    const l = parTheme.get(q.theme) ?? []
    l.push(q)
    parTheme.set(q.theme, l)
  }
  const themes = shuffle([...parTheme.keys()], rng)
  const choisies: Question[] = []
  // Tour par tour : une question par thème à chaque passage.
  let progres = true
  while (choisies.length < n && progres) {
    progres = false
    for (const t of themes) {
      if (choisies.length >= n) break
      const l = parTheme.get(t)!
      const q = l.shift()
      if (q) {
        choisies.push(q)
        progres = true
      }
    }
  }
  return shuffle(choisies, rng)
}

export type ModeExamen = 'officiel' | 'cible'

/** Examen blanc de 50 questions : « officiel » = réparti sur tout le programme, « ciblé » = adaptatif. */
export function tirageExamen(
  questions: readonly Question[],
  state: AppState,
  mode: ModeExamen,
  opts: OptionsTirage = {},
): Question[] {
  return mode === 'officiel'
    ? tirageEquilibre(questions, EXAMEN.questions, opts)
    : tirageAdaptatif(questions, state, EXAMEN.questions, opts)
}

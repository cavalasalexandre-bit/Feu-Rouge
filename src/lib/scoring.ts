import type { ExamResult, Question, ThemeId } from '../types'

/** Règles de l'examen théorique officiel du permis B en Belgique. */
export const EXAMEN = {
  questions: 50,
  seuil: 41,
  penaliteSimple: 1,
  penaliteGrave: 5,
  /** Points qu'on peut perdre au maximum en réussissant (50 − 41). */
  margeMax: 9,
} as const

export interface Reponse {
  question: Question
  /** Index choisi, ou null si pas de réponse (compte comme une faute). */
  choix: number | null
}

export interface Score {
  points: number
  pointsPerdus: number
  fautesSimples: number
  fautesGraves: number
  justes: number
  reussi: boolean
}

export function estJuste(r: Reponse): boolean {
  return r.choix === r.question.bonne
}

export function penalite(q: Question): number {
  return q.grave ? EXAMEN.penaliteGrave : EXAMEN.penaliteSimple
}

/**
 * Calcule le score : on part de 50, −1 par faute simple, −5 par faute grave.
 * Réussite à partir de 41/50. Les questions non posées (examen arrêté)
 * ne comptent pas comme fautes : le score est déjà sous le seuil.
 */
export function scoreExamen(reponses: readonly Reponse[], total: number = EXAMEN.questions): Score {
  let fautesSimples = 0
  let fautesGraves = 0
  let justes = 0
  for (const r of reponses) {
    if (estJuste(r)) justes++
    else if (r.question.grave) fautesGraves++
    else fautesSimples++
  }
  const pointsPerdus = fautesSimples * EXAMEN.penaliteSimple + fautesGraves * EXAMEN.penaliteGrave
  const points = Math.max(0, total - pointsPerdus)
  return {
    points,
    pointsPerdus,
    fautesSimples,
    fautesGraves,
    justes,
    reussi: points >= EXAMEN.seuil,
  }
}

/** Comme à l'examen officiel : on s'arrête dès que 41/50 n'est plus atteignable. */
export function examenPerdu(reponses: readonly Reponse[], total: number = EXAMEN.questions): boolean {
  return scoreExamen(reponses, total).points < EXAMEN.seuil
}

export function resultatExamen(reponses: readonly Reponse[], dureeSec: number, date = Date.now()): ExamResult {
  const s = scoreExamen(reponses)
  const parTheme: ExamResult['parTheme'] = {}
  for (const r of reponses) {
    const t: ThemeId = r.question.theme
    const cur = parTheme[t] ?? { justes: 0, total: 0 }
    cur.total++
    if (estJuste(r)) cur.justes++
    parTheme[t] = cur
  }
  return {
    date,
    points: s.points,
    fautesSimples: s.fautesSimples,
    fautesGraves: s.fautesGraves,
    reussi: s.reussi,
    dureeSec,
    parTheme,
  }
}

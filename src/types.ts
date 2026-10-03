export type ThemeId =
  | 'vitesses'
  | 'distances'
  | 'eclairage'
  | 'priorites'
  | 'signalisation'
  | 'depassement'
  | 'stationnement'
  | 'autoroute'
  | 'alcool'
  | 'infractions'
  | 'vehicule'
  | 'secours'

export type Region = 'wallonie' | 'bruxelles' | 'flandre'

/** Schéma SVG optionnel affiché avec la question. */
export type Schema =
  | { type: 'panneau'; code: string; valeur?: string }
  | { type: 'scene'; id: string }

export interface Question {
  id: string
  theme: ThemeId
  question: string
  choix: string[]
  /** Index de la bonne réponse dans `choix`. */
  bonne: number
  /** Faute grave : une erreur coûte 5 points au lieu de 1. */
  grave: boolean
  explication: string
  schema?: Schema
  /** Question propre à une région (sinon valable partout). */
  region?: Region
}

export interface ThemeInfo {
  id: ThemeId
  titre: string
  court: string
  description: string
}

/** Suivi d'une question pour la répétition espacée (système de Leitner). */
export interface QuestionStat {
  vues: number
  justes: number
  /** Boîte 0 à 5 : 0 = jamais réussie ou ratée récemment, 5 = maîtrisée. */
  boite: number
  /** Horodatage de la dernière réponse (ms). */
  derniere: number
  /** Vrai si la dernière réponse était fausse. */
  rateeDerniere: boolean
}

export interface ExamResult {
  date: number
  points: number
  fautesSimples: number
  fautesGraves: number
  reussi: boolean
  dureeSec: number
  parTheme: Partial<Record<ThemeId, { justes: number; total: number }>>
}

export interface Settings {
  region: Region
  /** Date d'examen au format AAAA-MM-JJ, ou null. */
  dateExamen: string | null
  /** Thèmes que l'utilisateur a choisis comme prioritaires. */
  themesPrioritaires: ThemeId[]
  /** Durée de l'examen blanc en minutes (0 = sans chrono). */
  chronoMinutes: number
  /** Nombre de questions visé par jour dans le plan de révision. */
  objectifJour: number
}

export interface AppState {
  version: 1
  settings: Settings
  stats: Record<string, QuestionStat>
  examens: ExamResult[]
  positionnementFait: boolean
  /** Jours (AAAA-MM-JJ) → nombre de questions répondues. */
  activite: Record<string, number>
}

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
  /** Explique pourquoi la bonne réponse est juste (la règle). */
  explication: string
  /** Pour chaque mauvaise réponse (clé = son texte exact), pourquoi elle est fausse. */
  pourquoiFaux?: Record<string, string>
  schema?: Schema
  /** Question propre à une région (sinon valable partout). */
  region?: Region
}

export interface Source {
  titre: string
  url: string
}

export interface ThemeInfo {
  id: ThemeId
  titre: string
  court: string
  description: string
  /** Textes officiels ou fiables qui ont servi à rédiger le thème. */
  sources: Source[]
  /** Date de dernière vérification du contenu (AAAA-MM-JJ). */
  verifieLe: string
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

export type Apparence = 'sombre' | 'clair' | 'auto'

/** officiel = lecture puis 15 s par question ; libre = chrono global (ou aucun). */
export type FormatExamen = 'officiel' | 'libre'

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
  apparence: Apparence
  formatExamen: FormatExamen
  /** Lecture des questions à voix haute (synthèse vocale du navigateur). */
  lectureAudio: boolean
}

export interface AppState {
  version: 1
  settings: Settings
  stats: Record<string, QuestionStat>
  examens: ExamResult[]
  positionnementFait: boolean
  /** Jours (AAAA-MM-JJ) → nombre de questions répondues. */
  activite: Record<string, number>
  /** Badges déjà annoncés à l'utilisateur. */
  badgesVus: string[]
}

/** Crédits d'une photo installée par « npm run photos:installer ». */
export interface CreditPhoto {
  fichier: string
  auteur: string
  licence: string
  lienLicence: string
  lienSource: string
  source: string
}

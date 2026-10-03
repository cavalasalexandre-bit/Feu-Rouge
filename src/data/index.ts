import type { CreditPhoto, Question, ThemeId } from '../types'
import photos from './photos.json'
import { THEMES } from './themes'

// Chaque thème a son fichier JSON dans ./questions. Ajouter une question = ajouter une entrée au fichier.
const fichiers = import.meta.glob<Question[]>('./questions/*.json', { eager: true, import: 'default' })

export const QUESTIONS: Question[] = Object.values(fichiers).flat()

export const QUESTIONS_PAR_ID: Record<string, Question> = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]))

export function questionsDuTheme(theme: ThemeId): Question[] {
  return QUESTIONS.filter((q) => q.theme === theme)
}

const cours = import.meta.glob<string>('./cours/*.md', { eager: true, query: '?raw', import: 'default' })

export function coursDuTheme(theme: ThemeId): string | undefined {
  return cours[`./cours/${theme}.md`]
}

export const ORDRE_THEMES: ThemeId[] = THEMES.map((t) => t.id)

/** Photos réelles (Wikimedia Commons, Mapillary) avec leurs crédits, par identifiant de question. */
export const PHOTOS: Record<string, CreditPhoto> = photos

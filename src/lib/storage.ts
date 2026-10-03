import type { AppState, ExamResult, Question, Settings } from '../types'
import { majStat } from './adaptive'

export const CLE_STOCKAGE = 'feu-rouge:v1'

export const REGLAGES_PAR_DEFAUT: Settings = {
  region: 'wallonie',
  dateExamen: null,
  themesPrioritaires: [],
  chronoMinutes: 30,
  objectifJour: 30,
  apparence: 'sombre',
  formatExamen: 'officiel',
  lectureAudio: true,
}

export function etatInitial(): AppState {
  return {
    version: 1,
    settings: { ...REGLAGES_PAR_DEFAUT },
    stats: {},
    examens: [],
    positionnementFait: false,
    activite: {},
    badgesVus: [],
  }
}

export function jourCle(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const j = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${j}`
}

/** Vérifie et complète un état lu (stockage ou fichier importé). Lève une erreur s'il est invalide. */
export function valider(brut: unknown): AppState {
  if (!brut || typeof brut !== 'object') throw new Error('Le fichier ne contient pas de sauvegarde Feu Rouge.')
  const o = brut as Partial<AppState>
  if (o.version !== 1) throw new Error("Cette sauvegarde vient d'une version inconnue de Feu Rouge.")
  const base = etatInitial()
  return {
    version: 1,
    settings: { ...base.settings, ...(o.settings ?? {}) },
    stats: o.stats && typeof o.stats === 'object' ? o.stats : {},
    examens: Array.isArray(o.examens) ? o.examens : [],
    positionnementFait: Boolean(o.positionnementFait),
    activite: o.activite && typeof o.activite === 'object' ? o.activite : {},
    badgesVus: Array.isArray(o.badgesVus) ? o.badgesVus : [],
  }
}

export function charger(storage: Pick<Storage, 'getItem'> | undefined = safeStorage()): AppState {
  try {
    const txt = storage?.getItem(CLE_STOCKAGE)
    return txt ? valider(JSON.parse(txt)) : etatInitial()
  } catch {
    return etatInitial()
  }
}

export function sauver(state: AppState, storage: Pick<Storage, 'setItem'> | undefined = safeStorage()): void {
  try {
    storage?.setItem(CLE_STOCKAGE, JSON.stringify(state))
  } catch {
    // Stockage plein ou bloqué (navigation privée) : on continue sans sauvegarder.
  }
}

function safeStorage(): Storage | undefined {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : undefined
  } catch {
    return undefined
  }
}

export function exporter(state: AppState): string {
  return JSON.stringify({ ...state, exporteLe: new Date().toISOString() }, null, 2)
}

export function importer(texte: string): AppState {
  let brut: unknown
  try {
    brut = JSON.parse(texte)
  } catch {
    throw new Error("Ce fichier n'est pas une sauvegarde valide (format JSON attendu).")
  }
  return valider(brut)
}

// ---- Mises à jour pures de l'état ----

export function enregistrerReponse(state: AppState, q: Question, juste: boolean, maintenant = Date.now()): AppState {
  const jour = jourCle(new Date(maintenant))
  return {
    ...state,
    stats: { ...state.stats, [q.id]: majStat(state.stats[q.id], juste, maintenant) },
    activite: { ...state.activite, [jour]: (state.activite[jour] ?? 0) + 1 },
  }
}

export function enregistrerExamen(state: AppState, r: ExamResult): AppState {
  return { ...state, examens: [...state.examens, r].slice(-100) }
}

export function majReglages(state: AppState, patch: Partial<Settings>): AppState {
  return { ...state, settings: { ...state.settings, ...patch } }
}

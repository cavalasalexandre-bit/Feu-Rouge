import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AppState } from '../types'
import { charger, sauver } from './storage'

interface StoreValue {
  state: AppState
  /** Applique une fonction de mise à jour pure et sauvegarde le résultat. */
  update: (fn: (s: AppState) => AppState) => void
  remplacer: (s: AppState) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => charger())

  useEffect(() => {
    sauver(state)
  }, [state])

  // Apparence : sombre (par défaut), clair, ou selon le réglage du système.
  const apparence = state.settings.apparence
  useEffect(() => {
    const racine = document.documentElement
    if (apparence !== 'auto') {
      racine.dataset.theme = apparence
      return
    }
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const appliquer = () => (racine.dataset.theme = mq.matches ? 'clair' : 'sombre')
    appliquer()
    mq.addEventListener('change', appliquer)
    return () => mq.removeEventListener('change', appliquer)
  }, [apparence])

  const update = useCallback((fn: (s: AppState) => AppState) => setState((s) => fn(s)), [])
  const remplacer = useCallback((s: AppState) => setState(s), [])

  return <StoreContext.Provider value={{ state, update, remplacer }}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const v = useContext(StoreContext)
  if (!v) throw new Error('useStore doit être utilisé dans <StoreProvider>')
  return v
}

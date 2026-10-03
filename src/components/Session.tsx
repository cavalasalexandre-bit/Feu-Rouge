import { useCallback, useEffect, useRef, useState } from 'react'
import type { Question } from '../types'
import { examenPerdu, type Reponse } from '../lib/scoring'
import { enregistrerReponse } from '../lib/storage'
import { useStore } from '../lib/store'
import { QuestionCard } from './QuestionCard'

export type ModeSession = 'entrainement' | 'examen' | 'test'

export interface FinSession {
  reponses: Reponse[]
  dureeSec: number
  /** Examen arrêté parce que 41/50 n'était plus atteignable. */
  arrete: boolean
  tempsEcoule: boolean
}

interface Props {
  questions: Question[]
  mode: ModeSession
  /** Durée en minutes pour l'examen (0 ou absent = pas de chrono). */
  chronoMinutes?: number
  onTermine: (fin: FinSession) => void
  onQuitter: () => void
}

function formatTemps(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Déroulé d'une série de questions.
 * - entraînement : correction et explication après chaque réponse ;
 * - examen : pas de correction, pas de retour en arrière, chrono, arrêt anticipé comme au centre d'examen ;
 * - test : comme l'examen mais sans chrono ni arrêt (positionnement).
 */
export function Session({ questions, mode, chronoMinutes = 0, onTermine, onQuitter }: Props) {
  const { update } = useStore()
  const [index, setIndex] = useState(0)
  const [selection, setSelection] = useState<number | null>(null)
  const [corrige, setCorrige] = useState(false)
  const [reponses, setReponses] = useState<Reponse[]>([])
  const debut = useRef(Date.now())
  const limite = mode === 'examen' && chronoMinutes > 0 ? chronoMinutes * 60 : 0
  const [restant, setRestant] = useState(limite)
  const termine = useRef(false)

  const question = questions[index]
  const derniere = index === questions.length - 1

  const finir = useCallback(
    (toutes: Reponse[], opts: { arrete?: boolean; tempsEcoule?: boolean } = {}) => {
      if (termine.current) return
      termine.current = true
      if (mode !== 'entrainement') {
        update((s) => toutes.reduce((acc, r) => enregistrerReponse(acc, r.question, r.choix === r.question.bonne), s))
      }
      onTermine({
        reponses: toutes,
        dureeSec: Math.round((Date.now() - debut.current) / 1000),
        arrete: Boolean(opts.arrete),
        tempsEcoule: Boolean(opts.tempsEcoule),
      })
    },
    [mode, onTermine, update],
  )

  // Chrono de l'examen : à zéro, les questions restantes comptent comme sans réponse.
  const reponsesRef = useRef(reponses)
  reponsesRef.current = reponses
  useEffect(() => {
    if (!limite) return
    const id = window.setInterval(() => {
      const ecoule = Math.floor((Date.now() - debut.current) / 1000)
      const reste = Math.max(0, limite - ecoule)
      setRestant(reste)
      if (reste === 0) {
        window.clearInterval(id)
        const deja = reponsesRef.current
        const manquantes = questions.slice(deja.length).map((q) => ({ question: q, choix: null }))
        finir([...deja, ...manquantes], { tempsEcoule: true })
      }
    }, 500)
    return () => window.clearInterval(id)
  }, [limite, questions, finir])

  const valider = useCallback(() => {
    if (!question) return
    if (mode === 'entrainement') {
      if (!corrige) {
        if (selection === null) return
        setCorrige(true)
        update((s) => enregistrerReponse(s, question, selection === question.bonne))
        setReponses((r) => [...r, { question, choix: selection }])
        return
      }
      if (derniere) {
        finir(reponses)
        return
      }
      setIndex((i) => i + 1)
      setSelection(null)
      setCorrige(false)
      return
    }
    // Examen et test : on enregistre et on passe à la suivante.
    if (selection === null) return
    const toutes = [...reponses, { question, choix: selection }]
    setReponses(toutes)
    if (mode === 'examen' && examenPerdu(toutes)) {
      finir(toutes, { arrete: true })
      return
    }
    if (derniere) {
      finir(toutes)
      return
    }
    setIndex((i) => i + 1)
    setSelection(null)
  }, [question, mode, corrige, selection, derniere, reponses, finir, update])

  // Raccourcis clavier : 1 à 4 ou A à D pour choisir, Entrée pour valider.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      const i = ['1', '2', '3', '4'].indexOf(k) >= 0 ? Number(k) - 1 : ['a', 'b', 'c', 'd'].indexOf(k)
      if (i >= 0 && question && i < question.choix.length && !corrige) {
        setSelection(i)
        e.preventDefault()
      } else if (k === 'enter') {
        valider()
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [question, corrige, valider])

  if (!question) return null

  const libelleBouton =
    mode === 'entrainement'
      ? !corrige
        ? 'Valider'
        : derniere
          ? 'Voir le résultat'
          : 'Question suivante'
      : derniere
        ? 'Terminer'
        : 'Valider et continuer'

  return (
    <div className="session">
      <div className="session-head">
        <span className="num muted">
          {index + 1}/{questions.length}
        </span>
        <div className="progress" aria-hidden="true">
          <span style={{ width: `${((index + (corrige ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>
        {limite > 0 && (
          <span className={restant < 120 ? 'timer low' : 'timer'} aria-label="Temps restant">
            {formatTemps(restant)}
          </span>
        )}
      </div>

      <QuestionCard
        question={question}
        selection={selection}
        onSelect={setSelection}
        corrige={corrige}
        montrerGravite={mode === 'entrainement'}
      />

      <div className="session-foot">
        <button type="button" className="btn btn-ghost" onClick={onQuitter}>
          Quitter
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={valider}
          disabled={selection === null && !corrige}
        >
          {libelleBouton}
        </button>
      </div>
      {mode === 'examen' && (
        <p className="muted" style={{ marginTop: 12, fontSize: '0.9rem' }}>
          Comme à l'examen : pas de retour en arrière, et l'épreuve s'arrête dès que 41/50 n'est plus possible.
        </p>
      )}
    </div>
  )
}

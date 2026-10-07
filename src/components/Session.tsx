import { useCallback, useEffect, useRef, useState } from 'react'
import type { Question } from '../types'
import type { Reponse } from '../lib/scoring'
import { enregistrerReponse } from '../lib/storage'
import { useStore } from '../lib/store'
import { QuestionCard } from './QuestionCard'
import { arreterLecture, dureeLectureEstimee, lire, texteALire, voixDisponible } from '../lib/voix'

export type ModeSession = 'entrainement' | 'examen' | 'test'

export interface FinSession {
  reponses: Reponse[]
  dureeSec: number
  tempsEcoule: boolean
}

interface Props {
  questions: Question[]
  mode: ModeSession
  /** Durée en minutes pour l'examen (0 ou absent = pas de chrono global). */
  chronoMinutes?: number
  /** Format officiel : secondes pour répondre après la lecture de chaque question (0 = désactivé). */
  secondesParQuestion?: number
  /** Lit chaque question à voix haute avant de lancer le décompte. */
  lectureAuto?: boolean
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
 * - examen : pas de correction, pas de retour en arrière, toujours jusqu'à la dernière question ;
 *   en format officiel, chaque question est lue puis on a 15 secondes (sans réponse = faute) ;
 * - test : comme l'examen mais sans chrono ni arrêt (positionnement).
 */
export function Session({ questions, mode, chronoMinutes = 0, secondesParQuestion = 0, lectureAuto = false, onTermine, onQuitter }: Props) {
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
    (toutes: Reponse[], opts: { tempsEcoule?: boolean } = {}) => {
      if (termine.current) return
      termine.current = true
      if (mode !== 'entrainement') {
        update((s) => toutes.reduce((acc, r) => enregistrerReponse(acc, r.question, r.choix === r.question.bonne), s))
      }
      onTermine({
        reponses: toutes,
        dureeSec: Math.round((Date.now() - debut.current) / 1000),
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

  /** Examen et test : enregistre la réponse (ou l'absence de réponse) et passe à la suivante. */
  const avancer = useCallback(
    (choix: number | null) => {
      if (!question || termine.current) return
      const toutes = [...reponses, { question, choix }]
      setReponses(toutes)
      if (derniere) {
        finir(toutes)
        return
      }
      setIndex((i) => i + 1)
      setSelection(null)
    },
    [question, reponses, mode, derniere, finir],
  )

  // Format officiel : lecture de la question, puis décompte ; à zéro, on passe avec la réponse cochée (ou aucune).
  const [phase, setPhase] = useState<'lecture' | 'reponse'>('reponse')
  const [restantQ, setRestantQ] = useState(secondesParQuestion)
  const selectionRef = useRef(selection)
  selectionRef.current = selection
  const avancerRef = useRef(avancer)
  avancerRef.current = avancer
  useEffect(() => {
    const q = questions[index]
    if (!secondesParQuestion || !q) return
    let annule = false
    let intervalle: number | undefined
    setPhase('lecture')
    setRestantQ(secondesParQuestion)
    const texte = texteALire(q.question, q.choix)
    const lecture =
      lectureAuto && voixDisponible()
        ? lire(texte)
        : new Promise<void>((r) => window.setTimeout(r, dureeLectureEstimee(texte) * 1000))
    lecture.then(() => {
      if (annule) return
      setPhase('reponse')
      const t0 = Date.now()
      intervalle = window.setInterval(() => {
        const reste = Math.max(0, secondesParQuestion - Math.floor((Date.now() - t0) / 1000))
        setRestantQ(reste)
        if (reste === 0) {
          window.clearInterval(intervalle)
          avancerRef.current(selectionRef.current)
        }
      }, 250)
    })
    return () => {
      annule = true
      window.clearInterval(intervalle)
      arreterLecture()
    }
  }, [index, questions, secondesParQuestion, lectureAuto])

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
    avancer(selection)
  }, [question, mode, corrige, selection, derniere, reponses, finir, update, avancer])

  // Raccourcis clavier : 1 à 4 ou A à D pour choisir, Entrée pour valider.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Pas de raccourci quand on écrit (formulaire de signalement, réglages…).
      const cible = e.target instanceof Element ? e.target : null
      if (cible?.closest('input, textarea, select, .signaler') || e.metaKey || e.ctrlKey || e.altKey) return
      // Formulaire de signalement ouvert : on ne passe pas à la question suivante par accident.
      if (document.querySelector('.signaler')) return
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
        {secondesParQuestion > 0 &&
          (phase === 'lecture' ? (
            <span className="timer lecture" aria-live="polite">
              {lectureAuto && voixDisponible() ? 'Lecture…' : 'Lis la question'}
            </span>
          ) : (
            <span className={restantQ <= 5 ? 'timer low' : 'timer'} aria-label={`${restantQ} secondes pour répondre`}>
              0:{String(restantQ).padStart(2, '0')}
            </span>
          ))}
      </div>

      <QuestionCard
        question={question}
        selection={selection}
        onSelect={setSelection}
        corrige={corrige}
        montrerGravite={mode === 'entrainement'}
        ecouter={mode !== 'examen' || !secondesParQuestion}
        numero={index + 1}
        total={questions.length}
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
          {secondesParQuestion > 0
            ? `Comme à l'examen : la question est lue, puis tu as ${secondesParQuestion} secondes. Tu peux changer d'avis jusqu'à la fin du décompte. Pas de retour en arrière.`
            : "Comme à l'examen : pas de retour en arrière."}
        </p>
      )}
    </div>
  )
}

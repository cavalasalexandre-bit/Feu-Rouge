import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { QUESTIONS } from '../data'
import { questionsAReviser, tirageAdaptatif } from '../lib/adaptive'
import { shuffle } from '../lib/random'
import { useStore } from '../lib/store'
import { Session, type FinSession } from '../components/Session'
import { Resultats } from '../components/Resultats'
import type { AppState, Question, ThemeId } from '../types'
import { THEMES } from '../data/themes'

const IDS_THEMES = new Set<string>(THEMES.map((t) => t.id))

/** Construit la série à partir de l'adresse : ?source=erreurs | ?themes=a,b&n=10&graves=1 */
function construire(params: URLSearchParams, state: AppState): Question[] {
  const n = Math.min(50, Math.max(5, Number(params.get('n')) || 10))
  if (params.get('source') === 'erreurs') {
    return shuffle(questionsAReviser(QUESTIONS, state.stats)).slice(0, n)
  }
  const themes = (params.get('themes') ?? '')
    .split(',')
    .filter((t): t is ThemeId => IDS_THEMES.has(t))
  return tirageAdaptatif(QUESTIONS, state, n, {
    themes: themes.length ? themes : undefined,
    gravesSeulement: params.get('graves') === '1',
  })
}

export function Entrainement() {
  const [params] = useSearchParams()
  const { state } = useStore()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState(() => construire(params, state))
  const [fin, setFin] = useState<FinSession | null>(null)
  const [serie, setSerie] = useState(0)

  if (questions.length === 0) {
    return (
      <div className="session stack">
        <h1>Rien à réviser ici</h1>
        <p className="muted">
          {params.get('source') === 'erreurs'
            ? 'Tu n’as aucune erreur en attente. Lance un quiz ou un examen blanc.'
            : 'Aucune question ne correspond à ces critères.'}
        </p>
        <div className="row">
          <Link className="btn btn-primary" to="/quiz">
            Choisir un quiz
          </Link>
        </div>
      </div>
    )
  }

  if (fin) {
    return (
      <Resultats
        reponses={fin.reponses}
        mode="entrainement"
        onRecommencer={() => {
          setQuestions(construire(params, state))
          setFin(null)
          setSerie((s) => s + 1)
          window.scrollTo(0, 0)
        }}
      />
    )
  }

  return (
    <Session
      key={serie}
      questions={questions}
      mode="entrainement"
      onTermine={(f) => {
        setFin(f)
        window.scrollTo(0, 0)
      }}
      onQuitter={() => navigate(-1)}
    />
  )
}

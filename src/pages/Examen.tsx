import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QUESTIONS } from '../data'
import { tirageExamen, type ModeExamen } from '../lib/adaptive'
import { resultatExamen, EXAMEN } from '../lib/scoring'
import { enregistrerExamen } from '../lib/storage'
import { useStore } from '../lib/store'
import { Session, type FinSession } from '../components/Session'
import { Resultats } from '../components/Resultats'
import type { Question } from '../types'

export function Examen() {
  const { state, update } = useStore()
  const navigate = useNavigate()
  const [mode, setMode] = useState<ModeExamen>('officiel')
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [fin, setFin] = useState<FinSession | null>(null)
  const [essai, setEssai] = useState(0)
  const chrono = state.settings.chronoMinutes

  function demarrer() {
    setQuestions(tirageExamen(QUESTIONS, state, mode))
    setFin(null)
    setEssai((e) => e + 1)
    window.scrollTo(0, 0)
  }

  if (fin) {
    return (
      <Resultats
        reponses={fin.reponses}
        mode="examen"
        arrete={fin.arrete}
        tempsEcoule={fin.tempsEcoule}
        dureeSec={fin.dureeSec}
        onRecommencer={demarrer}
      />
    )
  }

  if (questions) {
    return (
      <Session
        key={essai}
        questions={questions}
        mode="examen"
        chronoMinutes={chrono}
        onTermine={(f) => {
          update((s) => enregistrerExamen(s, resultatExamen(f.reponses, f.dureeSec)))
          setFin(f)
          window.scrollTo(0, 0)
        }}
        onQuitter={() => {
          setQuestions(null)
          navigate('/examen')
        }}
      />
    )
  }

  return (
    <div className="session stack-lg">
      <header className="stack" style={{ gap: 8 }}>
        <p className="eyebrow">Examen blanc</p>
        <h1>Dans les conditions du jour J</h1>
      </header>

      <section className="panel stack">
        <h2>Les règles</h2>
        <div className="table-wrap prose" style={{ maxWidth: 'none' }}>
          <table>
            <tbody>
              <tr>
                <th>Questions</th>
                <td className="num">{EXAMEN.questions}</td>
              </tr>
              <tr>
                <th>Pour réussir</th>
                <td className="num">
                  {EXAMEN.seuil}/{EXAMEN.questions}
                </td>
              </tr>
              <tr>
                <th>Faute simple</th>
                <td className="num">−{EXAMEN.penaliteSimple}</td>
              </tr>
              <tr>
                <th>Faute grave</th>
                <td>
                  <span className="num">−{EXAMEN.penaliteGrave}</span> (deux fautes graves = échec)
                </td>
              </tr>
              <tr>
                <th>Chrono</th>
                <td>{chrono > 0 ? `${chrono} minutes` : 'Désactivé'} (modifiable dans les réglages)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="muted">
          Pas de retour en arrière, gravité des questions cachée, et l'épreuve s'arrête dès que 41/50 n'est plus atteignable.
        </p>
      </section>

      <fieldset className="field">
        <legend>Type d'examen</legend>
        <div className="grid-2">
          <label className="check" style={{ alignItems: 'flex-start' }}>
            <input type="radio" name="mode" id="mode-officiel" checked={mode === 'officiel'} onChange={() => setMode('officiel')} />
            <span>
              <strong>Officiel</strong>
              <br />
              <span className="muted">Questions réparties sur tout le programme, comme au centre d'examen.</span>
            </span>
          </label>
          <label className="check" style={{ alignItems: 'flex-start' }}>
            <input type="radio" name="mode" id="mode-cible" checked={mode === 'cible'} onChange={() => setMode('cible')} />
            <span>
              <strong>Ciblé sur mes faiblesses</strong>
              <br />
              <span className="muted">Plus de questions dans tes thèmes faibles et sur tes erreurs.</span>
            </span>
          </label>
        </div>
      </fieldset>

      <div className="row">
        <button type="button" className="btn btn-primary" onClick={demarrer}>
          Commencer l'examen
        </button>
      </div>
    </div>
  )
}

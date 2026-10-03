import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QUESTIONS } from '../data'
import { THEMES } from '../data/themes'
import { maitriseParTheme } from '../lib/adaptive'
import { useStore } from '../lib/store'
import { Feu, niveauTheme, libelleNiveau } from '../components/Feu'
import type { ThemeId } from '../types'

const NOMBRES = [10, 20, 30]

export function Quiz() {
  const { state } = useStore()
  const navigate = useNavigate()
  const maitrise = maitriseParTheme(QUESTIONS, state.stats)
  const [choisis, setChoisis] = useState<ThemeId[]>([])
  const [n, setN] = useState(10)
  const [graves, setGraves] = useState(false)

  function lancer(themes: ThemeId[], nombre = n, gravesSeules = graves) {
    const p = new URLSearchParams()
    if (themes.length) p.set('themes', themes.join(','))
    p.set('n', String(nombre))
    if (gravesSeules) p.set('graves', '1')
    navigate(`/entrainement?${p.toString()}`)
  }

  function basculer(t: ThemeId) {
    setChoisis((c) => (c.includes(t) ? c.filter((x) => x !== t) : [...c, t]))
  }

  return (
    <div className="stack-lg">
      <header className="stack" style={{ gap: 8 }}>
        <p className="eyebrow">Entraînement</p>
        <h1>Quiz</h1>
        <p className="muted">Correction et explication après chaque question. Tes réponses mettent ton profil à jour.</p>
      </header>

      <section className="grid-2">
        <button type="button" className="task" onClick={() => lancer([], 20, false)} style={{ textAlign: 'left', font: 'inherit' }}>
          <span className="task-icon blue">20</span>
          <span className="task-body">
            <strong>Révision intelligente</strong>
            <span className="muted">Tout le programme, en insistant sur tes points faibles.</span>
          </span>
          <span className="task-arrow">›</span>
        </button>
        <button type="button" className="task" onClick={() => lancer([], 15, true)} style={{ textAlign: 'left', font: 'inherit' }}>
          <span className="task-icon red">▲</span>
          <span className="task-body">
            <strong>Spécial fautes graves</strong>
            <span className="muted">Uniquement les questions qui coûtent 5 points.</span>
          </span>
          <span className="task-arrow">›</span>
        </button>
      </section>

      <section className="panel stack">
        <h2>Quiz à la carte</h2>
        <fieldset className="stack" style={{ gap: 10 }}>
          <legend className="eyebrow" style={{ marginBottom: 10 }}>
            Thèmes (aucun = tous)
          </legend>
          <div className="grid-3">
            {THEMES.map((t) => {
              const m = maitrise.get(t.id)
              const niv = niveauTheme(m?.precision ?? 0.5, m?.vues ?? 0)
              return (
                <label key={t.id} className="check">
                  <input type="checkbox" id={`theme-${t.id}`} checked={choisis.includes(t.id)} onChange={() => basculer(t.id)} />
                  <span style={{ flex: 1, minWidth: 0 }}>{t.court}</span>
                  <Feu niveau={niv} label={libelleNiveau(niv)} />
                </label>
              )
            })}
          </div>
        </fieldset>

        <div className="row" style={{ gap: 24, alignItems: 'flex-end' }}>
          <fieldset className="field">
            <legend>Nombre de questions</legend>
            <div className="seg">
              {NOMBRES.map((v) => (
                <label key={v}>
                  <input type="radio" name="nombre" id={`nombre-${v}`} checked={n === v} onChange={() => setN(v)} />
                  <span className="num">{v}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="check" style={{ alignSelf: 'flex-end' }}>
            <input type="checkbox" id="graves-seules" checked={graves} onChange={(e) => setGraves(e.target.checked)} />
            Fautes graves seulement
          </label>
        </div>

        <div className="row">
          <button type="button" className="btn btn-primary" onClick={() => lancer(choisis)}>
            Lancer le quiz
          </button>
          {choisis.length > 0 && (
            <button type="button" className="btn btn-ghost" onClick={() => setChoisis([])}>
              Tout désélectionner
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

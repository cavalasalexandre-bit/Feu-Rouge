import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { QUESTIONS } from '../data'
import { THEME_PAR_ID } from '../data/themes'
import { tirageEquilibre, maitriseParTheme } from '../lib/adaptive'
import { majReglages } from '../lib/storage'
import { useStore } from '../lib/store'
import { Session, type FinSession } from '../components/Session'
import { Resultats } from '../components/Resultats'
import { Feu, niveauTheme } from '../components/Feu'
import type { ThemeId } from '../types'

const NOMBRE = 30

export function Positionnement() {
  const { state, update } = useStore()
  const navigate = useNavigate()
  const [etape, setEtape] = useState<'intro' | 'test' | 'fin'>('intro')
  const [questions, setQuestions] = useState(() => tirageEquilibre(QUESTIONS, NOMBRE))
  const [fin, setFin] = useState<FinSession | null>(null)
  const [marques, setMarques] = useState(false)

  if (etape === 'intro') {
    return (
      <div className="session stack">
        <p className="eyebrow">Test de positionnement</p>
        <h1>Où en es-tu ?</h1>
        <p>
          {NOMBRE} questions réparties sur les 12 thèmes du programme. Pas de chrono, pas de correction pendant le test : réponds comme à
          l'examen. À la fin, tu vois tes thèmes forts et faibles, et toutes les révisions s'adaptent.
        </p>
        <p className="muted">Compte environ 10 minutes.</p>
        <div className="row">
          <button type="button" className="btn btn-primary" onClick={() => setEtape('test')}>
            Commencer le test
          </button>
          <Link className="btn btn-ghost" to="/tableau">
            Plus tard
          </Link>
        </div>
      </div>
    )
  }

  if (etape === 'test') {
    return (
      <Session
        questions={questions}
        mode="test"
        onTermine={(f) => {
          setFin(f)
          update((s) => ({ ...s, positionnementFait: true }))
          setEtape('fin')
          window.scrollTo(0, 0)
        }}
        onQuitter={() => navigate('/')}
      />
    )
  }

  // Profil calculé sur les réponses du test uniquement, du plus faible au plus fort.
  const parTheme = new Map<ThemeId, { justes: number; total: number }>()
  for (const r of fin!.reponses) {
    const cur = parTheme.get(r.question.theme) ?? { justes: 0, total: 0 }
    cur.total++
    if (r.choix === r.question.bonne) cur.justes++
    parTheme.set(r.question.theme, cur)
  }
  const maitrise = maitriseParTheme(QUESTIONS, state.stats)
  const profil = [...parTheme.entries()].sort((a, b) => a[1].justes / a[1].total - b[1].justes / b[1].total)
  const faibles = profil.filter(([, v]) => v.justes < v.total).slice(0, 3).map(([t]) => t)

  return (
    <Resultats
      reponses={fin!.reponses}
      mode="test"
      onRecommencer={() => {
        setQuestions(tirageEquilibre(QUESTIONS, NOMBRE))
        setEtape('test')
      }}
    >
      <section className="panel stack">
        <h2>Ton profil</h2>
        <div>
          {profil.map(([t, v]) => {
            const m = maitrise.get(t)
            return (
              <div key={t} className="theme-row">
                <Feu niveau={niveauTheme(m?.precision ?? 0.5, m?.vues ?? 0)} />
                <span className="name">{THEME_PAR_ID[t].titre}</span>
                <span className="num muted">
                  {v.justes}/{v.total}
                </span>
              </div>
            )
          })}
        </div>
        {faibles.length > 0 && (
          <div className="notice stack" style={{ gap: 10 }}>
            <p>
              Thèmes à travailler en priorité : <strong>{faibles.map((t) => THEME_PAR_ID[t].court).join(', ')}</strong>.
            </p>
            {marques ? (
              <p>
                <strong>C'est noté.</strong> Ces thèmes reviendront plus souvent. Tu peux changer ce choix dans les réglages.
              </p>
            ) : (
              <div className="row">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    update((s) => majReglages(s, { themesPrioritaires: faibles }))
                    setMarques(true)
                  }}
                >
                  En faire mes thèmes prioritaires
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </Resultats>
  )
}

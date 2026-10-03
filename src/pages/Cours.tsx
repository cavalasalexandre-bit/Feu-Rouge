import { Link, Navigate, useParams } from 'react-router-dom'
import { QUESTIONS, coursDuTheme, questionsDuTheme } from '../data'
import { THEMES, THEME_PAR_ID } from '../data/themes'
import { maitriseParTheme } from '../lib/adaptive'
import { useStore } from '../lib/store'
import { Feu, niveauTheme } from '../components/Feu'
import { Markdown } from '../components/Markdown'
import type { ThemeId } from '../types'

export function Cours() {
  const { state } = useStore()
  const maitrise = maitriseParTheme(QUESTIONS, state.stats)
  const prio = new Set(state.settings.themesPrioritaires)

  return (
    <div className="stack-lg">
      <header className="stack" style={{ gap: 8 }}>
        <p className="eyebrow">Théorie</p>
        <h1>Cours</h1>
        <p className="muted">Une fiche courte par thème, avec les chiffres à connaître par cœur.</p>
      </header>
      <div className="grid-3">
        {THEMES.map((t) => {
          const m = maitrise.get(t.id)
          return (
            <Link key={t.id} to={`/cours/${t.id}`} className="theme-card">
              <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
                <Feu niveau={niveauTheme(m?.precision ?? 0.5, m?.vues ?? 0)} />
                {prio.has(t.id) && <span className="chip chip-grave">Prioritaire</span>}
              </div>
              <h3>{t.titre}</h3>
              <p className="muted" style={{ fontSize: '0.92rem' }}>
                {t.description}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function CoursTheme() {
  const { theme } = useParams()
  const info = theme ? THEME_PAR_ID[theme as ThemeId] : undefined
  if (!info) return <Navigate to="/cours" replace />
  const source = coursDuTheme(info.id) ?? `# ${info.titre}\n\nFiche en cours de rédaction.`
  const nb = questionsDuTheme(info.id).length
  const idx = THEMES.findIndex((t) => t.id === info.id)
  const suivant = THEMES[idx + 1]

  return (
    <div className="stack-lg">
      <Link to="/cours" className="btn btn-ghost" style={{ alignSelf: 'flex-start' }}>
        ‹ Tous les cours
      </Link>
      <article className="panel">
        <Markdown source={source} />
      </article>
      <section className="row">
        <Link className="btn btn-primary" to={`/entrainement?themes=${info.id}&n=10`}>
          S'entraîner sur ce thème ({nb} questions)
        </Link>
        {suivant && (
          <Link className="btn btn-secondary" to={`/cours/${suivant.id}`}>
            Fiche suivante : {suivant.court}
          </Link>
        )}
      </section>
    </div>
  )
}

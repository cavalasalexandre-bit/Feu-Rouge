import { Link } from 'react-router-dom'
import { QUESTIONS } from '../data'
import { THEME_PAR_ID } from '../data/themes'
import { themesFaibles, questionsAReviser } from '../lib/adaptive'
import { planDuJour, type Tache } from '../lib/plan'
import { EXAMEN } from '../lib/scoring'
import { useStore } from '../lib/store'
import { Feu, niveauTheme } from '../components/Feu'
import type { ExamResult } from '../types'

function lienTache(t: Tache): { to: string; titre: string; detail: string; icone: string; couleur: string } {
  switch (t.type) {
    case 'positionnement':
      return { to: '/positionnement', titre: 'Test de positionnement', detail: '30 questions pour trouver tes points faibles', icone: '30', couleur: 'blue' }
    case 'erreurs':
      return { to: `/entrainement?source=erreurs&n=${t.nombre}`, titre: 'Rattraper mes erreurs', detail: `${t.nombre} question${t.nombre > 1 ? 's' : ''} ratée${t.nombre > 1 ? 's' : ''}`, icone: '↺', couleur: 'amber' }
    case 'theme':
      return { to: `/entrainement?themes=${t.theme}&n=${t.nombre}`, titre: THEME_PAR_ID[t.theme].titre, detail: `Quiz de ${t.nombre} questions sur un thème faible`, icone: String(t.nombre), couleur: 'blue' }
    case 'graves':
      return { to: `/entrainement?graves=1&n=${t.nombre}`, titre: 'Spécial fautes graves', detail: 'Les questions qui coûtent 5 points', icone: '▲', couleur: 'red' }
    case 'examen':
      return { to: '/examen', titre: 'Examen blanc', detail: '50 questions, comme le jour J', icone: '50', couleur: 'green' }
  }
}

function Courbe({ examens }: { examens: ExamResult[] }) {
  const pts = examens.slice(-10)
  const W = 320
  const H = 130
  const pad = { l: 28, r: 10, t: 10, b: 20 }
  const min = Math.min(30, ...pts.map((e) => e.points))
  const y = (v: number) => pad.t + ((50 - v) / (50 - min)) * (H - pad.t - pad.b)
  const x = (i: number) => pad.l + (pts.length === 1 ? (W - pad.l - pad.r) / 2 : (i / (pts.length - 1)) * (W - pad.l - pad.r))
  const ligne = pts.map((e, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(e.points).toFixed(1)}`).join(' ')
  const aire = `${ligne} L${x(pts.length - 1).toFixed(1)} ${H - pad.b} L${x(0).toFixed(1)} ${H - pad.b} Z`
  const dernier = pts[pts.length - 1]

  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Scores des ${pts.length} derniers examens blancs`}>
      {[50, EXAMEN.seuil, min].map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke={v === EXAMEN.seuil ? 'var(--signal)' : 'var(--line)'} strokeDasharray={v === EXAMEN.seuil ? '4 3' : undefined} />
          <text x={pad.l - 6} y={y(v) + 4} textAnchor="end" fontSize={10} fill="var(--muted)" fontFamily="var(--font-mono)">
            {v}
          </text>
        </g>
      ))}
      {pts.length > 1 && <path d={aire} fill="var(--sign-blue)" opacity={0.12} />}
      {pts.length > 1 && <path d={ligne} fill="none" stroke="var(--sign-blue)" strokeWidth={2.5} strokeLinejoin="round" />}
      {pts.map((e, i) => (
        <circle key={i} cx={x(i)} cy={y(e.points)} r={i === pts.length - 1 ? 5 : 3} fill={e.reussi ? 'var(--go)' : 'var(--signal)'} stroke="var(--surface)" strokeWidth={1.5} />
      ))}
      <text x={W - pad.r} y={H - 4} textAnchor="end" fontSize={10} fill="var(--muted)" fontFamily="var(--font-mono)">
        dernier : {dernier.points}/50
      </text>
    </svg>
  )
}

export function TableauDeBord() {
  const { state } = useStore()
  const plan = planDuJour(QUESTIONS, state)
  const faibles = themesFaibles(QUESTIONS, state)
  const erreurs = questionsAReviser(QUESTIONS, state.stats).length
  const totalReponses = Object.values(state.stats).reduce((n, s) => n + s.vues, 0)
  const vues = Object.keys(state.stats).length
  const reussis = state.examens.filter((e) => e.reussi).length
  const prio = new Set(state.settings.themesPrioritaires)
  const pctJour = Math.min(100, Math.round((plan.faitAujourdhui / Math.max(1, plan.objectif)) * 100))

  return (
    <div className="stack-lg">
      <header className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div className="stack" style={{ gap: 6 }}>
          <p className="eyebrow">Tableau de bord</p>
          <h1>Ton plan du jour</h1>
        </div>
        {plan.joursRestants !== null ? (
          <div className="countdown">
            <span className="big">{Math.max(0, plan.joursRestants)}</span>
            <span className="muted">{plan.joursRestants === 1 ? 'jour avant l’examen' : 'jours avant l’examen'}</span>
          </div>
        ) : (
          <Link to="/reglages" className="btn btn-ghost">
            Indiquer ma date d'examen
          </Link>
        )}
      </header>

      <div className="grid-2">
        <section className="stack">
          {plan.taches.map((t, i) => {
            const l = lienTache(t)
            return (
              <Link key={i} to={l.to} className="task">
                <span className={`task-icon ${l.couleur}`}>{l.icone}</span>
                <span className="task-body">
                  <strong>{l.titre}</strong>
                  <span className="muted">{l.detail}</span>
                </span>
                <span className="task-arrow">›</span>
              </Link>
            )
          })}
        </section>

        <section className="panel stack">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h3>Aujourd'hui</h3>
            <span className="num muted">
              {plan.faitAujourdhui}/{plan.objectif} questions
            </span>
          </div>
          <div className="bar" aria-label={`${pctJour} % de l'objectif du jour`}>
            <span style={{ width: `${pctJour}%` }} />
          </div>
          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            <div>
              <p className="eyebrow">Réponses</p>
              <p className="num" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                {totalReponses}
              </p>
            </div>
            <div>
              <p className="eyebrow">Vues</p>
              <p className="num" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                {vues}/{QUESTIONS.length}
              </p>
            </div>
            <div>
              <p className="eyebrow">Erreurs</p>
              <p className="num" style={{ fontSize: '1.4rem', fontWeight: 700, color: erreurs ? 'var(--signal)' : undefined }}>
                {erreurs}
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid-2">
        <section className="panel stack">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2>Mes thèmes</h2>
            <span className="muted" style={{ fontSize: '0.85rem' }}>
              du plus faible au plus fort
            </span>
          </div>
          <div>
            {faibles.map((m) => (
              <Link key={m.theme} to={`/entrainement?themes=${m.theme}&n=10`} className="theme-row">
                <Feu niveau={niveauTheme(m.precision, m.vues)} />
                <span style={{ minWidth: 0 }}>
                  <span className="name">{THEME_PAR_ID[m.theme].court}</span>
                  {prio.has(m.theme) && (
                    <span className="chip chip-grave" style={{ marginLeft: 8 }}>
                      Prioritaire
                    </span>
                  )}
                  <span className="bar" style={{ display: 'block' }}>
                    <span style={{ width: `${Math.round(m.maitrise * 100)}%` }} />
                  </span>
                </span>
                <span className="num muted" style={{ fontSize: '0.85rem' }}>
                  {m.vues ? `${Math.round(m.precision * 100)} %` : '—'}
                </span>
              </Link>
            ))}
          </div>
          <p className="muted" style={{ fontSize: '0.85rem' }}>
            La barre montre la part des questions maîtrisées (réussies 3 fois d'affilée). Le pourcentage est ton taux de bonnes réponses.
          </p>
        </section>

        <section className="panel stack">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2>Examens blancs</h2>
            {state.examens.length > 0 && (
              <span className="num muted">
                {reussis}/{state.examens.length} réussis
              </span>
            )}
          </div>
          {state.examens.length === 0 ? (
            <>
              <p className="muted">Aucun examen blanc pour l'instant. Ta courbe de scores apparaîtra ici, avec la barre des 41/50.</p>
              <div className="row">
                <Link className="btn btn-secondary" to="/examen">
                  Passer mon premier examen
                </Link>
              </div>
            </>
          ) : (
            <Courbe examens={state.examens} />
          )}
        </section>
      </div>
    </div>
  )
}

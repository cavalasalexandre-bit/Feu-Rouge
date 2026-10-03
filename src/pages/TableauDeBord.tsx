import { Link } from 'react-router-dom'
import { QUESTIONS } from '../data'
import { THEME_PAR_ID } from '../data/themes'
import { themesFaibles, questionsAReviser } from '../lib/adaptive'
import { planDuJour, type Tache } from '../lib/plan'
import { EXAMEN } from '../lib/scoring'
import { useStore } from '../lib/store'
import { Feu, niveauTheme, couleurNiveau } from '../components/Feu'
import { Compteur } from '../components/Compteur'
import { Icone, type NomIcone } from '../components/Icone'
import type { ExamResult } from '../types'

interface LienTache {
  to: string
  titre: string
  detail: string
  icone: NomIcone
  couleur: 'red' | 'amber' | 'blue' | 'green'
  duree: string
}

function lienTache(t: Tache): LienTache {
  switch (t.type) {
    case 'positionnement':
      return { to: '/positionnement', titre: 'Test de positionnement', detail: '30 questions pour allumer tes voyants', icone: 'demarrer', couleur: 'blue', duree: '~10 min' }
    case 'erreurs':
      return {
        to: `/entrainement?source=erreurs&n=${t.nombre}`,
        titre: 'Rattraper mes erreurs',
        detail: `${t.nombre} question${t.nombre > 1 ? 's' : ''} ratée${t.nombre > 1 ? 's' : ''}`,
        icone: 'erreurs',
        couleur: 'red',
        duree: `~${Math.max(2, Math.round(t.nombre * 0.4))} min`,
      }
    case 'theme':
      return { to: `/entrainement?themes=${t.theme}&n=${t.nombre}`, titre: THEME_PAR_ID[t.theme].titre, detail: `Quiz de ${t.nombre} questions sur un thème faible`, icone: 'cible', couleur: 'amber', duree: '~4 min' }
    case 'graves':
      return { to: `/entrainement?graves=1&n=${t.nombre}`, titre: 'Spécial fautes graves', detail: 'Les questions qui coûtent 5 points', icone: 'danger', couleur: 'red', duree: '~6 min' }
    case 'examen':
      return { to: '/examen', titre: 'Examen blanc', detail: '50 questions, comme le jour J', icone: 'valide', couleur: 'green', duree: '30 min' }
  }
}

const DATE = new Intl.DateTimeFormat('fr-BE', { weekday: 'long', day: 'numeric', month: 'long' })

function Courbe({ examens }: { examens: ExamResult[] }) {
  const pts = examens.slice(-10)
  const W = 520
  const H = 220
  const pad = { l: 40, r: 12, t: 14, b: 30 }
  const min = Math.min(30, ...pts.map((e) => e.points))
  const y = (v: number) => pad.t + ((50 - v) / (50 - min)) * (H - pad.t - pad.b)
  const x = (i: number) => pad.l + (pts.length === 1 ? (W - pad.l - pad.r) / 2 : (i / (pts.length - 1)) * (W - pad.l - pad.r))
  const ligne = pts.map((e, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(e.points).toFixed(1)}`).join(' ')
  const aire = `${ligne} L${x(pts.length - 1).toFixed(1)} ${y(min)} L${x(0).toFixed(1)} ${y(min)} Z`
  const dernier = pts[pts.length - 1]

  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Scores des ${pts.length} derniers examens blancs, seuil ${EXAMEN.seuil}`}>
      {[50, EXAMEN.seuil, min].map((v) => (
        <g key={v}>
          <line
            x1={pad.l}
            x2={W - pad.r}
            y1={y(v)}
            y2={y(v)}
            stroke={v === EXAMEN.seuil ? 'var(--signal)' : 'var(--line)'}
            strokeDasharray={v === EXAMEN.seuil ? '5 4' : undefined}
          />
          <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" fontSize={12} fill={v === EXAMEN.seuil ? 'var(--signal)' : 'var(--muted)'} fontFamily="var(--font-mono)">
            {v}
          </text>
        </g>
      ))}
      {pts.length > 1 && <path d={aire} fill="var(--cyan)" opacity={0.12} />}
      {pts.length > 1 && <path d={ligne} fill="none" stroke="var(--cyan)" strokeWidth={3} strokeLinejoin="round" />}
      {pts.map((e, i) => (
        <circle key={i} cx={x(i)} cy={y(e.points)} r={i === pts.length - 1 ? 7 : 4.5} fill={e.reussi ? 'var(--go)' : 'var(--signal)'} stroke="var(--surface)" strokeWidth={2} />
      ))}
      <text x={W - pad.r} y={H - 6} textAnchor="end" fontSize={12} fill="var(--muted)" fontFamily="var(--font-mono)">
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
  const vues = Object.keys(state.stats).length
  const reussis = state.examens.filter((e) => e.reussi).length
  const prio = new Set(state.settings.themesPrioritaires)
  const dernier = state.examens.at(-1)
  const nbSegments = Math.min(40, Math.max(10, plan.objectif))
  const faitsSegments = Math.round((Math.min(plan.faitAujourdhui, plan.objectif) / plan.objectif) * nbSegments)

  return (
    <div className="stack-lg">
      <header className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 20 }}>
        <div className="stack" style={{ gap: 6 }}>
          <p className="eyebrow">{DATE.format(new Date())}</p>
          <h1>Plan du jour</h1>
        </div>
        {plan.joursRestants !== null ? (
          <div className="countdown">
            <span className="big">{Math.max(0, plan.joursRestants)}</span>
            <span className="eyebrow">
              {plan.joursRestants === 1 ? 'jour avant' : 'jours avant'}
              <br />
              l'examen
            </span>
          </div>
        ) : (
          <Link to="/reglages" className="btn btn-secondary">
            Indiquer ma date d'examen
          </Link>
        )}
      </header>

      <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))' }}>
        <section className="stack" style={{ gap: 10 }}>
          {plan.taches.map((t, i) => {
            const l = lienTache(t)
            return (
              <Link key={i} to={l.to} className="task">
                <span className={`lamp ${l.couleur}`}>
                  <Icone nom={l.icone} />
                </span>
                <span className="task-body">
                  <strong>{l.titre}</strong>
                  <span className="muted">{l.detail}</span>
                </span>
                <span className="num muted task-duree" style={{ fontSize: '0.82rem' }}>
                  {l.duree}
                </span>
                <span className="task-arrow" aria-hidden="true">
                  <Icone nom="chevron" taille={18} />
                </span>
              </Link>
            )
          })}
        </section>

        <section className="panel stack">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2>Aujourd'hui</h2>
            <span className="num muted" style={{ fontSize: '0.85rem' }}>
              {plan.faitAujourdhui} / {plan.objectif} questions
            </span>
          </div>
          <div className="segments" role="img" aria-label={`${plan.faitAujourdhui} questions sur un objectif de ${plan.objectif}`}>
            {Array.from({ length: nbSegments }, (_, i) => (
              <span key={i} className={i < faitsSegments ? 'on' : undefined} />
            ))}
          </div>
          <div className="readouts">
            <div className="readout">
              <span className="eyebrow">Vues</span>
              <strong>
                {vues}
                <small>/{QUESTIONS.length}</small>
              </strong>
            </div>
            <div className="readout">
              <span className="eyebrow">Erreurs</span>
              <strong style={{ color: erreurs ? 'var(--signal)' : undefined }}>{erreurs}</strong>
            </div>
            <div className="readout">
              <span className="eyebrow">Examens</span>
              <strong>
                {reussis}
                <small>/{state.examens.length}</small>
              </strong>
            </div>
          </div>
          {dernier && (
            <div className="row" style={{ borderTop: '1px solid var(--line)', paddingTop: 16, gap: 16 }}>
              <Compteur score={dernier.points} detaille={false} largeur={96} />
              <div className="stack" style={{ gap: 2 }}>
                <span className="eyebrow">Dernier examen blanc</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.9rem', lineHeight: 1.1 }}>{dernier.points}/50</span>
                <span className="num" style={{ fontSize: '0.8rem', color: dernier.reussi ? 'var(--go)' : 'var(--signal)' }}>
                  {dernier.reussi ? 'RÉUSSI' : 'RATÉ'}
                </span>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 440px), 1fr))' }}>
        <section className="panel stack" style={{ gap: 6 }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <h2>Voyants des thèmes</h2>
            <span className="eyebrow">Du plus faible au plus fort</span>
          </div>
          <div>
            {faibles.map((m) => {
              const niv = niveauTheme(m.precision, m.vues)
              return (
                <Link key={m.theme} to={`/entrainement?themes=${m.theme}&n=10`} className="theme-row">
                  <Feu niveau={niv} />
                  <span style={{ minWidth: 0 }}>
                    <span className="name">{THEME_PAR_ID[m.theme].court}</span>
                    {prio.has(m.theme) && <span className="chip chip-accent">Prioritaire</span>}
                  </span>
                  <span className="bar" title="Part des questions maîtrisées">
                    <span style={{ width: `${Math.round(m.maitrise * 100)}%`, background: couleurNiveau(niv) }} />
                  </span>
                  <span className="num muted" style={{ fontSize: '0.82rem', textAlign: 'right' }}>
                    {m.vues ? `${Math.round(m.precision * 100)} %` : '—'}
                  </span>
                </Link>
              )
            })}
          </div>
          <p className="muted" style={{ fontSize: '0.82rem', marginTop: 8 }}>
            La barre montre la part des questions maîtrisées (réussies 3 fois d'affilée). Le pourcentage est ton taux de bonnes réponses.
          </p>
        </section>

        <section className="panel stack">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2>Examens blancs</h2>
            {state.examens.length > 0 && (
              <span className="num muted" style={{ fontSize: '0.82rem' }}>
                {state.examens.length} PASSÉS · {reussis} RÉUSSIS
              </span>
            )}
          </div>
          {state.examens.length === 0 ? (
            <p className="muted">Aucun examen blanc pour l'instant. Ta courbe de scores apparaîtra ici, avec la ligne des 41/50.</p>
          ) : (
            <Courbe examens={state.examens} />
          )}
          <div className="row">
            <Link className="btn btn-primary" to="/examen">
              Passer un examen blanc
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

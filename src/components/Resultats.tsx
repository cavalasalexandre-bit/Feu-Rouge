import { Link } from 'react-router-dom'
import { EXAMEN, estJuste, scoreExamen, type Reponse } from '../lib/scoring'
import { THEME_PAR_ID } from '../data/themes'
import type { ModeSession } from './Session'
import { Compteur } from './Compteur'

interface Props {
  reponses: Reponse[]
  mode: ModeSession
  arrete?: boolean
  tempsEcoule?: boolean
  dureeSec?: number
  onRecommencer?: () => void
  /** Contenu ajouté sous le verdict (ex. profil après le positionnement). */
  children?: React.ReactNode
}

function titreVerdict(points: number, reussi: boolean): string {
  const marge = points - EXAMEN.seuil
  if (!reussi) return `Il manque ${-marge} point${-marge > 1 ? 's' : ''}.`
  if (marge === 0) return 'Feu vert, de justesse.'
  return `Feu vert, avec ${marge} point${marge > 1 ? 's' : ''} de marge.`
}

function classe(r: Reponse): string {
  if (estJuste(r)) return ''
  if (r.choix === null) return 'skip'
  return r.question.grave ? 'f5' : 'f1'
}

export function Resultats({ reponses, mode, arrete, tempsEcoule, dureeSec, onRecommencer, children }: Props) {
  const score = scoreExamen(reponses)
  const erreurs = reponses.filter((r) => !estJuste(r))
  const estExamen = mode === 'examen'

  return (
    <div className="stack-lg session">
      <section className="panel stack">
        {estExamen ? (
          <div className="verdict">
            <Compteur score={score.points} largeur={250} />
            <div className="verdict-body">
              <span className={score.reussi ? 'chip chip-ok' : 'chip chip-grave'} style={{ alignSelf: 'flex-start' }}>
                {score.reussi ? 'Examen réussi' : 'Examen raté'}
              </span>
              <h1>{titreVerdict(score.points, score.reussi)}</h1>
              {(arrete || tempsEcoule) && (
                <p className="muted">
                  {arrete && 'L’épreuve s’est arrêtée : 41/50 n’était plus atteignable. '}
                  {tempsEcoule && 'Temps écoulé : les questions restantes comptent comme fautes.'}
                </p>
              )}
              <div className="readouts">
                <div className="readout">
                  <span className="eyebrow">Simples</span>
                  <strong style={{ color: 'var(--amber)' }}>
                    {score.fautesSimples} <small>× −1</small>
                  </strong>
                </div>
                <div className="readout">
                  <span className="eyebrow">Graves</span>
                  <strong style={{ color: 'var(--signal)' }}>
                    {score.fautesGraves} <small>× −5</small>
                  </strong>
                </div>
                <div className="readout">
                  <span className="eyebrow">Temps</span>
                  <strong>{dureeSec !== undefined ? `${Math.floor(dureeSec / 60)}:${String(dureeSec % 60).padStart(2, '0')}` : '—'}</strong>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="verdict">
            <div className="verdict-score">
              {score.justes}
              <small>/{reponses.length}</small>
            </div>
            <div className="verdict-body" style={{ gap: 6 }}>
              <h1>{mode === 'test' ? 'Positionnement terminé' : 'Série terminée'}</h1>
              <p className="muted">
                {erreurs.length === 0
                  ? 'Aucune erreur, bravo.'
                  : `${erreurs.length} erreur${erreurs.length > 1 ? 's' : ''}, dont ${erreurs.filter((r) => r.question.grave).length} sur des fautes graves. Elles reviendront dans tes révisions.`}
              </p>
            </div>
          </div>
        )}

        <div className="result-grid" aria-label="Détail des réponses">
          {reponses.map((r, i) => (
            <button
              key={r.question.id}
              type="button"
              className={classe(r)}
              onClick={() => document.getElementById(`corr-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              aria-label={`Question ${i + 1} : ${estJuste(r) ? 'juste' : 'fausse'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div className="row muted" style={{ fontSize: '0.85rem', gap: '6px 16px' }}>
          <span>
            <i className="dot" style={{ background: 'var(--go)' }} />
            Juste
          </span>
          <span>
            <i className="dot" style={{ background: 'var(--amber)' }} />
            Faute simple
          </span>
          <span>
            <i className="dot" style={{ background: 'var(--signal)' }} />
            Faute grave
          </span>
        </div>

        <div className="row">
          {onRecommencer && (
            <button type="button" className="btn btn-primary" onClick={onRecommencer}>
              Recommencer
            </button>
          )}
          {erreurs.length > 0 && (
            <Link className="btn btn-secondary" to="/erreurs">
              Revoir mes erreurs
            </Link>
          )}
          <Link className="btn btn-ghost" to="/tableau">
            Tableau de bord
          </Link>
        </div>
      </section>

      {children}

      {erreurs.length > 0 && (
        <section className="stack">
          <h2>Corrections</h2>
          {reponses.map((r, i) =>
            estJuste(r) ? null : (
              <article
                key={r.question.id}
                id={`corr-${i}`}
                className="panel stack"
              >
                <div className="row" style={{ gap: 8 }}>
                  <span className="chip num">Q{i + 1}</span>
                  <span className="chip">{THEME_PAR_ID[r.question.theme].court}</span>
                  {r.question.grave ? <span className="chip chip-grave">Faute grave · −5</span> : <span className="chip chip-simple">Faute simple · −1</span>}
                </div>
                <strong style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.1rem' }}>{r.question.question}</strong>
                <p>
                  <span className="muted">Ta réponse : </span>
                  {r.choix === null ? 'aucune' : r.question.choix[r.choix]}
                </p>
                <p>
                  <span className="muted">Bonne réponse : </span>
                  <strong style={{ color: 'var(--go)', fontWeight: 600 }}>{r.question.choix[r.question.bonne]}</strong>
                </p>
                <p className="muted">{r.question.explication}</p>
              </article>
            ),
          )}
        </section>
      )}
    </div>
  )
}

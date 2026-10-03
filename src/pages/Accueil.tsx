import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import { QUESTIONS } from '../data'
import { THEMES } from '../data/themes'

// Relevé d'exemple : 1 faute grave + 4 fautes simples = 41/50, réussi de justesse.
const EXEMPLE = Array.from({ length: 50 }, (_, i) => (i === 17 ? 'f5' : [6, 23, 31, 44].includes(i) ? 'f1' : 'ok'))

export function Accueil() {
  const { state } = useStore()
  const nouveau = !state.positionnementFait

  return (
    <div className="stack-lg">
      <section className="hero">
        <div>
          <p className="eyebrow">Permis B · Belgique</p>
          <h1>
            Passe ton théorique <em>sans griller</em> de feu.
          </h1>
          <p className="lead">
            Examens blancs notés comme au centre d'examen, cours clairs, et des révisions qui insistent là où tu perds des points.
          </p>
          <div className="row">
            {nouveau ? (
              <>
                <Link className="btn btn-primary" to="/positionnement">
                  Faire le test de positionnement
                </Link>
                <Link className="btn btn-secondary" to="/cours">
                  Voir les cours
                </Link>
              </>
            ) : (
              <>
                <Link className="btn btn-primary" to="/tableau">
                  Reprendre mes révisions
                </Link>
                <Link className="btn btn-secondary" to="/examen">
                  Lancer un examen blanc
                </Link>
              </>
            )}
          </div>
        </div>

        <aside className="bareme" aria-label="Barème de l'examen">
          <p className="eyebrow">Le barème officiel</p>
          <div className="bareme-grid" aria-hidden="true">
            {EXEMPLE.map((c, i) => (
              <span key={i} className={c} />
            ))}
          </div>
          <div className="bareme-legend">
            <span>
              <i className="dot" style={{ background: '#3cc574' }} />
              <b>50</b> questions
            </span>
            <span>
              <i className="dot" style={{ background: '#f2b441' }} />
              faute simple <b>−1</b>
            </span>
            <span>
              <i className="dot" style={{ background: '#e0323e' }} />
              faute grave <b>−5</b>
            </span>
          </div>
          <p style={{ marginTop: 12, fontSize: '0.95rem' }}>
            Il faut <b className="num">41/50</b>. Ici : 1 faute grave et 4 simples, réussi de justesse. Deux fautes graves, et c'est raté.
          </p>
        </aside>
      </section>

      <section className="grid-features">
        <div className="panel feature">
          <p className="eyebrow">1 · Positionnement</p>
          <h3>Tes points faibles en 10 minutes</h3>
          <p className="muted">30 questions sur tout le programme pour savoir par où commencer.</p>
        </div>
        <div className="panel feature">
          <p className="eyebrow">2 · Révision ciblée</p>
          <h3>Les erreurs reviennent</h3>
          <p className="muted">Une question ratée revient jusqu'à ce que tu la réussisses trois fois de suite.</p>
        </div>
        <div className="panel feature">
          <p className="eyebrow">3 · Examen blanc</p>
          <h3>Comme le jour J</h3>
          <p className="muted">50 questions, chrono, fautes graves cachées et arrêt anticipé sous 41/50.</p>
        </div>
      </section>

      <section className="panel-flat row" style={{ justifyContent: 'space-between' }}>
        <p>
          <strong className="num">{QUESTIONS.length}</strong> questions · <strong className="num">{THEMES.length}</strong> thèmes ·{' '}
          gratuit, sans compte. Ta progression reste sur ton appareil.
        </p>
        <Link className="btn btn-ghost" to="/reglages">
          Personnaliser
        </Link>
      </section>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import { QUESTIONS } from '../data'
import { THEMES } from '../data/themes'
import { maitriseParTheme } from '../lib/adaptive'
import { EXAMEN } from '../lib/scoring'
import { Compteur } from '../components/Compteur'
import { Feu, niveauTheme, libelleNiveau } from '../components/Feu'
import { Icone } from '../components/Icone'

export function Accueil() {
  const { state } = useStore()
  const nouveau = !state.positionnementFait
  const dernier = state.examens.at(-1)
  const maitrise = maitriseParTheme(QUESTIONS, state.stats)

  return (
    <div className="stack-lg">
      <section className="hero">
        <div>
          <p className="eyebrow" style={{ color: 'var(--accent-text)' }}>
            Permis B · Belgique · Examen théorique
          </p>
          <h1 style={{ marginTop: 14 }}>Règle tes compteurs avant le jour J.</h1>
          <p className="lead">
            Chaque réponse met ton tableau de bord à jour. Les voyants s'allument sur les thèmes qui te coûtent des points, et tes
            révisions vont droit dessus.
          </p>
          <div className="row">
            {nouveau ? (
              <>
                <Link className="btn btn-primary" to="/positionnement">
                  <Icone nom="demarrer" taille={20} />
                  Démarrer le test
                </Link>
                <Link className="btn btn-secondary" to="/cours">
                  Voir les cours
                </Link>
              </>
            ) : (
              <>
                <Link className="btn btn-primary" to="/tableau">
                  <Icone nom="compteur" taille={20} />
                  Mon tableau de bord
                </Link>
                <Link className="btn btn-secondary" to="/examen">
                  Examen blanc
                </Link>
              </>
            )}
          </div>
          <p className="muted" style={{ marginTop: 18, fontSize: '0.92rem' }}>
            Gratuit · sans compte · {QUESTIONS.length} questions · {THEMES.length} thèmes
          </p>
        </div>

        <aside className="panel hero-gauge" aria-label="Barème de l'examen">
          <Compteur score={dernier ? dernier.points : 44} largeur={340} />
          <div className="readouts" style={{ width: '100%' }}>
            <div className="readout">
              <span className="eyebrow">Faute simple</span>
              <strong style={{ color: 'var(--amber)' }}>−{EXAMEN.penaliteSimple}</strong>
            </div>
            <div className="readout">
              <span className="eyebrow">Faute grave</span>
              <strong style={{ color: 'var(--signal)' }}>−{EXAMEN.penaliteGrave}</strong>
            </div>
            <div className="readout">
              <span className="eyebrow">Pour réussir</span>
              <strong>
                {EXAMEN.seuil}
                <small>/{EXAMEN.questions}</small>
              </strong>
            </div>
          </div>
          <p className="muted" style={{ fontSize: '0.88rem', textAlign: 'center' }}>
            {dernier ? 'Ton dernier examen blanc.' : 'Exemple : une faute grave et une simple, réussi.'} Deux fautes graves, et c'est raté.
          </p>
        </aside>
      </section>

      <section className="band">
        <div className="band-inner stack">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h2 style={{ fontSize: '2rem' }}>Tes voyants</h2>
            <p className="muted">{nouveau ? 'Ils s’allument après le test de positionnement.' : 'Allumé = thème à travailler en priorité'}</p>
          </div>
          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 170px), 1fr))' }}>
            {THEMES.map((t) => {
              const m = maitrise.get(t.id)
              const niv = niveauTheme(m?.precision ?? 0.5, m?.vues ?? 0)
              return (
                <Link key={t.id} to={`/cours/${t.id}`} className="voyant-card" data-allume={niv === 0}>
                  <Feu niveau={niv} taille={14} />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.05rem' }}>{t.court}</span>
                  <span className="num" style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    {m?.vues ? `${Math.round(m.precision * 100)} % · ${libelleNiveau(niv).toLowerCase()}` : 'pas encore évalué'}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="stack">
        <h2 style={{ fontSize: '2rem' }}>Ordinateur de bord</h2>
        <div className="grid-features">
          <div className="feature">
            <p className="eyebrow">Étape 1</p>
            <h3>Diagnostic</h3>
            <p className="muted">30 questions sur les 12 thèmes. En 10 minutes, ton tableau de bord s'allume.</p>
          </div>
          <div className="feature">
            <p className="eyebrow">Étape 2</p>
            <h3>Entretien</h3>
            <p className="muted">Tes erreurs reviennent jusqu'à trois réussites d'affilée. Les voyants s'éteignent un à un.</p>
          </div>
          <div className="feature">
            <p className="eyebrow">Étape 3</p>
            <h3>Contrôle technique</h3>
            <p className="muted">Examen blanc : 50 questions, 41/50 pour réussir et fautes graves à −5, comme au centre.</p>
          </div>
        </div>
      </section>

    </div>
  )
}

import { Link } from 'react-router-dom'
import { QUESTIONS } from '../data'
import { THEME_PAR_ID } from '../data/themes'
import { BOITE_MAITRISE, questionsAReviser } from '../lib/adaptive'
import { useStore } from '../lib/store'
import { Icone } from '../components/Icone'

export function Erreurs() {
  const { state } = useStore()
  const liste = questionsAReviser(QUESTIONS, state.stats).sort((a, b) => Number(b.grave) - Number(a.grave))
  const graves = liste.filter((q) => q.grave).length

  return (
    <div className="stack-lg session">
      <header className="stack" style={{ gap: 8 }}>
        <p className="eyebrow">Révision</p>
        <h1>Mes erreurs</h1>
        <p className="muted">
          Une question ratée reste ici jusqu'à ce que tu la réussisses {BOITE_MAITRISE} fois d'affilée.
        </p>
      </header>

      {liste.length === 0 ? (
        <section className="panel stack">
          <h2>Aucune erreur en attente</h2>
          <p className="muted">Fais un quiz ou un examen blanc : tes erreurs apparaîtront ici.</p>
          <div className="row">
            <Link className="btn btn-primary" to="/quiz">
              Faire un quiz
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="panel row" style={{ justifyContent: 'space-between' }}>
            <p>
              <strong className="num">{liste.length}</strong> question{liste.length > 1 ? 's' : ''} à rattraper, dont{' '}
              <strong className="num" style={{ color: 'var(--signal)' }}>
                {graves}
              </strong>{' '}
              faute{graves > 1 ? 's' : ''} grave{graves > 1 ? 's' : ''}.
            </p>
            <Link className="btn btn-primary" to={`/entrainement?source=erreurs&n=${Math.min(20, liste.length)}`}>
              Réviser maintenant
            </Link>
          </section>
          <section className="stack">
            {liste.map((q) => {
              const s = state.stats[q.id]
              return (
                <article key={q.id} className="panel stack" style={{ gap: 8 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span className="chip">{THEME_PAR_ID[q.theme].court}</span>
                    {q.grave && <span className="chip chip-grave">Faute grave</span>}
                    <span className="chip">
                      {s.boite}/{BOITE_MAITRISE} réussites
                    </span>
                  </div>
                  <strong>{q.question}</strong>
                  <p className="muted">
                    Bonne réponse : <span style={{ color: 'var(--go)', fontWeight: 600 }}>{q.choix[q.bonne]}</span>
                  </p>
                  <p className="muted" style={{ fontSize: '0.92rem' }}>{q.explication}</p>
                  <Link className="correction-lien" to={`/cours/${q.theme}`}>
                    <Icone nom="livre" taille={18} />
                    Revoir la fiche « {THEME_PAR_ID[q.theme].court} »
                  </Link>
                </article>
              )
            })}
          </section>
        </>
      )}
    </div>
  )
}

import { Link } from 'react-router-dom'
import { PHOTOS, QUESTIONS_PAR_ID } from '../data'
import { THEMES } from '../data/themes'

const DATE_LONGUE = new Intl.DateTimeFormat('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' })

export function Credits() {
  const photos = Object.entries(PHOTOS)
  const sources = [...new Map(THEMES.flatMap((t) => t.sources).map((s) => [s.url, s])).values()]

  return (
    <div className="stack-lg session">
      <header className="stack" style={{ gap: 8 }}>
        <p className="eyebrow">Transparence</p>
        <h1>Sources et crédits</h1>
        <p className="muted">
          Les questions et les fiches sont rédigées pour Feu Rouge à partir des textes ci-dessous. Ce ne sont pas les questions officielles de
          l'examen.
        </p>
      </header>

      <section className="panel stack">
        <h2>Sources des règles</h2>
        <ul className="stack" style={{ gap: 6, margin: 0, paddingLeft: 18 }}>
          {sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.titre}
              </a>
            </li>
          ))}
        </ul>
        <p className="muted" style={{ fontSize: '0.88rem' }}>
          Chaque fiche de cours indique ses sources et sa date de vérification. Dernière vérification générale :{' '}
          {DATE_LONGUE.format(new Date(THEMES[0].verifieLe))}.
        </p>
      </section>

      <section className="panel stack">
        <h2>Crédits photos</h2>
        {photos.length === 0 ? (
          <p className="muted">Les illustrations actuelles sont des schémas dessinés pour le site.</p>
        ) : (
          <ul className="stack" style={{ gap: 10, margin: 0, paddingLeft: 18 }}>
            {photos.map(([id, p]) => (
              <li key={id}>
                <strong>{QUESTIONS_PAR_ID[id]?.question ?? id}</strong>
                <br />
                <span className="muted">
                  {p.auteur} ·{' '}
                  <a href={p.lienSource} target="_blank" rel="noreferrer">
                    {p.source}
                  </a>{' '}
                  ·{' '}
                  {p.lienLicence ? (
                    <a href={p.lienLicence} target="_blank" rel="noreferrer">
                      {p.licence}
                    </a>
                  ) : (
                    p.licence
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="muted" style={{ fontSize: '0.88rem' }}>
          Les photos sous licence CC BY-SA restent sous cette licence. Si tu es l'auteur d'une photo et souhaites une correction, utilise
          « Signaler une erreur » ou contacte-nous.
        </p>
      </section>

      <Link to="/" className="btn btn-ghost" style={{ alignSelf: 'flex-start' }}>
        ‹ Accueil
      </Link>
    </div>
  )
}

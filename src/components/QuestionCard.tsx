import type { Question } from '../types'
import { THEME_PAR_ID, NOMS_REGIONS } from '../data/themes'
import { Schema } from './Schema'
import { Correction } from './Correction'
import { Signaler } from './Signaler'
import { lire, texteALire, voixDisponible } from '../lib/voix'
import { PHOTOS } from '../data'

const LETTRES = ['A', 'B', 'C', 'D']

interface Props {
  question: Question
  selection: number | null
  onSelect: (i: number) => void
  /** Montre la correction (entraînement). */
  corrige: boolean
  /** Montre si la question est une faute grave (désactivé à l'examen, comme au vrai). */
  montrerGravite: boolean
  /** Affiche un bouton pour écouter la question (entraînement). */
  ecouter?: boolean
}

export function QuestionCard({ question, selection, onSelect, corrige, montrerGravite, ecouter = false }: Props) {
  const juste = selection === question.bonne
  const photo = PHOTOS[question.id]
  return (
    <article className="qcard" aria-live="polite">
      <div className="qmeta">
        <span className="chip">{THEME_PAR_ID[question.theme].court}</span>
        {montrerGravite && question.grave && <span className="chip chip-grave">Faute grave · −5</span>}
        {question.region && <span className="chip chip-region">{NOMS_REGIONS[question.region]}</span>}
        {ecouter && voixDisponible() && (
          <button type="button" className="ecouter" onClick={() => lire(texteALire(question.question, question.choix))}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 9h4l5-4v14l-5-4H4zM16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" />
            </svg>
            Écouter
          </button>
        )}
      </div>
      <h2 className="qtext">{question.question}</h2>
      {photo ? (
        <figure className="qphoto">
          <img src={photo.fichier} alt="Photo de la situation décrite dans la question" />
          <figcaption>
            Photo : {photo.auteur} ·{' '}
            <a href={photo.lienSource} target="_blank" rel="noreferrer">
              {photo.source}
            </a>{' '}
            ·{' '}
            {photo.lienLicence ? (
              <a href={photo.lienLicence} target="_blank" rel="noreferrer">
                {photo.licence}
              </a>
            ) : (
              photo.licence
            )}
          </figcaption>
        </figure>
      ) : (
        question.schema && (
          <div className="qschema">
            <Schema schema={question.schema} titre="Illustration de la question" />
          </div>
        )
      )}
      <div className="choices" role="radiogroup" aria-label="Réponses">
        {question.choix.map((c, i) => {
          let cls = 'choice'
          if (corrige) {
            if (i === question.bonne) cls += ' correct'
            else if (i === selection) cls += ' wrong'
          } else if (i === selection) cls += ' selected'
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={i === selection}
              className={cls}
              onClick={() => onSelect(i)}
              disabled={corrige}
            >
              <span className="key">{LETTRES[i]}</span>
              <span>{c}</span>
            </button>
          )
        })}
      </div>
      {corrige && (
        <div className={juste ? 'feedback' : 'feedback bad'}>
          <strong>
            {juste
              ? 'Bonne réponse.'
              : selection === null
                ? 'Pas de réponse.'
                : question.grave
                  ? 'Faute grave : −5 points à l’examen.'
                  : 'Mauvaise réponse : −1 point à l’examen.'}
          </strong>
          <Correction question={question} choix={selection} />
        </div>
      )}
      {corrige && <Signaler key={question.id} question={question} choix={selection} />}
    </article>
  )
}

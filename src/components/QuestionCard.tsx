import type { Question } from '../types'
import { THEME_PAR_ID, NOMS_REGIONS } from '../data/themes'
import { Schema } from './Schema'

const LETTRES = ['A', 'B', 'C', 'D']

interface Props {
  question: Question
  selection: number | null
  onSelect: (i: number) => void
  /** Montre la correction (entraînement). */
  corrige: boolean
  /** Montre si la question est une faute grave (désactivé à l'examen, comme au vrai). */
  montrerGravite: boolean
}

export function QuestionCard({ question, selection, onSelect, corrige, montrerGravite }: Props) {
  const juste = selection === question.bonne
  return (
    <article className="qcard" aria-live="polite">
      <div className="qmeta">
        <span className="chip">{THEME_PAR_ID[question.theme].court}</span>
        {montrerGravite && question.grave && <span className="chip chip-grave">▲ Faute grave · −5</span>}
        {question.region && <span className="chip chip-region">{NOMS_REGIONS[question.region]}</span>}
      </div>
      <h2 className="qtext">{question.question}</h2>
      {question.schema && (
        <div className="qschema">
          <Schema schema={question.schema} titre="Illustration de la question" />
        </div>
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
          </strong>{' '}
          {question.explication}
        </div>
      )}
    </article>
  )
}

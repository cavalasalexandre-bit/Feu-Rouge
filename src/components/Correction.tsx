import { Link } from 'react-router-dom'
import type { Question } from '../types'
import { THEME_PAR_ID } from '../data/themes'
import { Icone } from './Icone'

/** Pourquoi la réponse choisie est fausse, puis la règle, puis un lien vers la fiche du thème. */
export function Correction({ question, choix }: { question: Question; choix: number | null }) {
  const juste = choix === question.bonne
  const pourquoi = choix !== null && !juste ? question.pourquoiFaux?.[question.choix[choix]] : undefined
  const theme = THEME_PAR_ID[question.theme]

  return (
    <div className="correction">
      {pourquoi && (
        <p>
          <span className="correction-label">Pourquoi ta réponse est fausse</span>
          {pourquoi}
        </p>
      )}
      <p>
        <span className="correction-label">La règle</span>
        {question.explication}
      </p>
      {!juste && (
        <Link className="correction-lien" to={`/cours/${question.theme}`}>
          <Icone nom="livre" taille={18} />
          Revoir la fiche « {theme.court} »
        </Link>
      )}
    </div>
  )
}

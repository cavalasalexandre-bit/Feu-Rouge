import { useState } from 'react'
import type { Question } from '../types'
import { CONFIG } from '../config'
import { THEME_PAR_ID } from '../data/themes'

const TYPES = [
  'La bonne réponse est fausse',
  'Une explication est incorrecte',
  'La règle a changé',
  'Faute de frappe ou question peu claire',
  'Autre',
]

function texteSignalement(q: Question, type: string, commentaire: string, choix: number | null): string {
  return [
    `Question : ${q.id} (${THEME_PAR_ID[q.theme].court})`,
    `« ${q.question} »`,
    `Bonne réponse enregistrée : ${q.choix[q.bonne]}`,
    choix !== null && choix !== q.bonne ? `Réponse choisie : ${q.choix[choix]}` : null,
    '',
    `Problème : ${type}`,
    commentaire.trim() ? `Détails : ${commentaire.trim()}` : null,
    '',
    'Source éventuelle (lien vers un texte officiel) :',
  ]
    .filter((l) => l !== null)
    .join('\n')
}

/** Bouton discret qui ouvre un petit formulaire pour signaler une erreur dans une question. */
export function Signaler({ question, choix = null }: { question: Question; choix?: number | null }) {
  const [ouvert, setOuvert] = useState(false)
  const [type, setType] = useState(TYPES[0])
  const [commentaire, setCommentaire] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const id = `signal-${question.id}`

  if (!ouvert) {
    return (
      <button type="button" className="signaler-bouton" onClick={() => setOuvert(true)}>
        Signaler une erreur
      </button>
    )
  }

  const texte = texteSignalement(question, type, commentaire, choix)
  const titre = `[${question.id}] ${type}`
  const lienGithub = CONFIG.depotGithub
    ? `https://github.com/${CONFIG.depotGithub}/issues/new?labels=signalement&title=${encodeURIComponent(titre)}&body=${encodeURIComponent(texte)}`
    : null
  const lienMail = CONFIG.emailSignalement
    ? `mailto:${CONFIG.emailSignalement}?subject=${encodeURIComponent(`Feu Rouge — ${titre}`)}&body=${encodeURIComponent(texte)}`
    : null

  async function copier() {
    try {
      await navigator.clipboard.writeText(texte)
      setMessage('Signalement copié. Colle-le dans un message.')
    } catch {
      setMessage('Copie impossible : sélectionne le texte ci-dessous et copie-le.')
    }
  }

  return (
    <form className="signaler" onSubmit={(e) => e.preventDefault()} aria-label="Signaler une erreur">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <strong>Signaler une erreur</strong>
        <button type="button" className="btn btn-ghost" onClick={() => setOuvert(false)}>
          Fermer
        </button>
      </div>
      <div className="field">
        <label htmlFor={`${id}-type`}>Quel est le problème ?</label>
        <select id={`${id}-type`} value={type} onChange={(e) => setType(e.target.value)}>
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={`${id}-detail`}>Détails (et source si tu en as une)</label>
        <textarea
          id={`${id}-detail`}
          rows={3}
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          placeholder="Ex. : depuis 2026, le montant est de…"
        />
      </div>
      <div className="row">
        {lienGithub && (
          <a className="btn btn-primary" href={lienGithub} target="_blank" rel="noreferrer">
            Envoyer sur GitHub
          </a>
        )}
        {lienMail && (
          <a className="btn btn-secondary" href={lienMail}>
            Envoyer par e-mail
          </a>
        )}
        <button type="button" className={lienGithub || lienMail ? 'btn btn-ghost' : 'btn btn-primary'} onClick={copier}>
          Copier le signalement
        </button>
      </div>
      {message && <p className="notice">{message}</p>}
      {!lienGithub && !lienMail && (
        <pre className="signaler-texte" aria-label="Texte du signalement">
          {texte}
        </pre>
      )}
    </form>
  )
}

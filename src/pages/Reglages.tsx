import { useRef, useState } from 'react'
import { THEMES, NOMS_REGIONS } from '../data/themes'
import { etatInitial, exporter, importer, majReglages } from '../lib/storage'
import { useStore } from '../lib/store'
import type { Apparence, FormatExamen, Region, ThemeId } from '../types'

const REGIONS = Object.keys(NOMS_REGIONS) as Region[]
const CHRONOS = [
  { v: 0, l: 'Sans chrono' },
  { v: 30, l: '30 min' },
  { v: 40, l: '40 min' },
]

const FORMATS: { v: FormatExamen; l: string }[] = [
  { v: 'officiel', l: 'Officiel · 15 s par question' },
  { v: 'libre', l: 'Libre' },
]
const APPARENCES: { v: Apparence; l: string }[] = [
  { v: 'sombre', l: 'Sombre' },
  { v: 'clair', l: 'Clair' },
  { v: 'auto', l: 'Comme mon appareil' },
]

export function Reglages() {
  const { state, update, remplacer } = useStore()
  const s = state.settings
  const fichier = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ texte: string; erreur?: boolean } | null>(null)
  const [confirmer, setConfirmer] = useState(false)

  function basculer(t: ThemeId) {
    const liste = s.themesPrioritaires.includes(t) ? s.themesPrioritaires.filter((x) => x !== t) : [...s.themesPrioritaires, t]
    update((st) => majReglages(st, { themesPrioritaires: liste }))
  }

  function telecharger() {
    const blob = new Blob([exporter(state)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `feu-rouge-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage({ texte: 'Sauvegarde téléchargée. Importe ce fichier sur un autre appareil pour retrouver ta progression.' })
  }

  async function importerFichier(f: File) {
    try {
      remplacer(importer(await f.text()))
      setMessage({ texte: 'Progression importée.' })
    } catch (e) {
      setMessage({ texte: (e as Error).message, erreur: true })
    }
  }

  return (
    <div className="stack-lg session">
      <header className="stack" style={{ gap: 8 }}>
        <p className="eyebrow">Personnalisation</p>
        <h1>Réglages</h1>
        <p className="muted">Ces choix orientent ton plan du jour, les quiz et les examens ciblés. Ils sont enregistrés automatiquement.</p>
      </header>

      <section className="panel stack">
        <fieldset className="field">
          <legend>Ma région</legend>
          <div className="seg">
            {REGIONS.map((r) => (
              <label key={r}>
                <input type="radio" name="region" id={`region-${r}`} checked={s.region === r} onChange={() => update((st) => majReglages(st, { region: r }))} />
                <span>{NOMS_REGIONS[r]}</span>
              </label>
            ))}
          </div>
          <p className="muted" style={{ fontSize: '0.9rem' }}>
            Depuis 2026, toute la formation se fait dans la même région. L'examen peut quand même contenir des questions sur les règles des autres régions.
          </p>
        </fieldset>

        <div className="field">
          <label htmlFor="date-examen">Date de mon examen</label>
          <input
            id="date-examen"
            type="date"
            value={s.dateExamen ?? ''}
            onChange={(e) => update((st) => majReglages(st, { dateExamen: e.target.value || null }))}
          />
          <p className="muted" style={{ fontSize: '0.9rem' }}>
            Plus la date approche, plus le plan propose d'examens blancs et d'entraînements sur les fautes graves.
          </p>
        </div>

        <div className="field">
          <label htmlFor="objectif">Objectif quotidien (questions)</label>
          <input
            id="objectif"
            type="number"
            min={5}
            max={200}
            step={5}
            value={s.objectifJour}
            onChange={(e) => update((st) => majReglages(st, { objectifJour: Math.min(200, Math.max(5, Number(e.target.value) || 30)) }))}
          />
        </div>

      </section>

      <section className="panel stack">
        <h2>Examen blanc</h2>
        <fieldset className="field">
          <legend>Format</legend>
          <div className="seg">
            {FORMATS.map((f) => (
              <label key={f.v}>
                <input type="radio" name="format" id={`format-${f.v}`} checked={s.formatExamen === f.v} onChange={() => update((st) => majReglages(st, { formatExamen: f.v }))} />
                <span>{f.l}</span>
              </label>
            ))}
          </div>
          <p className="muted" style={{ fontSize: '0.9rem' }}>
            {s.formatExamen === 'officiel'
              ? 'Comme au centre d’examen : la question est lue, puis tu as 15 secondes pour répondre. Sans réponse, c’est une faute.'
              : 'Format libre : un chrono global pour les 50 questions, ou pas de chrono du tout.'}
          </p>
        </fieldset>

        {s.formatExamen === 'libre' && (
          <fieldset className="field">
            <legend>Chrono global</legend>
            <div className="seg">
              {CHRONOS.map((c) => (
                <label key={c.v}>
                  <input type="radio" name="chrono" id={`chrono-${c.v}`} checked={s.chronoMinutes === c.v} onChange={() => update((st) => majReglages(st, { chronoMinutes: c.v }))} />
                  <span>{c.l}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <label className="check" style={{ alignSelf: 'flex-start' }}>
          <input type="checkbox" id="lecture-audio" checked={s.lectureAudio} onChange={(e) => update((st) => majReglages(st, { lectureAudio: e.target.checked }))} />
          Lire les questions à voix haute
          <span className="muted" style={{ fontSize: '0.85rem' }}>(voix de ton appareil)</span>
        </label>
      </section>

      <section className="panel stack">
        <fieldset className="field">
          <legend>Apparence</legend>
          <div className="seg">
            {APPARENCES.map((a) => (
              <label key={a.v}>
                <input type="radio" name="apparence" id={`apparence-${a.v}`} checked={s.apparence === a.v} onChange={() => update((st) => majReglages(st, { apparence: a.v }))} />
                <span>{a.l}</span>
              </label>
            ))}
          </div>
          <p className="muted" style={{ fontSize: '0.9rem' }}>Le mode clair se lit mieux en plein soleil sur un téléphone.</p>
        </fieldset>
      </section>

      <section className="panel stack">
        <div className="stack" style={{ gap: 6 }}>
          <h2>Mes thèmes prioritaires</h2>
          <p className="muted">Les thèmes cochés reviennent deux fois plus souvent dans les quiz, les révisions et l'examen ciblé.</p>
        </div>
        <div className="grid-3">
          {THEMES.map((t) => (
            <label key={t.id} className="check">
              <input type="checkbox" id={`prio-${t.id}`} checked={s.themesPrioritaires.includes(t.id)} onChange={() => basculer(t.id)} />
              {t.court}
            </label>
          ))}
        </div>
      </section>

      <section className="panel stack">
        <div className="stack" style={{ gap: 6 }}>
          <h2>Ma progression</h2>
          <p className="muted">
            Pas de compte : ta progression reste dans ce navigateur. Télécharge une sauvegarde pour la garder ou la transférer sur un autre appareil.
          </p>
        </div>
        {message && <p className={message.erreur ? 'notice error' : 'notice'}>{message.texte}</p>}
        <div className="row">
          <button type="button" className="btn btn-secondary" onClick={telecharger}>
            Télécharger une sauvegarde
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => fichier.current?.click()}>
            Importer une sauvegarde
          </button>
          <input
            ref={fichier}
            id="import-fichier"
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importerFichier(f)
              e.target.value = ''
            }}
          />
        </div>
        <div className="row">
          {confirmer ? (
            <>
              <span>Effacer toute ta progression ? C'est définitif.</span>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  remplacer(etatInitial())
                  setConfirmer(false)
                  setMessage({ texte: 'Progression effacée.' })
                }}
              >
                Oui, tout effacer
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmer(false)}>
                Annuler
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-ghost" style={{ color: 'var(--signal)' }} onClick={() => setConfirmer(true)}>
              Réinitialiser ma progression
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

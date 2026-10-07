import { describe, expect, it } from 'vitest'
import type { Question, ThemeId } from '../types'
import { EXAMEN, scoreExamen, type Reponse } from './scoring'
import {
  estDue,
  maitriseParTheme,
  majStat,
  questionsAReviser,
  tirageAdaptatif,
  tirageEquilibre,
} from './adaptive'
import { seeded } from './random'
import { enregistrerReponse, etatInitial, importer, exporter, majReglages } from './storage'
import { joursAvant, planDuJour } from './plan'

const THEMES: ThemeId[] = ['vitesses', 'distances', 'eclairage', 'priorites']

function q(id: string, theme: ThemeId = 'vitesses', grave = false): Question {
  return { id, theme, question: id, choix: ['a', 'b', 'c'], bonne: 0, grave, explication: '' }
}

function banque(): Question[] {
  return THEMES.flatMap((t) => Array.from({ length: 20 }, (_, i) => q(`${t}-${i}`, t, i % 4 === 0)))
}

const juste = (question: Question): Reponse => ({ question, choix: question.bonne })
const faux = (question: Question): Reponse => ({ question, choix: question.bonne + 1 })

describe('notation officielle', () => {
  it('50 bonnes réponses = 50/50, réussi', () => {
    const r = Array.from({ length: 50 }, (_, i) => juste(q(`q${i}`)))
    expect(scoreExamen(r)).toMatchObject({ points: 50, reussi: true })
  })

  it('9 fautes simples = 41/50, réussi de justesse', () => {
    const r = Array.from({ length: 50 }, (_, i) => (i < 9 ? faux(q(`q${i}`)) : juste(q(`q${i}`))))
    expect(scoreExamen(r)).toMatchObject({ points: 41, fautesSimples: 9, reussi: true })
  })

  it('10 fautes simples = 40/50, échec', () => {
    const r = Array.from({ length: 50 }, (_, i) => (i < 10 ? faux(q(`q${i}`)) : juste(q(`q${i}`))))
    expect(scoreExamen(r).reussi).toBe(false)
  })

  it('1 faute grave + 4 simples = 41/50, réussi', () => {
    const r = [faux(q('g', 'vitesses', true)), ...Array.from({ length: 4 }, (_, i) => faux(q(`s${i}`)))]
    expect(scoreExamen(r)).toMatchObject({ points: 41, fautesGraves: 1, fautesSimples: 4, reussi: true })
  })

  it('2 fautes graves = échec même sans autre faute', () => {
    const r = [faux(q('g1', 'vitesses', true)), faux(q('g2', 'vitesses', true))]
    expect(scoreExamen(r)).toMatchObject({ points: 40, reussi: false })
  })

  it('pas de réponse = faute', () => {
    expect(scoreExamen([{ question: q('x'), choix: null }]).pointsPerdus).toBe(1)
  })

  it('les constantes correspondent au barème belge', () => {
    expect(EXAMEN).toMatchObject({ questions: 50, seuil: 41, penaliteSimple: 1, penaliteGrave: 5 })
  })
})

describe('répétition espacée', () => {
  it('juste fait monter de boîte, faux renvoie en boîte 0', () => {
    let s = majStat(undefined, true, 0)
    s = majStat(s, true, 0)
    expect(s.boite).toBe(2)
    s = majStat(s, false, 0)
    expect(s).toMatchObject({ boite: 0, vues: 3, justes: 2, rateeDerniere: true })
  })

  it('une question ratée est due tout de suite, une réussie attend son délai', () => {
    const jour = 86400000
    expect(estDue(majStat(undefined, false, 0), 0)).toBe(true)
    const ok = majStat(undefined, true, 0) // boîte 1 → 1 jour
    expect(estDue(ok, jour / 2)).toBe(false)
    expect(estDue(ok, jour)).toBe(true)
  })

  it('une erreur reste à réviser jusqu’à 3 réussites d’affilée', () => {
    const question = q('x')
    let st = enregistrerReponse(etatInitial(), question, false)
    expect(questionsAReviser([question], st.stats)).toHaveLength(1)
    st = enregistrerReponse(st, question, true)
    st = enregistrerReponse(st, question, true)
    expect(questionsAReviser([question], st.stats)).toHaveLength(1)
    st = enregistrerReponse(st, question, true)
    expect(questionsAReviser([question], st.stats)).toHaveLength(0)
  })
})

describe('tirage', () => {
  it('le tirage équilibré couvre tous les thèmes sans doublon', () => {
    const pick = tirageEquilibre(banque(), 40, { rng: seeded(1) })
    expect(new Set(pick.map((x) => x.id)).size).toBe(40)
    for (const t of THEMES) expect(pick.filter((x) => x.theme === t)).toHaveLength(10)
  })

  it('le tirage adaptatif favorise le thème raté', () => {
    const qs = banque()
    let st = etatInitial()
    // L'utilisateur réussit tout sauf les « distances ».
    for (const x of qs) st = enregistrerReponse(st, x, x.theme !== 'distances', 0)
    let distances = 0
    for (let seed = 0; seed < 30; seed++) {
      const pick = tirageAdaptatif(qs, st, 20, { rng: seeded(seed), maintenant: 0 })
      distances += pick.filter((x) => x.theme === 'distances').length
    }
    // Sans adaptation on attendrait 25 % (150 sur 600).
    expect(distances / 600).toBeGreaterThan(0.5)
  })

  it('les thèmes prioritaires des réglages pèsent plus', () => {
    const qs = banque()
    const st = majReglages(etatInitial(), { themesPrioritaires: ['eclairage'] })
    let n = 0
    for (let seed = 0; seed < 30; seed++) {
      n += tirageAdaptatif(qs, st, 20, { rng: seeded(seed) }).filter((x) => x.theme === 'eclairage').length
    }
    expect(n / 600).toBeGreaterThan(0.35)
  })

  it('filtre graves seulement', () => {
    const pick = tirageAdaptatif(banque(), etatInitial(), 10, { gravesSeulement: true, rng: seeded(3) })
    expect(pick.every((x) => x.grave)).toBe(true)
  })
})

describe('profil et plan', () => {
  it('précision lissée par thème', () => {
    const qs = banque()
    let st = etatInitial()
    for (const x of qs.filter((x) => x.theme === 'vitesses')) st = enregistrerReponse(st, x, false)
    const m = maitriseParTheme(qs, st.stats)
    expect(m.get('vitesses')!.precision).toBeLessThan(0.1)
    expect(m.get('distances')!.precision).toBe(0.5)
  })

  it('jours avant examen', () => {
    expect(joursAvant('2026-10-13', new Date(2026, 9, 3, 15))).toBe(10)
    expect(joursAvant(null)).toBeNull()
  })

  it('le plan commence par le positionnement', () => {
    expect(planDuJour(banque(), etatInitial()).taches).toEqual([{ type: 'positionnement' }])
  })

  it('le plan propose les erreurs et un examen blanc', () => {
    const qs = banque()
    let st = { ...etatInitial(), positionnementFait: true }
    st = enregistrerReponse(st, qs[0], false)
    const types = planDuJour(qs, st).taches.map((t) => t.type)
    expect(types).toContain('erreurs')
    expect(types).toContain('examen')
  })
})

describe('sauvegarde', () => {
  it('export puis import redonne le même état', () => {
    const st = enregistrerReponse(majReglages(etatInitial(), { region: 'flandre' }), q('x'), true)
    const back = importer(exporter(st))
    expect(back.settings.region).toBe('flandre')
    expect(back.stats.x.justes).toBe(1)
  })

  it('refuse un fichier invalide avec un message clair', () => {
    expect(() => importer('pas du json')).toThrow(/JSON/)
    expect(() => importer('{"version":9}')).toThrow(/version/)
  })
})

describe('motivation', async () => {
  const { serieEnCours, meilleureSerie, badges, nouveauxBadges, marquerBadgesVus } = await import('./motivation')

  it('série en cours, y compris si rien encore aujourd’hui', () => {
    const act = { '2026-10-01': 5, '2026-10-02': 3, '2026-10-03': 1 }
    expect(serieEnCours(act, new Date(2026, 9, 3, 12))).toBe(3)
    expect(serieEnCours(act, new Date(2026, 9, 4, 12))).toBe(3)
    expect(serieEnCours(act, new Date(2026, 9, 5, 12))).toBe(0)
  })

  it('meilleure série', () => {
    expect(meilleureSerie({ '2026-09-01': 1, '2026-09-02': 1, '2026-09-10': 1, '2026-09-11': 1, '2026-09-12': 1 })).toBe(3)
  })

  it('badges obtenus et annoncés une seule fois', () => {
    let st = { ...etatInitial(), positionnementFait: true }
    expect(badges(banque(), st).find((b) => b.id === 'diagnostic')!.obtenu).toBe(true)
    expect(nouveauxBadges(banque(), st).map((b) => b.id)).toContain('diagnostic')
    st = marquerBadgesVus(st, ['diagnostic'])
    expect(nouveauxBadges(banque(), st).map((b) => b.id)).not.toContain('diagnostic')
  })
})

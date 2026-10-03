import { describe, expect, it } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Question } from '../types'
import { THEMES } from './themes'
import { CODES_PANNEAUX, SCENES } from '../components/schemas'

// Vérifie la banque de questions : à lancer après chaque ajout (npm run check:questions).
const dossier = join(dirname(fileURLToPath(import.meta.url)), 'questions')
const fichiers = readdirSync(dossier).filter((f) => f.endsWith('.json'))
const toutes: Question[] = fichiers.flatMap((f) => JSON.parse(readFileSync(join(dossier, f), 'utf8')))
const themesConnus = new Set(THEMES.map((t) => t.id))

describe('banque de questions', () => {
  it('contient au moins 400 questions', () => {
    expect(toutes.length).toBeGreaterThanOrEqual(400)
  })

  it('a un fichier par thème, et chaque thème au moins 8 questions', () => {
    for (const t of THEMES) {
      expect(fichiers).toContain(`${t.id}.json`)
      expect(toutes.filter((q) => q.theme === t.id).length).toBeGreaterThanOrEqual(8)
    }
  })

  it('identifiants uniques', () => {
    const ids = toutes.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  for (const f of fichiers) {
    const theme = f.replace('.json', '')
    it(`${f} : questions bien formées`, () => {
      const qs: Question[] = JSON.parse(readFileSync(join(dossier, f), 'utf8'))
      for (const q of qs) {
        const ctx = `${q.id} « ${q.question.slice(0, 40)} »`
        expect(q.theme, ctx).toBe(theme)
        expect(themesConnus.has(q.theme), ctx).toBe(true)
        expect(q.question.trim().length, ctx).toBeGreaterThan(5)
        expect(q.choix.length, ctx).toBeGreaterThanOrEqual(2)
        expect(q.choix.length, ctx).toBeLessThanOrEqual(4)
        expect(new Set(q.choix).size, `${ctx} : réponses en double`).toBe(q.choix.length)
        expect(Number.isInteger(q.bonne) && q.bonne >= 0 && q.bonne < q.choix.length, ctx).toBe(true)
        expect(typeof q.grave, ctx).toBe('boolean')
        expect(q.explication.trim().length, `${ctx} : explication manquante`).toBeGreaterThan(10)
        // Chaque mauvaise réponse doit expliquer pourquoi elle est fausse.
        q.choix.forEach((c, i) => {
          if (i === q.bonne) return
          expect(q.pourquoiFaux?.[c]?.trim().length ?? 0, `${ctx} : « ${c} » sans explication`).toBeGreaterThan(10)
        })
        for (const cle of Object.keys(q.pourquoiFaux ?? {})) {
          expect(q.choix.includes(cle) && q.choix.indexOf(cle) !== q.bonne, `${ctx} : clé « ${cle} » inconnue`).toBe(true)
        }
        if (q.schema?.type === 'panneau') expect(CODES_PANNEAUX, ctx).toContain(q.schema.code)
        if (q.schema?.type === 'scene') expect(SCENES, ctx).toContain(q.schema.id)
      }
    })
  }

  it('il y a assez de questions graves pour un examen réaliste', () => {
    expect(toutes.filter((q) => q.grave).length).toBeGreaterThanOrEqual(30)
  })
})

describe('photos', () => {
  const racine = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
  const credits: Record<string, { fichier: string; auteur: string; licence: string; lienSource: string }> = JSON.parse(
    readFileSync(join(racine, 'src', 'data', 'photos.json'), 'utf8'),
  )
  const ids = new Set(toutes.map((q) => q.id))

  it('chaque photo correspond à une question, un fichier présent et des crédits complets', () => {
    for (const [id, p] of Object.entries(credits)) {
      expect(ids.has(id), `photo pour une question inconnue : ${id}`).toBe(true)
      expect(existsSync(join(racine, 'public', p.fichier)), `fichier manquant : public/${p.fichier}`).toBe(true)
      expect(p.auteur && p.licence && p.lienSource, `crédits incomplets pour ${id}`).toBeTruthy()
    }
  })
})

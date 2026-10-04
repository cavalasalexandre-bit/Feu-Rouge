#!/usr/bin/env node
/**
 * Photos libres de droits pour les questions de Feu Rouge.
 *
 *   npm run photos:chercher   → cherche des photos candidates (Wikimedia Commons, et Mapillary si un jeton est configuré)
 *                               pour chaque question de photos/a-trouver.json, télécharge des miniatures dans
 *                               photos/candidats/ et crée photos/candidats/index.html pour les comparer.
 *                               Ajoute des identifiants pour ne chercher que ces questions :
 *                               npm run photos:chercher -- sig-007 aut-002
 *   npm run photos:installer  → télécharge les photos choisies dans photos/selection.json vers public/photos/
 *                               et écrit les crédits (auteur, licence, lien) dans src/data/photos.json.
 *
 * Aucune dépendance : Node 20+ (fetch intégré). Mapillary demande un jeton gratuit dans .env (voir .env.example).
 * Licences acceptées : domaine public, CC0, CC BY, CC BY-SA (mention de l'auteur obligatoire, affichée sur le site).
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..')
const DOSSIER_CANDIDATS = join(RACINE, 'photos', 'candidats')
const DOSSIER_PUBLIC = join(RACINE, 'public', 'photos')
const FICHIER_CREDITS = join(RACINE, 'src', 'data', 'photos.json')
const UA = 'FeuRouge/1.0 (site educatif gratuit ; https://github.com)'
const COMMONS = 'https://commons.wikimedia.org/w/api.php'
const MAPILLARY = 'https://graph.mapillary.com'
const LICENCES_OK = /^(public domain|domaine public|pd|cc0|cc[ -]by(-sa)?( \d\.\d)?)/i
const MAX_PAR_SOURCE = 6

// ---------- utilitaires ----------

async function lireJson(chemin, defaut) {
  if (!existsSync(chemin)) return defaut
  return JSON.parse(await readFile(chemin, 'utf8'))
}

async function chargerEnv() {
  const chemin = join(RACINE, '.env')
  if (!existsSync(chemin)) return
  for (const ligne of (await readFile(chemin, 'utf8')).split('\n')) {
    const m = ligne.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

export function texteBrut(html = '') {
  return String(html)
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

async function getJson(url, entetes = {}) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, ...entetes } })
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} pour ${url.split('?')[0]}`)
  return r.json()
}

async function telecharger(url, destination, entetes = {}) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, ...entetes } })
  if (!r.ok) throw new Error(`${r.status} en téléchargeant ${url.split('?')[0]}`)
  await mkdir(dirname(destination), { recursive: true })
  await writeFile(destination, Buffer.from(await r.arrayBuffer()))
}

const pause = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------- Wikimedia Commons ----------

/** Transforme une page de l'API Commons en candidate, ou null si ce n'est pas une photo sous licence libre acceptée. */
export function candidateCommons(page) {
  const info = page.imageinfo?.[0]
  if (!info || !/^image\/(jpeg|png|webp)$/.test(info.mime ?? '')) return null
  const meta = info.extmetadata ?? {}
  const licence = texteBrut(meta.LicenseShortName?.value)
  if (!LICENCES_OK.test(licence)) return null
  return {
    source: 'wikimedia',
    fichier: page.title,
    miniature: info.thumburl ?? info.url,
    auteur: texteBrut(meta.Artist?.value) || 'Auteur inconnu',
    licence,
    lienLicence: meta.LicenseUrl?.value ?? '',
    lienSource: info.descriptionurl,
    description: texteBrut(meta.ImageDescription?.value).slice(0, 200),
  }
}

function paramsCommons(extra, largeur) {
  return new URLSearchParams({
    action: 'query',
    format: 'json',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|mime',
    iiurlwidth: String(largeur),
    ...extra,
  })
}

async function commonsCategorie(categorie) {
  const p = paramsCommons({ generator: 'categorymembers', gcmtitle: categorie, gcmtype: 'file', gcmlimit: '30' }, 640)
  const json = await getJson(`${COMMONS}?${p}`)
  return Object.values(json.query?.pages ?? {}).map(candidateCommons).filter(Boolean)
}

async function commonsRecherche(texte) {
  const p = paramsCommons({ generator: 'search', gsrsearch: `${texte} filetype:bitmap`, gsrnamespace: '6', gsrlimit: '20' }, 640)
  const json = await getJson(`${COMMONS}?${p}`)
  return Object.values(json.query?.pages ?? {}).map(candidateCommons).filter(Boolean)
}

async function commonsFichier(fichier, largeur) {
  const p = paramsCommons({ titles: fichier }, largeur)
  const json = await getJson(`${COMMONS}?${p}`)
  const page = Object.values(json.query?.pages ?? {})[0]
  const c = page && candidateCommons(page)
  if (!c) throw new Error(`${fichier} introuvable, ou licence non acceptée`)
  return c
}

// ---------- Mapillary ----------

function candidateMapillary(img) {
  return {
    source: 'mapillary',
    image: String(img.id),
    miniature: img.thumb_1024_url,
    auteur: img.creator?.username ? `${img.creator.username} (Mapillary)` : 'Contributeur Mapillary',
    licence: 'CC BY-SA 4.0',
    lienLicence: 'https://creativecommons.org/licenses/by-sa/4.0/',
    lienSource: `https://www.mapillary.com/app/?pKey=${img.id}`,
    description: img.captured_at ? `Prise le ${new Date(img.captured_at).toLocaleDateString('fr-BE')}` : '',
  }
}

async function mapillaryImage(id, jeton) {
  const p = new URLSearchParams({ fields: 'id,thumb_1024_url,thumb_2048_url,creator,captured_at', access_token: jeton })
  return getJson(`${MAPILLARY}/${id}?${p}`)
}

async function mapillaryPanneau(valeur, bbox, jeton) {
  const p = new URLSearchParams({ fields: 'id,object_value,images', bbox: bbox.join(','), object_values: valeur, limit: '10', access_token: jeton })
  const json = await getJson(`${MAPILLARY}/map_features?${p}`)
  const ids = (json.data ?? []).flatMap((f) => (f.images?.data ?? []).slice(0, 1).map((i) => i.id))
  const images = []
  for (const id of ids.slice(0, MAX_PAR_SOURCE)) {
    try {
      images.push(candidateMapillary(await mapillaryImage(id, jeton)))
    } catch (e) {
      console.warn(`    ! image ${id} : ${e.message}`)
    }
  }
  return images
}

// ---------- commande « chercher » ----------

function echapper(s = '') {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
}

function pageRevue(resultats) {
  const blocs = resultats
    .map(
      (r) => `<section>
  <h2>${echapper(r.question)} — ${echapper(r.enonce)}</h2>
  <p class="besoin">Besoin : ${echapper(r.besoin)}</p>
  ${r.candidats.length === 0 ? '<p class="vide">Aucune candidate trouvée. Ajoute des recherches ou une catégorie dans photos/a-trouver.json.</p>' : ''}
  <div class="grille">
  ${r.candidats
    .map(
      (c) => `<figure>
    <img src="${echapper(c.local)}" alt="" loading="lazy">
    <figcaption><code>${echapper(c.cle)}</code><br>${echapper(c.auteur)} · ${echapper(c.licence)}<br><a href="${echapper(c.lienSource)}" target="_blank" rel="noreferrer">source</a></figcaption>
  </figure>`,
    )
    .join('\n  ')}
  </div>
</section>`,
    )
    .join('\n')
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Feu Rouge — photos candidates</title>
<style>
body{font-family:system-ui,sans-serif;margin:24px;background:#0c1118;color:#e8edf5}
h1{margin-top:0}h2{font-size:1.1rem;margin:32px 0 4px}.besoin{color:#93a0b5;margin:0 0 12px}.vide{color:#ffb020}
.grille{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
figure{margin:0;background:#151c27;border:1px solid #253043;border-radius:10px;overflow:hidden}
img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}figcaption{padding:8px 10px;font-size:.8rem;color:#93a0b5}
code{color:#ffb020;font-size:.75rem;word-break:break-all}a{color:#4fd1ff}
</style></head><body>
<h1>Photos candidates</h1>
<p>Pour chaque question, choisis la photo qui montre le mieux la situation, sans visage ni plaque lisible. Copie sa clé dans <code>photos/selection.json</code>, puis lance <code>npm run photos:installer</code>.</p>
${blocs}
</body></html>`
}

async function chercher() {
  await chargerEnv()
  const config = await lireJson(join(RACINE, 'photos', 'a-trouver.json'), null)
  if (!config) throw new Error('photos/a-trouver.json manquant')
  const jeton = process.env.MAPILLARY_TOKEN
  if (!jeton) console.log('ℹ Pas de MAPILLARY_TOKEN dans .env : recherche sur Wikimedia Commons uniquement.\n')
  const questions = await chargerQuestions()
  const resultats = []

  // Questions données en argument (npm run photos:chercher -- sig-007 aut-002) : on ne cherche que celles-là.
  const filtre = process.argv.slice(3)
  const aChercher = filtre.length ? config.questions.filter((q) => filtre.includes(q.question)) : config.questions
  if (filtre.length && !aChercher.length) throw new Error(`aucune question ${filtre.join(', ')} dans photos/a-trouver.json`)

  for (const q of aChercher) {
    const enonce = questions.get(q.question)?.question ?? '(question introuvable)'
    console.log(`▶ ${q.question} : ${q.besoin}`)
    const vus = new Set()
    const candidats = []
    const ajouter = (liste, origine) => {
      let n = 0
      for (const c of liste) {
        const cle = c.source === 'wikimedia' ? c.fichier : `mapillary:${c.image}`
        if (vus.has(cle) || n >= MAX_PAR_SOURCE) continue
        vus.add(cle)
        candidats.push({ ...c, cle })
        n++
      }
      console.log(`  ${origine} : ${n} candidate(s)`)
    }

    for (const cat of q.wikimedia?.categories ?? []) {
      try {
        ajouter(await commonsCategorie(cat), cat)
      } catch (e) {
        console.warn(`  ! ${cat} : ${e.message}`)
      }
      await pause(300)
    }
    for (const texte of q.wikimedia?.recherches ?? []) {
      try {
        ajouter(await commonsRecherche(texte), `recherche « ${texte} »`)
      } catch (e) {
        console.warn(`  ! recherche « ${texte} » : ${e.message}`)
      }
      await pause(300)
    }
    if (jeton) {
      for (const valeur of q.mapillary?.panneaux ?? []) {
        for (const [zone, bbox] of Object.entries(config.zonesMapillary ?? {})) {
          try {
            ajouter(await mapillaryPanneau(valeur, bbox, jeton), `Mapillary ${valeur} (${zone})`)
          } catch (e) {
            console.warn(`  ! Mapillary ${valeur} (${zone}) : ${e.message}`)
          }
        }
      }
    }

    // Miniatures locales pour la page de revue (et pour que Claude Code puisse les regarder).
    for (const [i, c] of candidats.entries()) {
      const nom = `${String(i + 1).padStart(2, '0')}-${c.source}.jpg`
      try {
        await telecharger(c.miniature, join(DOSSIER_CANDIDATS, q.question, nom))
        c.local = `${q.question}/${nom}`
      } catch (e) {
        console.warn(`  ! miniature ${c.cle} : ${e.message}`)
      }
      await pause(150)
    }
    const valides = candidats.filter((c) => c.local)
    resultats.push({ question: q.question, enonce, besoin: q.besoin, candidats: valides })
    await writeFile(join(DOSSIER_CANDIDATS, q.question, 'candidats.json'), JSON.stringify(valides, null, 2)).catch(async () => {
      await mkdir(join(DOSSIER_CANDIDATS, q.question), { recursive: true })
      await writeFile(join(DOSSIER_CANDIDATS, q.question, 'candidats.json'), JSON.stringify(valides, null, 2))
    })
  }

  await mkdir(DOSSIER_CANDIDATS, { recursive: true })
  await writeFile(join(DOSSIER_CANDIDATS, 'index.html'), pageRevue(resultats))
  await writeFile(join(DOSSIER_CANDIDATS, 'resultats.json'), JSON.stringify(resultats, null, 2))
  const total = resultats.reduce((n, r) => n + r.candidats.length, 0)
  console.log(`\n✔ ${total} candidates. Ouvre photos/candidats/index.html pour les comparer.`)
  console.log('  Puis remplis photos/selection.json, par exemple :')
  console.log('  [{ "question": "pri-002", "cle": "File:Exemple.jpg" }, { "question": "pri-003", "cle": "mapillary:123456" }]')
}

// ---------- commande « installer » ----------

async function chargerQuestions() {
  const dossier = join(RACINE, 'src', 'data', 'questions')
  const { readdir } = await import('node:fs/promises')
  const map = new Map()
  for (const f of await readdir(dossier)) {
    if (!f.endsWith('.json')) continue
    for (const q of JSON.parse(await readFile(join(dossier, f), 'utf8'))) map.set(q.id, q)
  }
  return map
}

async function installer() {
  await chargerEnv()
  const selection = await lireJson(join(RACINE, 'photos', 'selection.json'), [])
  if (!selection.length) {
    console.log('photos/selection.json est vide : lance d’abord « npm run photos:chercher » et choisis les photos.')
    return
  }
  const questions = await chargerQuestions()
  const credits = await lireJson(FICHIER_CREDITS, {})
  const jeton = process.env.MAPILLARY_TOKEN
  let ok = 0

  for (const { question, cle } of selection) {
    if (!questions.has(question)) {
      console.warn(`! ${question} : question inconnue, ignorée`)
      continue
    }
    try {
      let c
      let url
      if (cle.startsWith('mapillary:')) {
        if (!jeton) throw new Error('MAPILLARY_TOKEN manquant dans .env')
        const img = await mapillaryImage(cle.slice('mapillary:'.length), jeton)
        c = candidateMapillary(img)
        url = img.thumb_2048_url ?? img.thumb_1024_url
      } else {
        c = await commonsFichier(cle, 1280)
        url = c.miniature
      }
      const fichier = `photos/${question}.jpg`
      await telecharger(url, join(RACINE, 'public', fichier))
      credits[question] = {
        fichier,
        auteur: c.auteur,
        licence: c.licence,
        lienLicence: c.lienLicence,
        lienSource: c.lienSource,
        source: c.source === 'wikimedia' ? 'Wikimedia Commons' : 'Mapillary',
      }
      ok++
      console.log(`✔ ${question} ← ${cle} (${c.auteur}, ${c.licence})`)
    } catch (e) {
      console.warn(`! ${question} : ${e.message}`)
    }
    await pause(300)
  }

  await mkdir(DOSSIER_PUBLIC, { recursive: true })
  await writeFile(FICHIER_CREDITS, JSON.stringify(credits, null, 2) + '\n')
  console.log(`\n${ok} photo(s) installée(s). Crédits enregistrés dans src/data/photos.json.`)
  console.log('Vérifie chaque photo : aucun visage ni plaque lisible. Puis « npm run dev » pour les voir sur le site.')
}

// ---------- lancement ----------

const commande = process.argv[2]
const actions = { chercher, installer }
if (actions[commande]) {
  actions[commande]().catch((e) => {
    console.error(`Erreur : ${e.message}`)
    process.exit(1)
  })
} else if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Usage : node scripts/photos.mjs chercher | installer')
}

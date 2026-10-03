# Feu Rouge

Site gratuit de préparation à l'examen théorique du permis B en Belgique : cours, quiz, examens blancs notés comme le vrai, et révisions qui s'adaptent aux points faibles de chacun. Sans compte : la progression reste dans le navigateur (avec export/import d'une sauvegarde).

## Fonctionnalités

| Page | Rôle |
|---|---|
| Accueil | Présentation, barème officiel |
| Positionnement | 30 questions réparties sur les 12 thèmes → profil forces/faiblesses |
| Tableau de bord | Plan du jour, compte à rebours, maîtrise par thème, courbe des examens |
| Cours | Une fiche Markdown par thème |
| Quiz | Révision intelligente, spécial fautes graves, quiz à la carte |
| Examen blanc | 50 questions, 41/50, faute grave −5, chrono, arrêt anticipé, mode officiel ou ciblé |
| Mes erreurs | Questions ratées, jusqu'à 3 réussites d'affilée |
| Réglages | Région, date d'examen, thèmes prioritaires, chrono, objectif, sauvegarde |

## Comment fonctionne la personnalisation

- **Répétition espacée (Leitner)** : chaque question a une « boîte » de 0 à 5. Juste → boîte suivante, faux → boîte 0. Délais : 0, 1, 2, 4, 8, 16 jours.
- **Tirage adaptatif** : le poids d'une question = poids du thème (plus le taux de réussite est bas, plus il pèse ; ×2 si thème prioritaire) × poids de la question (ratée récemment > jamais vue > peu maîtrisée > maîtrisée ; ×1,3 si faute grave).
- **Plan du jour** : erreurs à rattraper, 2 thèmes les plus faibles, fautes graves, examen blanc d'autant plus fréquent que la date approche.

Code : `src/lib/adaptive.ts`, `src/lib/plan.ts`, `src/lib/scoring.ts`.

## Lancer en local

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # tests (notation, tirage, banque de questions)
npm run build     # version de production dans dist/
```

## Ajouter ou corriger des questions

Les questions sont dans `src/data/questions/<theme>.json` :

```json
{
  "id": "vit-021",
  "theme": "vitesses",
  "question": "…",
  "choix": ["…", "…", "…"],
  "bonne": 0,
  "grave": true,
  "explication": "…",
  "schema": { "type": "panneau", "code": "C43", "valeur": "70" },
  "region": "wallonie"
}
```

- `bonne` : index de la bonne réponse (0 = la première).
- `grave` : `true` si une erreur coûte 5 points (infraction du 3e/4e degré ou vitesse).
- `schema` (optionnel) : panneau (`src/components/schemas.ts` liste les codes disponibles) ou scène.
- `region` (optionnel) : `wallonie`, `bruxelles` ou `flandre`.

Après modification : `npm run check:questions` vérifie que tout est bien formé.

Les fiches de cours sont dans `src/data/cours/<theme>.md`.

## Publier sur GitHub Pages

1. Crée un dépôt sur GitHub (par ex. `feu-rouge`).
2. Dans ce dossier :
   ```bash
   git remote add origin https://github.com/<ton-compte>/feu-rouge.git
   git push -u origin main
   ```
3. Sur GitHub : **Settings → Pages → Source : GitHub Actions**.
4. Chaque `git push` sur `main` lance les tests, construit et publie le site sur `https://<ton-compte>.github.io/feu-rouge/`.

## Technique

Vite + React + TypeScript, React Router (HashRouter pour GitHub Pages), Vitest, `marked` pour les cours. Aucune donnée envoyée à un serveur.

## Avertissement

Les questions sont originales et rédigées à partir du code de la route belge. Elles ne sont pas les questions officielles de l'examen. Vérifie toujours les règles récentes auprès des sources officielles (SPF Mobilité, AWSR, Bruxelles Mobilité, Vlaamse overheid).

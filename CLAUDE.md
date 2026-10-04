# Feu Rouge — consignes pour Claude Code

Site gratuit de préparation à l'examen théorique du permis B en Belgique (Vite + React + TypeScript). Le propriétaire n'est pas développeur : explique simplement, en français, avec des étapes numérotées.

## Règles de travail

- Réponds en français.
- Avant de dire qu'une tâche est terminée : `npm test` puis `npm run build` doivent passer.
- Un serveur de dev tourne peut-être déjà sur http://localhost:5173 : n'en lance pas un deuxième.
- Fais un commit clair à la fin de chaque tâche terminée.
- Ne modifie pas `.env` et ne mets jamais de jeton ou de clé dans le code.

## Contenu

- Questions : `src/data/questions/<theme>.json`. Chaque question a `explication` (la règle) et `pourquoiFaux` (une phrase par mauvaise réponse, clé = texte exact du choix). `npm run check:questions` vérifie tout.
- Faute grave (`grave: true`) : question sur une infraction du 3e ou 4e degré, ou sur la vitesse.
- Questions originales uniquement. Vérifie les règles belges sur des sources récentes (codedelaroute.be, mobilit.belgium.be, police.be) et précise la région quand la règle diffère.
- Cours : `src/data/cours/<theme>.md`. Sources et date de vérification : `src/data/themes.ts`.

## Design

Direction « tableau de bord » : fond bleu nuit, compteur à aiguille ambre, voyants rouge, ambre et vert, polices Chakra Petch, IBM Plex Sans et IBM Plex Mono. Thème sombre par défaut, thème clair en option (`:root[data-theme='clair']` dans `src/styles.css`). Toute page doit fonctionner sur téléphone.

## Photos libres de droits

Objectif : illustrer des questions avec de vraies photos (Wikimedia Commons, Mapillary), crédits affichés.

1. `npm run photos:chercher` : cherche des candidates pour chaque question de `photos/a-trouver.json` et télécharge des miniatures dans `photos/candidats/<question>/` (avec `candidats.json` : clé, auteur, licence, source). Mapillary n'est utilisé que si `MAPILLARY_TOKEN` est défini dans `.env`.
2. Choisir une photo par question : **regarde les miniatures** (outil Read sur les .jpg) et garde celle qui montre le mieux le « besoin » décrit dans `photos/a-trouver.json`. Critères :
   - la situation ou le panneau demandé est clairement visible ;
   - photo prise en Belgique de préférence (panneaux belges) ;
   - **aucun visage ni plaque d'immatriculation lisible** ;
   - pas de photo trompeuse (panneau d'un autre pays si la question parle d'un panneau belge).
   S'il n'y a aucune bonne candidate, n'en choisis pas : signale-le, et propose d'autres recherches à ajouter dans `photos/a-trouver.json`.
3. Écris le choix dans `photos/selection.json` : `[{ "question": "pri-002", "cle": "File:Nom exact.jpg" }, { "question": "pri-003", "cle": "mapillary:123456" }]` (la clé est le champ `cle` de `candidats.json`).
4. `npm run photos:installer` : télécharge les photos choisies dans `public/photos/` et écrit les crédits dans `src/data/photos.json`. Le site affiche alors la photo à la place du schéma, avec la mention de l'auteur, et la page « Sources et crédits » la liste.
5. `npm test` (vérifie que chaque photo a son fichier et ses crédits), puis montre le résultat au propriétaire et fais un commit.

### Travailler par lots

`photos/a-trouver.json` contient près de 200 questions, rangées par `lot` (1 à 7). Traite un lot à la fois :

1. Liste les identifiants du lot et ignore ceux qui ont déjà une photo dans `src/data/photos.json`.
2. `npm run photos:chercher -- <id1> <id2> …` (seulement ces questions).
3. Choisis avec les critères ci-dessus. Précisions :
   - **panneaux, marquages, feux, plaques de rue** : photo belge obligatoire (un panneau étranger induirait en erreur) ;
   - **objets et situations génériques** (tableau de bord, pneu, siège enfant, défibrillateur, brouillard, tunnel…) : n'importe quel pays convient, tant qu'aucun panneau étranger n'est visible ;
   - mieux vaut aucune photo qu'une photo floue, petite ou ambiguë.
4. Ajoute les choix à `photos/selection.json` (sans effacer les précédents), puis `npm run photos:installer`.
5. `npm test`, `npm run build`, commit « Photos : lot N », et donne un petit bilan (installées / sans photo).
6. Supprime `photos/candidats/` du lot traité pour libérer de la place (le dossier n'est pas versionné).

Ne reformule pas les questions sans l'accord du propriétaire.

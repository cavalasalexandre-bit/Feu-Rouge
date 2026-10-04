// Liste des schémas disponibles pour les questions (voir Schema.tsx pour le dessin).
export const CODES_PANNEAUX = [
  'A51', 'B1', 'B5', 'B9', 'B11', 'B15', 'B17',
  'C1', 'C3', 'C35', 'C43', 'D1', 'D5', 'E1', 'E3', 'E9a',
  'F1', 'F4a', 'F5', 'F12a',
  // Ajouts : danger, fin de limitation, indication, stationnement, panonceaux
  'A1b', 'A3', 'A21', 'A23', 'A27', 'A31', 'A45', 'A47',
  'C45', 'F19', 'F45',
  'E9a-handicap', 'E9a-disque', 'E9a-livraisons', 'disque',
  'zone30-ecole', 'zone30-ecole-heures', 'C43-panonceau', 'C3-local',
] as const

export const SCENES = [
  'carrefour-droite', 'carrefour-gauche', 'ligne-continue', 'autoroute-insertion',
  // Feux et portiques
  'feu-orange', 'feu-rouge', 'feu-velo', 'feu-vert-cedez', 'portique-croix', 'portique-fleche', 'portique-90',
  // Voyants du tableau de bord
  'voyant-route', 'voyant-croisement', 'voyant-huile', 'voyant-abs',
  // Marquages au sol
  'ligne-mixte', 'jaune-discontinue', 'jaune-continue', 'zigzag-jaune', 'dents-de-requin', 'passage-cyclistes', 'ligne-arret',
] as const

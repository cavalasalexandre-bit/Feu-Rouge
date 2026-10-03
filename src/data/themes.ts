import type { Source, ThemeId, ThemeInfo } from '../types'

/** Date de la dernière vérification du contenu. À mettre à jour à chaque relecture d'un thème. */
const VERIFIE_LE = '2026-10-03'

const S = {
  code: { titre: 'Code de la route officiel (SPF Mobilité)', url: 'https://www.codedelaroute.be/fr' },
  regles: { titre: 'Règles de circulation (SPF Mobilité)', url: 'https://mobilit.belgium.be/fr/route/conduire/code-de-la-route-violations-et-sanctions/regles-de-circulation' },
  vitesses: { titre: 'Limitations de vitesse (codedelaroute.be)', url: 'https://www.codedelaroute.be/fr/code-de-la-route/explication-du-code-de-la-route/limitations-de-vitesse' },
  enfants: { titre: 'Transporter un enfant (codedelaroute.be)', url: 'https://www.codedelaroute.be/fr/code-de-la-route/explication-du-code-de-la-route/comment-transporter-mon-enfant' },
  feux: { titre: 'Quand utiliser les feux de route (police.be)', url: 'https://www.police.be/5337/actualites/a-quel-moment-utiliser-les-feux-de-route' },
  degres: { titre: 'Infractions du 1er au 4e degré (police.be)', url: 'https://www.police.be/5299/actualites/infractions-au-code-de-la-route-du-1er-au-4eme-degre-criteres-et-sanctions' },
  amendes: { titre: 'Amendes et perceptions immédiates (SPF Mobilité)', url: 'https://mobilit.belgium.be/fr/route/conduire/code-de-la-route-violations-et-sanctions/sanctions/amendes-et-perceptions-immediates' },
  amendes2026: { titre: 'Nouveaux montants au 1er juillet 2026 (gouvernement fédéral)', url: 'https://mobiliteit.d8.pr.belgium.be/fr/news/perceptions-immediates-augmentation-des-montants-au-1er-juillet-2026' },
  gsm: { titre: 'GSM au volant, infraction du 3e degré (AWSR)', url: 'https://www.awsr.be/lutilisation-du-gsm-au-volant-devient-une-infraction-du-3eme-degre/' },
  distances: { titre: 'Distances de sécurité et de freinage (ReadyToRoad, auto-école en ligne)', url: 'https://www.readytoroad.be/theorie/la-vitesse/les-distances-de-securite/' },
  urgences: { titre: 'Numéros d\'urgence (112.be)', url: 'https://www.112.be' },
} satisfies Record<string, Source>

export const THEMES: ThemeInfo[] = [
  {
    id: 'vitesses',
    titre: 'Vitesses',
    court: 'Vitesses',
    description: 'Limitations en agglomération, hors agglomération, sur autoroute et dans les zones, selon la région.',
    sources: [S.vitesses, S.code],
    verifieLe: VERIFIE_LE,
  },
  {
    id: 'distances',
    titre: 'Distances de réaction, de freinage et d’arrêt',
    court: 'Distances',
    description: 'Les trois formules à connaître, le sol mouillé et la distance de sécurité.',
    sources: [S.code, S.distances],
    verifieLe: VERIFIE_LE,
  },
  {
    id: 'eclairage',
    titre: 'Éclairage et visibilité',
    court: 'Éclairage',
    description: 'Feux de croisement, de route, de position et de brouillard : portées et seuils de visibilité.',
    sources: [S.feux, S.code],
    verifieLe: VERIFIE_LE,
  },
  {
    id: 'priorites',
    titre: 'Priorités',
    court: 'Priorités',
    description: 'Priorité de droite, signaux de priorité, giratoires, trams, agents et feux.',
    sources: [S.regles, S.code],
    verifieLe: VERIFIE_LE,
  },
  {
    id: 'signalisation',
    titre: 'Signalisation et marquages',
    court: 'Signalisation',
    description: 'Familles de panneaux, marquages au sol, passages à niveau.',
    sources: [S.code, S.regles],
    verifieLe: VERIFIE_LE,
  },
  {
    id: 'depassement',
    titre: 'Dépassement et croisement',
    court: 'Dépassement',
    description: 'Par où dépasser, quand c’est interdit, distances latérales avec les cyclistes.',
    sources: [S.regles, S.code],
    verifieLe: VERIFIE_LE,
  },
  {
    id: 'stationnement',
    titre: 'Arrêt et stationnement',
    court: 'Stationnement',
    description: 'Distances à respecter, interdictions, zone bleue et disque.',
    sources: [S.regles, S.code],
    verifieLe: VERIFIE_LE,
  },
  {
    id: 'autoroute',
    titre: 'Autoroute',
    court: 'Autoroute',
    description: 'Insertion, bandes, panne, interdictions propres à l’autoroute.',
    sources: [S.vitesses, S.regles, S.code],
    verifieLe: VERIFIE_LE,
  },
  {
    id: 'alcool',
    titre: 'Alcool, drogues, fatigue et GSM',
    court: 'Alcool & GSM',
    description: 'Taux autorisés, effets sur la conduite, téléphone au volant.',
    sources: [S.gsm, S.amendes, S.code],
    verifieLe: VERIFIE_LE,
  },
  {
    id: 'infractions',
    titre: 'Infractions et sanctions',
    court: 'Infractions',
    description: 'Les 4 degrés d’infraction, exemples et montants des perceptions immédiates.',
    sources: [S.degres, S.amendes2026, S.amendes],
    verifieLe: VERIFIE_LE,
  },
  {
    id: 'vehicule',
    titre: 'Véhicule et sécurité',
    court: 'Véhicule',
    description: 'Pneus, ceinture, sièges enfants, équipements et documents obligatoires.',
    sources: [S.enfants, S.code],
    verifieLe: VERIFIE_LE,
  },
  {
    id: 'secours',
    titre: 'Accident et premiers secours',
    court: 'Secours',
    description: 'Sécuriser, alerter, secourir, constat amiable.',
    sources: [S.urgences, S.code],
    verifieLe: VERIFIE_LE,
  },
]

export const THEME_PAR_ID: Record<ThemeId, ThemeInfo> = Object.fromEntries(THEMES.map((t) => [t.id, t])) as Record<
  ThemeId,
  ThemeInfo
>

export const NOMS_REGIONS = {
  wallonie: 'Wallonie',
  bruxelles: 'Bruxelles-Capitale',
  flandre: 'Flandre',
} as const

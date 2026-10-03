import type { ThemeId, ThemeInfo } from '../types'

export const THEMES: ThemeInfo[] = [
  {
    id: 'vitesses',
    titre: 'Vitesses',
    court: 'Vitesses',
    description: 'Limitations en agglomération, hors agglomération, sur autoroute et dans les zones, selon la région.',
  },
  {
    id: 'distances',
    titre: 'Distances de réaction, de freinage et d’arrêt',
    court: 'Distances',
    description: 'Les trois formules à connaître, le sol mouillé et la distance de sécurité.',
  },
  {
    id: 'eclairage',
    titre: 'Éclairage et visibilité',
    court: 'Éclairage',
    description: 'Feux de croisement, de route, de position et de brouillard : portées et seuils de visibilité.',
  },
  {
    id: 'priorites',
    titre: 'Priorités',
    court: 'Priorités',
    description: 'Priorité de droite, signaux de priorité, giratoires, trams, agents et feux.',
  },
  {
    id: 'signalisation',
    titre: 'Signalisation et marquages',
    court: 'Signalisation',
    description: 'Familles de panneaux, marquages au sol, passages à niveau.',
  },
  {
    id: 'depassement',
    titre: 'Dépassement et croisement',
    court: 'Dépassement',
    description: 'Par où dépasser, quand c’est interdit, distances latérales avec les cyclistes.',
  },
  {
    id: 'stationnement',
    titre: 'Arrêt et stationnement',
    court: 'Stationnement',
    description: 'Distances à respecter, interdictions, zone bleue et disque.',
  },
  {
    id: 'autoroute',
    titre: 'Autoroute',
    court: 'Autoroute',
    description: 'Insertion, bandes, panne, interdictions propres à l’autoroute.',
  },
  {
    id: 'alcool',
    titre: 'Alcool, drogues, fatigue et GSM',
    court: 'Alcool & GSM',
    description: 'Taux autorisés, effets sur la conduite, téléphone au volant.',
  },
  {
    id: 'infractions',
    titre: 'Infractions et sanctions',
    court: 'Infractions',
    description: 'Les 4 degrés d’infraction, exemples et montants des perceptions immédiates.',
  },
  {
    id: 'vehicule',
    titre: 'Véhicule et sécurité',
    court: 'Véhicule',
    description: 'Pneus, ceinture, sièges enfants, équipements et documents obligatoires.',
  },
  {
    id: 'secours',
    titre: 'Accident et premiers secours',
    court: 'Secours',
    description: 'Sécuriser, alerter, secourir, constat amiable.',
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

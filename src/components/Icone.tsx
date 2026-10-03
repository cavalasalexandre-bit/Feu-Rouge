// Pictogrammes au trait, dans le style des voyants de tableau de bord.
const CHEMINS = {
  erreurs: 'M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4',
  cible: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  danger: 'M12 3l9 16H3zM12 10v4M12 17h.01',
  valide: 'M5 12l5 5L20 7',
  compteur: 'M5 17a8 8 0 1 1 14 0M12 13l4-4',
  livre: 'M4 5h7a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-7a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h7z',
  demarrer: 'M12 3v8M7 6a7 7 0 1 0 10 0',
  chevron: 'M9 6l6 6-6 6',
} as const

export type NomIcone = keyof typeof CHEMINS

export function Icone({ nom, taille = 22 }: { nom: NomIcone; taille?: number }) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={CHEMINS[nom]} />
    </svg>
  )
}

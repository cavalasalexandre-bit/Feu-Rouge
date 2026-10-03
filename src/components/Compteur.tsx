import { EXAMEN } from '../lib/scoring'

const CX = 160
const CY = 160
const R = 130

/** Angle (degrés, sens horaire depuis l'axe x) d'une valeur sur le cadran : 0 en bas à gauche, max en bas à droite. */
function angle(v: number, max: number): number {
  return 135 + (270 * v) / max
}

function point(r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)]
}

function arc(de: number, a: number, max: number): string {
  const [x1, y1] = point(R, angle(de, max))
  const [x2, y2] = point(R, angle(a, max))
  const grand = (270 * (a - de)) / max > 180 ? 1 : 0
  return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${R} ${R} 0 ${grand} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
}

interface Props {
  score: number
  max?: number
  seuil?: number
  /** Graduations et texte central. Désactiver pour les petites tailles. */
  detaille?: boolean
  largeur?: number
  legende?: string
}

/** Compteur façon tableau de bord : aiguille sur le score, zone verte à partir du seuil de réussite. */
export function Compteur({ score, max = EXAMEN.questions, seuil = EXAMEN.seuil, detaille = true, largeur = 300, legende }: Props) {
  const v = Math.max(0, Math.min(max, score))
  const [nx, ny] = point(108, angle(v, max))
  const reussi = v >= seuil
  const epaisseur = detaille ? 18 : 26
  // 0 et le maximum sont omis : en bas du cadran, ils chevaucheraient le score.
  const graduations = detaille ? Array.from({ length: max / 10 - 1 }, (_, i) => (i + 1) * 10) : []

  return (
    <svg
      viewBox="0 0 320 290"
      width={largeur}
      style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
      role="img"
      aria-label={legende ?? `Score : ${v} sur ${max}, seuil de réussite à ${seuil}`}
    >
      <path d={arc(0, max, max)} fill="none" stroke="var(--line)" strokeWidth={epaisseur} strokeLinecap="round" />
      <path d={arc(0, seuil, max)} fill="none" stroke="var(--zone-rouge)" strokeWidth={epaisseur} />
      <path d={arc(seuil, max, max)} fill="none" stroke="var(--go)" strokeWidth={epaisseur} strokeLinecap="round" />
      {graduations.map((g) => {
        const [tx, ty] = point(100, angle(g, max))
        return (
          <text key={g} x={tx} y={ty + 4} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={13} fill="var(--muted)">
            {g}
          </text>
        )
      })}
      <line x1={CX} y1={CY} x2={nx} y2={ny} stroke="var(--accent)" strokeWidth={detaille ? 5 : 12} strokeLinecap="round" />
      <circle cx={CX} cy={CY} r={detaille ? 12 : 20} fill="var(--accent)" />
      {detaille && <circle cx={CX} cy={CY} r={5} fill="var(--bg)" />}
      {detaille && (
        <>
          <text x={CX} y={234} textAnchor="middle" fontFamily="var(--font-display)" fontWeight={700} fontSize={48} fill="var(--ink)">
            {v}/{max}
          </text>
          <text x={CX} y={260} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={12} fill={reussi ? 'var(--go)' : 'var(--signal)'}>
            {reussi ? 'RÉUSSI' : 'RATÉ'} · SEUIL {seuil}
          </text>
        </>
      )}
    </svg>
  )
}

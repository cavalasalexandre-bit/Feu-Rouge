import type { ReactNode } from 'react'
import type { Schema as SchemaType } from '../types'

// Couleurs officielles approchées des panneaux : elles ne changent pas avec le thème sombre.
const ROUGE = '#c8102e'
const BLEU = '#1f4fa3'
const JAUNE = '#f5c400'
const NOIR = '#1b1b1b'
const BLANC = '#ffffff'

const TRI_HAUT = '50,7 95,87 5,87'
const TRI_BAS = '5,13 95,13 50,93'

function Triangle({ children, bas = false }: { children?: ReactNode; bas?: boolean }) {
  return (
    <>
      <polygon points={bas ? TRI_BAS : TRI_HAUT} fill={BLANC} stroke={ROUGE} strokeWidth={9} strokeLinejoin="round" />
      {children}
    </>
  )
}

function Rond({ fond = BLANC, bord = ROUGE, children }: { fond?: string; bord?: string | null; children?: ReactNode }) {
  return (
    <>
      <circle cx={50} cy={50} r={44} fill={fond} stroke={bord ?? 'none'} strokeWidth={bord ? 9 : 0} />
      {children}
    </>
  )
}

function Voiture({ x, y, fill }: { x: number; y: number; fill: string }) {
  // Petite voiture vue de côté pour le panneau d'interdiction de dépasser.
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 10 L4 3 Q5 1 8 1 L18 1 Q21 1 22 3 L26 10 Z" fill={fill} />
      <rect x={-1} y={9} width={28} height={8} rx={2} fill={fill} />
      <circle cx={6} cy={18} r={3} fill={NOIR} />
      <circle cx={20} cy={18} r={3} fill={NOIR} />
    </g>
  )
}

const PANNEAUX: Record<string, (valeur?: string) => ReactNode> = {
  A51: () => (
    <Triangle>
      <rect x={45} y={34} width={10} height={30} rx={3} fill={NOIR} />
      <circle cx={50} cy={74} r={6} fill={NOIR} />
    </Triangle>
  ),
  B1: () => <Triangle bas />,
  B5: () => (
    <>
      <polygon points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30" fill={ROUGE} stroke={BLANC} strokeWidth={3} />
      <text x={50} y={60} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={900} fontSize={28} fill={BLANC}>
        STOP
      </text>
    </>
  ),
  B9: () => (
    <>
      <polygon points="50,3 97,50 50,97 3,50" fill={BLANC} stroke={NOIR} strokeWidth={1.5} />
      <polygon points="50,16 84,50 50,84 16,50" fill={JAUNE} />
    </>
  ),
  B11: () => (
    <>
      <polygon points="50,3 97,50 50,97 3,50" fill={BLANC} stroke={NOIR} strokeWidth={1.5} />
      <polygon points="50,16 84,50 50,84 16,50" fill={JAUNE} />
      <line x1={30} y1={70} x2={70} y2={30} stroke={NOIR} strokeWidth={8} />
    </>
  ),
  B15: () => (
    <Triangle>
      <rect x={45} y={32} width={10} height={46} fill={NOIR} />
      <rect x={30} y={50} width={40} height={5} fill={NOIR} />
    </Triangle>
  ),
  B17: () => (
    <Triangle>
      <line x1={34} y1={46} x2={66} y2={78} stroke={NOIR} strokeWidth={8} />
      <line x1={66} y1={46} x2={34} y2={78} stroke={NOIR} strokeWidth={8} />
    </Triangle>
  ),
  C1: () => (
    <>
      <circle cx={50} cy={50} r={46} fill={ROUGE} />
      <rect x={18} y={42} width={64} height={16} fill={BLANC} />
    </>
  ),
  C3: () => <Rond />,
  C35: () => (
    <Rond>
      <Voiture x={20} y={38} fill={NOIR} />
      <Voiture x={54} y={38} fill={ROUGE} />
    </Rond>
  ),
  C43: (valeur = '50') => (
    <Rond>
      <text x={50} y={62} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={900} fontSize={valeur.length > 2 ? 30 : 38} fill={NOIR}>
        {valeur}
      </text>
    </Rond>
  ),
  D1: () => (
    <Rond fond={BLEU} bord={null}>
      <path d="M26 50 H62 M50 34 L68 50 L50 66" stroke={BLANC} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Rond>
  ),
  D5: () => (
    <Rond fond={BLEU} bord={null}>
      {[0, 120, 240].map((a) => (
        <g key={a} transform={`rotate(${a} 50 50)`}>
          <path d="M50 20 A30 30 0 0 1 76 35" stroke={BLANC} strokeWidth={7} fill="none" />
          <polygon points="80,29 81,44 68,38" fill={BLANC} />
        </g>
      ))}
    </Rond>
  ),
  E1: () => (
    <Rond fond={BLEU}>
      <line x1={21} y1={21} x2={79} y2={79} stroke={ROUGE} strokeWidth={9} />
    </Rond>
  ),
  E3: () => (
    <Rond fond={BLEU}>
      <line x1={21} y1={21} x2={79} y2={79} stroke={ROUGE} strokeWidth={9} />
      <line x1={79} y1={21} x2={21} y2={79} stroke={ROUGE} strokeWidth={9} />
    </Rond>
  ),
  E9a: () => (
    <>
      <rect x={6} y={6} width={88} height={88} rx={8} fill={BLEU} stroke={BLANC} strokeWidth={3} />
      <text x={50} y={74} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={900} fontSize={64} fill={BLANC}>
        P
      </text>
    </>
  ),
  F1: () => (
    <>
      <rect x={3} y={24} width={94} height={52} rx={4} fill={BLANC} stroke={NOIR} strokeWidth={3} />
      <text x={50} y={58} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={800} fontSize={22} fill={NOIR}>
        MONS
      </text>
    </>
  ),
  F4a: (valeur = '30') => (
    <>
      <rect x={10} y={3} width={80} height={94} rx={6} fill={BLANC} stroke={NOIR} strokeWidth={2} />
      <circle cx={50} cy={38} r={26} fill={BLANC} stroke={ROUGE} strokeWidth={6} />
      <text x={50} y={48} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={900} fontSize={26} fill={NOIR}>
        {valeur}
      </text>
      <text x={50} y={86} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={900} fontSize={18} fill={NOIR}>
        ZONE
      </text>
    </>
  ),
  F5: () => (
    <>
      <rect x={6} y={6} width={88} height={88} rx={8} fill={BLEU} stroke={BLANC} strokeWidth={3} />
      {/* Pont au-dessus d'une chaussée à deux voies */}
      <rect x={20} y={28} width={60} height={9} fill={BLANC} />
      <path d="M36 82 L44 37 M64 82 L56 37" stroke={BLANC} strokeWidth={7} />
      <path d="M50 46 V54 M50 62 V70" stroke={BLANC} strokeWidth={3} />
    </>
  ),
  F12a: () => (
    <>
      <rect x={4} y={14} width={92} height={72} rx={6} fill={BLEU} stroke={BLANC} strokeWidth={3} />
      {/* Maison */}
      <polygon points="14,46 30,32 46,46" fill={BLANC} />
      <rect x={18} y={46} width={24} height={20} fill={BLANC} />
      {/* Personne */}
      <circle cx={58} cy={40} r={5} fill={BLANC} />
      <path d="M58 46 V62 M58 62 L52 74 M58 62 L64 74 M50 52 H66" stroke={BLANC} strokeWidth={4} strokeLinecap="round" />
      {/* Voiture */}
      <rect x={70} y={62} width={20} height={9} rx={2} fill={BLANC} />
      <rect x={74} y={56} width={12} height={7} rx={2} fill={BLANC} />
    </>
  ),
}

// ---------- Scènes de circulation ----------
const ROUTE = '#5d6573'
const MARQUAGE = '#f4f4f4'

function Auto({ x, y, rot = 0, fill, label }: { x: number; y: number; rot?: number; fill: string; label?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-9} y={-15} width={18} height={30} rx={4} fill={fill} stroke="#0b0e13" strokeWidth={1} />
      <rect x={-6} y={-9} width={12} height={7} rx={1.5} fill="#cfe0f5" />
      {label && (
        <text x={0} y={10} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={900} fontSize={7} fill="#fff">
          {label}
        </text>
      )}
    </g>
  )
}

function Fleche({ d }: { d: string }) {
  return (
    <path d={d} stroke="#f2b441" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#pointe)" />
  )
}

const DEFS = (
  <defs>
    <marker id="pointe" viewBox="0 0 10 10" refX={6} refY={5} markerWidth={4} markerHeight={4} orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 Z" fill="#f2b441" />
    </marker>
  </defs>
)

function Carrefour() {
  return (
    <>
      <rect x={0} y={0} width={200} height={200} fill="#9bb07a" />
      <rect x={75} y={0} width={50} height={200} fill={ROUTE} />
      <rect x={0} y={75} width={200} height={50} fill={ROUTE} />
      {[10, 30, 50, 140, 160, 180].map((v) => (
        <g key={v}>
          <rect x={99} y={v} width={2} height={10} fill={MARQUAGE} />
          <rect x={v} y={99} width={10} height={2} fill={MARQUAGE} />
        </g>
      ))}
    </>
  )
}

const SCENES: Record<string, ReactNode> = {
  'carrefour-droite': (
    <>
      <Carrefour />
      <Auto x={112} y={160} fill="#1f4fa3" label="TOI" />
      <Fleche d="M112 140 V110" />
      <Auto x={165} y={88} rot={-90} fill="#c8102e" />
      <Fleche d="M146 88 H128" />
    </>
  ),
  'carrefour-gauche': (
    <>
      <Carrefour />
      <Auto x={112} y={160} fill="#1f4fa3" label="TOI" />
      <Fleche d="M112 140 V104 Q112 88 96 88 H62" />
      <Auto x={88} y={38} rot={180} fill="#c8102e" />
      <Fleche d="M88 58 V128" />
    </>
  ),
  'ligne-continue': (
    <>
      <rect x={0} y={0} width={200} height={200} fill="#9bb07a" />
      <rect x={50} y={0} width={100} height={200} fill={ROUTE} />
      <rect x={98} y={0} width={4} height={200} fill={MARQUAGE} />
      <rect x={52} y={0} width={2} height={200} fill={MARQUAGE} />
      <rect x={146} y={0} width={2} height={200} fill={MARQUAGE} />
      {/* Tracteur lent */}
      <g transform="translate(125 70)">
        <rect x={-10} y={-14} width={20} height={26} rx={2} fill="#2f8a3b" />
        <rect x={-14} y={4} width={6} height={14} rx={2} fill="#1b1b1b" />
        <rect x={8} y={4} width={6} height={14} rx={2} fill="#1b1b1b" />
      </g>
      <Auto x={125} y={150} fill="#1f4fa3" label="TOI" />
    </>
  ),
  'autoroute-insertion': (
    <>
      <rect x={0} y={0} width={200} height={200} fill="#9bb07a" />
      <rect x={60} y={0} width={90} height={200} fill={ROUTE} />
      <path d="M150 200 L150 90 L190 200 Z" fill={ROUTE} />
      <rect x={60} y={0} width={3} height={200} fill={MARQUAGE} />
      {[0, 30, 60, 90, 120, 150, 180].map((v) => (
        <rect key={v} x={104} y={v} width={2} height={14} fill={MARQUAGE} />
      ))}
      {[110, 130, 150, 170].map((v) => (
        <rect key={v} x={149} y={v} width={2} height={10} fill={MARQUAGE} />
      ))}
      <Auto x={128} y={110} fill="#c8102e" />
      <Auto x={168} y={168} rot={-10} fill="#1f4fa3" label="TOI" />
      <Fleche d="M164 146 L156 120" />
    </>
  ),
}

export function Schema({ schema, titre }: { schema: SchemaType; titre: string }) {
  if (schema.type === 'panneau') {
    const dessin = PANNEAUX[schema.code]
    if (!dessin) return null
    return (
      <svg viewBox="0 0 100 100" width={160} height={160} role="img" aria-label={titre}>
        {dessin(schema.valeur)}
      </svg>
    )
  }
  const scene = SCENES[schema.id]
  if (!scene) return null
  return (
    <svg viewBox="0 0 200 200" width={220} height={220} role="img" aria-label={titre} style={{ borderRadius: 10 }}>
      {DEFS}
      {scene}
    </svg>
  )
}

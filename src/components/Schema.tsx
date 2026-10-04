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

/** Panneau E9a (parking), réduit pour laisser la place à un panonceau en dessous. */
function PanneauP() {
  return (
    <>
      <rect x={14} y={4} width={72} height={88} rx={6} fill={BLEU} stroke={BLANC} strokeWidth={3} />
      <text x={50} y={70} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={900} fontSize={58} fill={BLANC}>
        P
      </text>
    </>
  )
}

/** Petit panneau additionnel blanc placé sous le panneau principal. */
function Panonceau({ y = 100, children }: { y?: number; children?: ReactNode }) {
  return (
    <>
      <rect x={6} y={y} width={88} height={44} rx={4} fill={BLANC} stroke={NOIR} strokeWidth={2.5} />
      {children}
    </>
  )
}

/** Zone 30 aux abords d'une école : limite 30 et symbole « enfants » sur une plaque blanche. */
function ZoneEcole() {
  return (
    <>
      <rect x={8} y={2} width={84} height={144} rx={6} fill={BLANC} stroke={NOIR} strokeWidth={2.5} />
      <g transform="translate(17 8) scale(0.66)">
        <Rond>
          <text x={50} y={63} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={900} fontSize={40} fill={NOIR}>
            30
          </text>
        </Rond>
      </g>
      <g transform="translate(22.5 72) scale(0.55)">
        <Triangle>
          <circle cx={40} cy={42} r={5} fill={NOIR} />
          <path d="M40 48 V64 M40 64 L34 78 M40 64 L46 78 M33 54 L47 54" stroke={NOIR} strokeWidth={4.5} fill="none" strokeLinecap="round" />
          <circle cx={60} cy={50} r={4} fill={NOIR} />
          <path d="M60 55 V67 M60 67 L55 78 M60 67 L65 78 M54 59 L66 59" stroke={NOIR} strokeWidth={4} fill="none" strokeLinecap="round" />
        </Triangle>
      </g>
      <text x={50} y={138} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={900} fontSize={16} fill={NOIR}>
        ZONE
      </text>
    </>
  )
}

/** Hauteur du dessin (viewBox) pour les panneaux plus hauts que larges. */
const HAUTEUR_PANNEAU: Record<string, number> = {
  'E9a-handicap': 146,
  'E9a-disque': 146,
  'E9a-livraisons': 146,
  'C43-panonceau': 146,
  'C3-local': 146,
  'zone30-ecole': 148,
  'zone30-ecole-heures': 196,
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
  // ---------- Ajouts : signaux de danger ----------
  A1b: () => (
    <Triangle>
      <path d="M60 80 V64 Q60 48 40 42" stroke={NOIR} strokeWidth={8} fill="none" strokeLinecap="round" />
    </Triangle>
  ),
  A3: (valeur = '10%') => (
    <Triangle>
      <polygon points="22,56 54,78 22,78" fill={NOIR} />
      <text x={66} y={74} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={900} fontSize={12} fill={NOIR}>
        {valeur}
      </text>
    </Triangle>
  ),
  A21: () => (
    <Triangle>
      {[30, 40, 50, 60].map((x) => (
        <rect key={x} x={x} y={72} width={6} height={8} fill={NOIR} />
      ))}
      <circle cx={52} cy={36} r={5} fill={NOIR} />
      <path d="M51 42 L47 56 L41 68 M47 56 L55 68 M42 50 L50 45 L57 52" stroke={NOIR} strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Triangle>
  ),
  A23: () => (
    <Triangle>
      <circle cx={40} cy={42} r={5} fill={NOIR} />
      <path d="M40 48 V64 M40 64 L34 78 M40 64 L46 78 M33 54 L47 54" stroke={NOIR} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <circle cx={60} cy={50} r={4} fill={NOIR} />
      <path d="M60 55 V67 M60 67 L55 78 M60 67 L65 78 M54 59 L66 59" stroke={NOIR} strokeWidth={4} fill="none" strokeLinecap="round" />
    </Triangle>
  ),
  A27: () => (
    <Triangle>
      {/* Cerf qui bondit */}
      <g transform="translate(50 64) scale(0.8) translate(-56 -56)">
      <ellipse cx={48} cy={60} rx={15} ry={7} fill={NOIR} transform="rotate(-12 48 60)" />
      <path d="M60 56 L67 44" stroke={NOIR} strokeWidth={6} strokeLinecap="round" />
      <ellipse cx={70} cy={42} rx={6} ry={4} fill={NOIR} />
      <path d="M67 40 L63 30 M65 35 L60 33 M70 39 L72 29 M71 33 L76 31" stroke={NOIR} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <path d="M56 63 L64 72 L60 80 M54 64 L58 76 M38 63 L28 70 M40 65 L34 78" stroke={NOIR} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </Triangle>
  ),
  A31: () => (
    <Triangle>
      {/* Ouvrier qui pellette */}
      <circle cx={46} cy={40} r={5} fill={NOIR} />
      <path d="M46 46 L50 60 L44 76 M50 60 L58 74 M47 50 L60 56" stroke={NOIR} strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M56 50 L68 68" stroke={NOIR} strokeWidth={3} />
      <polygon points="62,78 74,66 82,78" fill={NOIR} />
    </Triangle>
  ),
  A45: () => (
    <Triangle>
      {/* Barrière */}
      <rect x={28} y={52} width={44} height={6} fill={NOIR} />
      <rect x={28} y={64} width={44} height={6} fill={NOIR} />
      <rect x={32} y={46} width={6} height={32} fill={NOIR} />
      <rect x={62} y={46} width={6} height={32} fill={NOIR} />
    </Triangle>
  ),
  A47: () => (
    <Triangle>
      {/* Locomotive */}
      <rect x={30} y={56} width={30} height={14} fill={NOIR} />
      <rect x={58} y={46} width={14} height={24} fill={NOIR} />
      <rect x={34} y={46} width={6} height={10} fill={NOIR} />
      <circle cx={38} cy={74} r={5} fill={NOIR} />
      <circle cx={52} cy={74} r={5} fill={NOIR} />
      <circle cx={66} cy={74} r={5} fill={NOIR} />
    </Triangle>
  ),

  // ---------- Ajouts : fin de limitation, indication ----------
  C45: (valeur = '70') => (
    <>
      <circle cx={50} cy={50} r={45} fill={BLANC} stroke={NOIR} strokeWidth={2.5} />
      <text x={50} y={62} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={900} fontSize={36} fill="#8f8f8f">
        {valeur}
      </text>
      {[-8, 0, 8].map((d) => (
        <line key={d} x1={22 + d} y1={78 + d} x2={78 + d} y2={22 + d} stroke={NOIR} strokeWidth={2.5} />
      ))}
    </>
  ),
  F19: () => (
    <>
      <rect x={14} y={6} width={72} height={88} rx={6} fill={BLEU} stroke={BLANC} strokeWidth={3} />
      <path d="M50 80 V30 M34 44 L50 24 L66 44" stroke={BLANC} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  F45: () => (
    <>
      <rect x={14} y={6} width={72} height={88} rx={6} fill={BLEU} stroke={BLANC} strokeWidth={3} />
      <rect x={43} y={34} width={14} height={50} fill={BLANC} />
      <rect x={28} y={22} width={44} height={14} fill={ROUGE} />
    </>
  ),

  // ---------- Ajouts : stationnement (avec panonceau) ----------
  'E9a-handicap': () => (
    <>
      <PanneauP />
      <Panonceau>
        <g transform="translate(50 122)" fill="none" stroke={BLEU} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx={-4} cy={-16} r={3} fill={BLEU} stroke="none" />
          <path d="M-4 -11 V0 H8 L12 9" />
          <path d="M-12 -4 A11 11 0 1 0 6 8" />
        </g>
      </Panonceau>
    </>
  ),
  'E9a-disque': () => (
    <>
      <PanneauP />
      <Panonceau>
        <rect x={34} y={108} width={32} height={30} rx={3} fill={BLEU} />
        <circle cx={50} cy={124} r={10} fill={BLANC} />
        <path d="M50 124 V117 M50 124 L55 127" stroke={NOIR} strokeWidth={2} strokeLinecap="round" />
      </Panonceau>
    </>
  ),
  'E9a-livraisons': () => (
    <>
      <PanneauP />
      <Panonceau>
        <text x={50} y={119} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={800} fontSize={12} fill={NOIR}>
          LIVRAISONS
        </text>
        <text x={50} y={136} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={800} fontSize={12} fill={NOIR}>
          7 h – 11 h
        </text>
      </Panonceau>
    </>
  ),
  disque: () => (
    <>
      <rect x={10} y={4} width={80} height={92} rx={6} fill={BLEU} stroke={BLANC} strokeWidth={2} />
      <rect x={16} y={10} width={20} height={20} rx={2} fill={BLANC} />
      <text x={26} y={27} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={900} fontSize={17} fill={BLEU}>
        P
      </text>
      <circle cx={50} cy={60} r={28} fill={BLANC} />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={50} y1={35} x2={50} y2={40} stroke={NOIR} strokeWidth={2} transform={`rotate(${i * 30} 50 60)`} />
      ))}
      <path d="M50 60 V42 M50 60 L41 66" stroke={NOIR} strokeWidth={3} strokeLinecap="round" />
    </>
  ),

  // ---------- Ajouts : zone 30 aux abords d'une école ----------
  'zone30-ecole': () => <ZoneEcole />,
  'zone30-ecole-heures': () => (
    <>
      <ZoneEcole />
      <Panonceau y={150}>
        <text x={50} y={177} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={800} fontSize={15} fill={NOIR}>
          7 h – 17 h
        </text>
      </Panonceau>
    </>
  ),

  // ---------- Ajouts : panneaux avec panonceau ----------
  'C43-panonceau': (valeur = '50') => (
    <>
      <g transform="translate(5 2) scale(0.9)">
        <Rond>
          <text x={50} y={62} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={900} fontSize={38} fill={NOIR}>
            {valeur}
          </text>
        </Rond>
      </g>
      <Panonceau>
        <text x={50} y={130} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={800} fontSize={18} fill={NOIR}>
          200 m
        </text>
      </Panonceau>
    </>
  ),
  'C3-local': () => (
    <>
      <g transform="translate(5 2) scale(0.9)">
        <Rond />
      </g>
      <Panonceau>
        {['EXCEPTÉ', 'CIRCULATION', 'LOCALE'].map((t, i) => (
          <text key={t} x={50} y={114 + i * 12.5} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={800} fontSize={10} fill={NOIR}>
            {t}
          </text>
        ))}
      </Panonceau>
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
    <marker id="pointe-rouge" viewBox="0 0 10 10" refX={6} refY={5} markerWidth={4} markerHeight={4} orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 Z" fill="#ff3b30" />
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

const FOND_CIEL = '#1a2433'
const JAUNE_MARQUAGE = '#f5c400'
const TROTTOIR = '#a9adb3'

/** Feux tricolores vus de face. `velo` dessine le symbole vélo dans le feu allumé. */
function Feux({ allume, velo = false, sansFond = false }: { allume: 'rouge' | 'orange' | 'vert'; velo?: boolean; sansFond?: boolean }) {
  const lampes = [
    { nom: 'rouge', on: '#ff3b30', off: '#3a1716' },
    { nom: 'orange', on: '#ffb020', off: '#3a2c12' },
    { nom: 'vert', on: '#2ee07a', off: '#123222' },
  ] as const
  return (
    <>
      {!sansFond && <rect x={0} y={0} width={200} height={200} fill={FOND_CIEL} />}
      <rect x={68} y={14} width={64} height={172} rx={12} fill="#15171b" stroke="#2c3038" strokeWidth={3} />
      {lampes.map((l, i) => {
        const cy = 50 + i * 50
        const actif = l.nom === allume
        if (velo) {
          return (
            <g key={l.nom}>
              <circle cx={100} cy={cy} r={20} fill="#0b0c0e" />
              <g stroke={actif ? l.on : l.off} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx={89} cy={cy + 6} r={6} />
                <circle cx={111} cy={cy + 6} r={6} />
                <path d={`M89 ${cy + 6} L96 ${cy - 6} H106 L111 ${cy + 6} M96 ${cy - 6} L100 ${cy + 6} L106 ${cy - 6} M94 ${cy - 10} H99`} />
              </g>
            </g>
          )
        }
        return <circle key={l.nom} cx={100} cy={cy} r={20} fill={actif ? l.on : l.off} />
      })}
    </>
  )
}

/** Portique au-dessus d'une autoroute à trois bandes ; la bande du milieu est la tienne. */
function Portique({ centre, cotes = 'fleche' }: { centre: 'croix' | 'fleche' | '90'; cotes?: 'fleche' | '90' }) {
  const panneau = (x: number, type: 'croix' | 'fleche' | '90') => (
    <g key={x} transform={`translate(${x} 26)`}>
      <rect x={-20} y={0} width={40} height={40} rx={3} fill="#0b0c0e" stroke="#3a3f48" strokeWidth={2} />
      {type === 'croix' && <path d="M-11 9 L11 31 M11 9 L-11 31" stroke="#ff3b30" strokeWidth={5} strokeLinecap="round" />}
      {type === 'fleche' && <path d="M0 8 V30 M-9 21 L0 31 L9 21" stroke="#2ee07a" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {type === '90' && (
        <>
          <circle cx={0} cy={20} r={16} fill="none" stroke="#ff3b30" strokeWidth={3.5} />
          <text x={0} y={26} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={900} fontSize={15} fill={BLANC}>
            90
          </text>
        </>
      )}
    </g>
  )
  return (
    <>
      <rect x={0} y={0} width={200} height={200} fill={FOND_CIEL} />
      {/* Chaussée en perspective */}
      <polygon points="70,92 130,92 200,200 0,200" fill={ROUTE} />
      <polygon points="0,200 70,92 60,92 0,170" fill="#55704a" />
      <polygon points="200,200 130,92 140,92 200,170" fill="#55704a" />
      {[0.33, 0.67].map((t) => (
        <g key={t}>
          {[0, 1, 2, 3].map((k) => {
            const y1 = 96 + k * 27
            const y2 = y1 + 14
            const xa = (y: number) => 70 + 60 * t + (y - 92) / 108 * (200 * t - 70 - 60 * t)
            return <line key={k} x1={xa(y1)} y1={y1} x2={xa(y2)} y2={y2} stroke={MARQUAGE} strokeWidth={2 + k * 0.6} />
          })}
        </g>
      ))}
      {/* Portique */}
      <rect x={14} y={18} width={6} height={110} fill="#8a919c" />
      <rect x={180} y={18} width={6} height={110} fill="#8a919c" />
      <rect x={14} y={18} width={172} height={8} fill="#8a919c" />
      {panneau(52, cotes === '90' ? '90' : 'fleche')}
      {panneau(100, centre)}
      {panneau(148, cotes === '90' ? '90' : 'fleche')}
      <Auto x={100} y={176} fill="#1f4fa3" label="TOI" />
    </>
  )
}

/** Fond sombre façon tableau de bord avec un voyant allumé au centre. */
function Voyant({ couleur, children }: { couleur: string; children: ReactNode }) {
  return (
    <>
      <rect x={0} y={0} width={200} height={200} fill="#0b0e13" />
      <circle cx={100} cy={100} r={84} fill="#11161e" stroke="#262d38" strokeWidth={3} />
      <g color={couleur} style={{ filter: `drop-shadow(0 0 6px ${couleur})` }}>
        {children}
      </g>
    </>
  )
}

/** Route droite à deux sens, vue de dessus. */
function RouteDroite() {
  return (
    <>
      <rect x={0} y={0} width={200} height={200} fill="#9bb07a" />
      <rect x={40} y={0} width={120} height={200} fill={ROUTE} />
      <rect x={44} y={0} width={2} height={200} fill={MARQUAGE} />
      <rect x={154} y={0} width={2} height={200} fill={MARQUAGE} />
    </>
  )
}

/** Rue en ville avec un trottoir à droite, vue de dessus. */
function RueTrottoir() {
  return (
    <>
      <rect x={0} y={0} width={200} height={200} fill={ROUTE} />
      <rect x={158} y={0} width={42} height={200} fill={TROTTOIR} />
      <rect x={156} y={0} width={4} height={200} fill="#d6d9dd" />
      {[0, 40, 80, 120, 160].map((y) => (
        <rect key={y} x={60} y={y + 10} width={3} height={20} fill={MARQUAGE} />
      ))}
    </>
  )
}

/** Route qui arrive (en bas) sur une route transversale, vue de dessus. */
function Croisement() {
  return (
    <>
      <rect x={0} y={0} width={200} height={200} fill="#9bb07a" />
      <rect x={0} y={60} width={200} height={60} fill={ROUTE} />
      <rect x={50} y={120} width={100} height={80} fill={ROUTE} />
      {[10, 40, 70, 100, 130, 160, 190].map((x) => (
        <rect key={x} x={x - 5} y={89} width={12} height={2} fill={MARQUAGE} />
      ))}
      <rect x={99} y={140} width={2} height={60} fill={MARQUAGE} />
    </>
  )
}

const PISTE = '#a8553f'
const TERRE = '#9c7b4f'
const PARKING = '#6c737e'

/** Cycliste vu de dessus (rot = direction, 0 = vers le haut). */
function Velo({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-1.5} y={-13} width={3} height={26} rx={1.5} fill="#1b1b1b" />
      <ellipse cx={0} cy={1} rx={7} ry={5} fill="#e0791f" />
      <circle cx={0} cy={-3} r={3.5} fill="#f4f4f4" stroke="#1b1b1b" strokeWidth={1} />
    </g>
  )
}

/** Piéton vu de dessus. */
function Pieton({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={0} rx={6} ry={4} fill="#d94f8a" />
      <circle cx={0} cy={0} r={2.8} fill="#3b2a20" />
    </g>
  )
}

/** Tram vu de dessus (90 de long). */
function Tram({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-11} y={-45} width={22} height={90} rx={5} fill="#cfd3d8" stroke="#0b0e13" strokeWidth={1} />
      <rect x={-11} y={-16} width={22} height={2} fill="#8a919c" />
      <rect x={-11} y={14} width={22} height={2} fill="#8a919c" />
      <rect x={-8} y={-43} width={16} height={6} rx={2} fill="#9fc1e6" />
    </g>
  )
}

/** Bus vu de dessus ; `clignotant` allume les clignotants gauches. */
function Bus({ x, y, rot = 0, clignotant = false }: { x: number; y: number; rot?: number; clignotant?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-11} y={-30} width={22} height={60} rx={3} fill="#e2b33c" stroke="#0b0e13" strokeWidth={1} />
      <rect x={-8} y={-28} width={16} height={6} rx={1.5} fill="#cfe0f5" />
      <rect x={-6} y={-10} width={12} height={20} rx={1} fill="#c99a2a" />
      {clignotant && (
        <>
          <circle cx={-11} cy={-28} r={3} fill="#ffb020" />
          <circle cx={-11} cy={28} r={3} fill="#ffb020" />
        </>
      )}
    </g>
  )
}

/** Tracteur vu de dessus. */
function Tracteur({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-10} y={-14} width={20} height={26} rx={2} fill="#2f8a3b" stroke="#0b0e13" strokeWidth={1} />
      <rect x={-15} y={2} width={6} height={14} rx={2} fill="#1b1b1b" />
      <rect x={9} y={2} width={6} height={14} rx={2} fill="#1b1b1b" />
      <rect x={-12} y={-14} width={4} height={8} rx={1} fill="#1b1b1b" />
      <rect x={8} y={-14} width={4} height={8} rx={1} fill="#1b1b1b" />
    </g>
  )
}

/** Clignotants d'une voiture (côté gauche) à la position donnée. */
function ClignoGauche({ x, y }: { x: number; y: number }) {
  return (
    <>
      <circle cx={x - 9} cy={y - 13} r={2.8} fill="#ffb020" />
      <circle cx={x - 9} cy={y + 13} r={2.8} fill="#ffb020" />
    </>
  )
}

/** Agent qualifié vu de face. */
function Agent({ bras }: { bras: 'leve' | 'tendus' }) {
  const bleu = '#1f3b73'
  return (
    <>
      <rect x={0} y={0} width={200} height={200} fill={FOND_CIEL} />
      <rect x={0} y={150} width={200} height={50} fill={ROUTE} />
      {[20, 70, 120, 170].map((x) => (
        <rect key={x} x={x} y={174} width={20} height={3} fill={MARQUAGE} />
      ))}
      <g stroke={bleu} strokeWidth={12} strokeLinecap="round" fill="none">
        {/* Jambes */}
        <path d="M92 120 L88 168 M108 120 L112 168" />
        {/* Bras */}
        {bras === 'leve' ? <path d="M84 72 L66 108 M116 72 L118 22" /> : <path d="M84 72 L40 72 M116 72 L160 72" />}
      </g>
      <rect x={82} y={62} width={36} height={64} rx={8} fill={bleu} />
      <rect x={82} y={84} width={36} height={6} fill="#c9d3e3" />
      {bras === 'leve' ? (
        <>
          <circle cx={66} cy={110} r={6} fill={BLANC} />
          <circle cx={118} cy={18} r={6} fill={BLANC} />
        </>
      ) : (
        <>
          <circle cx={36} cy={72} r={6} fill={BLANC} />
          <circle cx={164} cy={72} r={6} fill={BLANC} />
        </>
      )}
      <circle cx={100} cy={48} r={12} fill="#d9a77c" />
      <rect x={86} y={30} width={28} height={10} rx={3} fill={bleu} />
      <rect x={84} y={38} width={32} height={4} rx={2} fill="#0f1d3a" />
    </>
  )
}

/** Route verticale avec trottoirs des deux côtés. */
function RueDeuxTrottoirs({ ligne = true }: { ligne?: boolean }) {
  return (
    <>
      <rect x={0} y={0} width={200} height={200} fill={ROUTE} />
      <rect x={0} y={0} width={30} height={200} fill={TROTTOIR} />
      <rect x={170} y={0} width={30} height={200} fill={TROTTOIR} />
      <rect x={30} y={0} width={3} height={200} fill="#d6d9dd" />
      <rect x={167} y={0} width={3} height={200} fill="#d6d9dd" />
      {ligne && [0, 40, 80, 120, 160].map((y) => <rect key={y} x={99} y={y + 10} width={3} height={20} fill={MARQUAGE} />)}
    </>
  )
}

/** Route de campagne à deux sens, vue de dessus. */
function RouteCampagne({ centre = 'tirets', etroite = false }: { centre?: 'tirets' | 'continue' | 'aucune'; etroite?: boolean }) {
  const [g, d] = etroite ? [66, 134] : [40, 160]
  return (
    <>
      <rect x={0} y={0} width={200} height={200} fill="#9bb07a" />
      <rect x={g} y={0} width={d - g} height={200} fill={ROUTE} />
      <rect x={g + 3} y={0} width={2} height={200} fill={MARQUAGE} />
      <rect x={d - 5} y={0} width={2} height={200} fill={MARQUAGE} />
      {centre === 'continue' && <rect x={98} y={0} width={4} height={200} fill={MARQUAGE} />}
      {centre === 'tirets' && [0, 40, 80, 120, 160].map((y) => <rect key={y} x={99} y={y + 10} width={3} height={20} fill={MARQUAGE} />)}
    </>
  )
}

/** Cote avec un point d'interrogation entre deux positions horizontales. */
function Cote({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return (
    <g stroke="#f2b441" strokeWidth={2} fill="none">
      <path d={`M${x1} ${y} H${x2} M${x1} ${y - 5} V${y + 5} M${x2} ${y - 5} V${y + 5}`} />
      <rect x={(x1 + x2) / 2 - 8} y={y + 8} width={16} height={16} rx={3} fill="#0b0e13" stroke="#f2b441" />
      <text x={(x1 + x2) / 2} y={y + 21} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={900} fontSize={12} fill="#f2b441" stroke="none">
        ?
      </text>
    </g>
  )
}

/** Cavalier vu de dessus. */
function Cavalier({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={0} rx={6} ry={16} fill="#7b4a26" />
      <ellipse cx={0} cy={-17} rx={3.5} ry={6} fill="#7b4a26" />
      <circle cx={0} cy={-2} r={4} fill="#1f3b73" />
    </g>
  )
}

/** Camion vu de dessus. */
function Camion({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-11} y={-34} width={22} height={14} rx={3} fill="#c8102e" stroke="#0b0e13" strokeWidth={1} />
      <rect x={-12} y={-18} width={24} height={52} rx={2} fill="#d7dbe0" stroke="#0b0e13" strokeWidth={1} />
    </g>
  )
}

/** Voiture vue de côté, posée sur une pente (angle en degrés), roues au point (x, y). */
function AutoProfil({ x, y, angle, fill, cachee = false, sens = 1 }: { x: number; y: number; angle: number; fill: string; cachee?: boolean; sens?: 1 | -1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${1.2 * sens} 1.2) translate(-13 -21)`} opacity={cachee ? 0.45 : 1}>
      <path d="M0 10 L4 3 Q5 1 8 1 L18 1 Q21 1 22 3 L26 10 Z" fill={fill} strokeDasharray={cachee ? '2 2' : undefined} stroke={cachee ? BLANC : 'none'} strokeWidth={0.8} />
      <rect x={-1} y={9} width={28} height={8} rx={2} fill={fill} />
      <circle cx={6} cy={18} r={3} fill={NOIR} />
      <circle cx={20} cy={18} r={3} fill={NOIR} />
    </g>
  )
}

/** Autoroute à trois bandes vue de dessus (sens de circulation vers le haut). Centres des bandes : 43, 89, 135 ; bande d'arrêt d'urgence : 171. */
function Autoroute({ bauOuverte = false }: { bauOuverte?: boolean }) {
  return (
    <>
      <rect x={0} y={0} width={200} height={200} fill="#9bb07a" />
      <rect x={0} y={0} width={14} height={200} fill="#7f9663" />
      <rect x={10} y={0} width={3} height={200} fill="#c4c9cf" />
      <rect x={16} y={0} width={168} height={200} fill={ROUTE} />
      <rect x={19} y={0} width={3} height={200} fill={MARQUAGE} />
      {[66, 112].map((x) => [0, 40, 80, 120, 160].map((y) => <rect key={`${x}-${y}`} x={x - 1} y={y + 6} width={3} height={24} fill={MARQUAGE} />))}
      {bauOuverte
        ? [0, 40, 80, 120, 160].map((y) => <rect key={y} x={157} y={y + 6} width={3} height={24} fill={MARQUAGE} />)
        : <rect x={157} y={0} width={3} height={200} fill={MARQUAGE} />}
      <rect x={181} y={0} width={3} height={200} fill={MARQUAGE} />
      <rect x={190} y={0} width={3} height={200} fill="#c4c9cf" />
      {[10, 50, 90, 130, 170].map((y) => <rect key={y} x={189} y={y} width={5} height={4} fill="#8a919c" />)}
    </>
  )
}

/** Feux de détresse : quatre clignotants allumés. */
function Detresse({ x, y }: { x: number; y: number }) {
  return (
    <>
      {[[-9, -13], [9, -13], [-9, 13], [9, 13]].map(([dx, dy]) => (
        <circle key={`${dx}${dy}`} cx={x + dx} cy={y + dy} r={2.8} fill="#ffb020" />
      ))}
    </>
  )
}

/** Petite étiquette « ? ». */
function Question({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x - 8} y={y - 8} width={16} height={16} rx={3} fill="#0b0e13" stroke="#f2b441" strokeWidth={2} />
      <text x={x} y={y + 5} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={900} fontSize={12} fill="#f2b441">
        ?
      </text>
    </g>
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
  // ---------- Feux de signalisation ----------
  'feu-orange': <Feux allume="orange" />,
  'feu-rouge': <Feux allume="rouge" />,
  'feu-velo': <Feux allume="rouge" velo />,
  'feu-vert-cedez': (
    <>
      <rect x={0} y={0} width={200} height={200} fill={FOND_CIEL} />
      <rect x={96} y={20} width={8} height={180} fill="#8a919c" />
      <g transform="translate(50 12) scale(0.5)">
        <Feux allume="vert" sansFond />
      </g>
      <g transform="translate(70 118) scale(0.6)">
        <polygon points="5,13 95,13 50,93" fill={BLANC} stroke={ROUGE} strokeWidth={9} strokeLinejoin="round" />
      </g>
    </>
  ),

  // ---------- Portiques d'autoroute ----------
  'portique-croix': <Portique centre="croix" />,
  'portique-fleche': <Portique centre="fleche" />,
  'portique-90': <Portique centre="90" cotes="90" />,

  // ---------- Voyants du tableau de bord ----------
  'voyant-route': (
    <Voyant couleur="#3d8bff">
      <path d="M92 70 Q60 70 60 100 Q60 130 92 130 Z" fill="currentColor" />
      {[78, 92, 106, 120].map((y) => (
        <line key={y} x1={102} y1={y} x2={140} y2={y} stroke="currentColor" strokeWidth={7} strokeLinecap="round" />
      ))}
    </Voyant>
  ),
  'voyant-croisement': (
    <Voyant couleur="#39d98a">
      <path d="M92 70 Q60 70 60 100 Q60 130 92 130 Z" fill="currentColor" />
      {[76, 92, 108, 124].map((y) => (
        <line key={y} x1={102} y1={y} x2={138} y2={y + 12} stroke="currentColor" strokeWidth={7} strokeLinecap="round" />
      ))}
    </Voyant>
  ),
  'voyant-huile': (
    <Voyant couleur="#ff4d5e">
      {/* Burette d'huile avec une goutte */}
      <path d="M58 92 H74 L80 84 H112 L150 70 L152 76 L124 100 V122 H74 V102 L58 98 Z" fill="currentColor" />
      <rect x={88} y={76} width={14} height={8} fill="currentColor" />
      <path d="M154 86 Q160 98 154 104 Q148 98 154 86 Z" fill="currentColor" />
    </Voyant>
  ),
  'voyant-abs': (
    <Voyant couleur="#ffb020">
      <circle cx={100} cy={100} r={34} fill="none" stroke="currentColor" strokeWidth={7} />
      <path d="M58 70 Q44 100 58 130 M142 70 Q156 100 142 130" fill="none" stroke="currentColor" strokeWidth={7} strokeLinecap="round" />
      <text x={100} y={108} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={900} fontSize={20} fill="currentColor">
        ABS
      </text>
    </Voyant>
  ),

  // ---------- Marquages au sol (vue de dessus) ----------
  'ligne-mixte': (
    <>
      <RouteDroite />
      <rect x={95} y={0} width={4} height={200} fill={MARQUAGE} />
      {[0, 25, 50, 75, 100, 125, 150, 175].map((y) => (
        <rect key={y} x={103} y={y + 4} width={4} height={14} fill={MARQUAGE} />
      ))}
    </>
  ),
  'jaune-discontinue': (
    <>
      <RueTrottoir />
      {[0, 25, 50, 75, 100, 125, 150, 175].map((y) => (
        <rect key={y} x={150} y={y + 3} width={5} height={14} fill={JAUNE_MARQUAGE} />
      ))}
    </>
  ),
  'jaune-continue': (
    <>
      <RueTrottoir />
      <rect x={150} y={0} width={5} height={200} fill={JAUNE_MARQUAGE} />
    </>
  ),
  'zigzag-jaune': (
    <>
      <RueTrottoir />
      <path d="M140 10 L124 35 L140 60 L124 85 L140 110 L124 135 L140 160 L124 185" fill="none" stroke={JAUNE_MARQUAGE} strokeWidth={4} strokeLinejoin="miter" />
    </>
  ),
  'dents-de-requin': (
    <>
      <Croisement />
      {[108, 124, 140].map((x) => (
        <polygon key={x} points={`${x - 7},126 ${x + 7},126 ${x},142`} fill={MARQUAGE} />
      ))}
      <Auto x={124} y={172} fill="#1f4fa3" label="TOI" />
    </>
  ),
  'passage-cyclistes': (
    <>
      <Croisement />
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i}>
          <rect x={52 + i * 10} y={130} width={6} height={6} fill={MARQUAGE} />
          <rect x={52 + i * 10} y={146} width={6} height={6} fill={MARQUAGE} />
        </g>
      ))}
    </>
  ),
  'ligne-arret': (
    <>
      <Croisement />
      <rect x={102} y={130} width={44} height={6} fill={MARQUAGE} />
      <g transform="translate(150 132) scale(0.22)">
        <Feux allume="rouge" sansFond />
      </g>
      <Auto x={124} y={168} fill="#1f4fa3" label="TOI" />
    </>
  ),
  // ---------- Étape 5 : carrefours, priorités, trams et bus ----------
  'carrefour-velo-droite': (
    <>
      <Carrefour />
      <Auto x={112} y={160} fill="#1f4fa3" label="TOI" />
      <Fleche d="M112 140 V110" />
      <Velo x={165} y={88} rot={-90} />
      <Fleche d="M148 88 H130" />
    </>
  ),
  'carrefour-voiture-gauche': (
    <>
      <Carrefour />
      <Auto x={112} y={160} fill="#1f4fa3" label="TOI" />
      <Fleche d="M112 140 V110" />
      <Auto x={35} y={112} rot={90} fill="#c8102e" />
      <Fleche d="M54 112 H72" />
    </>
  ),
  'tram-carrefour': (
    <>
      <Carrefour />
      <rect x={0} y={95} width={200} height={2} fill="#2b2f36" />
      <rect x={0} y={103} width={200} height={2} fill="#2b2f36" />
      <Tram x={178} y={100} rot={-90} />
      <Fleche d="M130 100 H112" />
      <Auto x={112} y={168} fill="#1f4fa3" label="TOI" />
      <Fleche d="M112 148 V130" />
    </>
  ),
  'tram-arret': (
    <>
      <RueDeuxTrottoirs ligne={false} />
      <rect x={85} y={0} width={2} height={200} fill="#2b2f36" />
      <rect x={97} y={0} width={2} height={200} fill="#2b2f36" />
      <Tram x={92} y={62} />
      <Pieton x={114} y={52} />
      <Pieton x={132} y={66} />
      <Pieton x={150} y={50} />
      <Auto x={136} y={168} fill="#1f4fa3" label="TOI" />
      <Fleche d="M136 148 V122" />
    </>
  ),
  'bus-quitte-arret': (
    <>
      <RueTrottoir />
      <rect x={176} y={40} width={4} height={30} fill="#8a919c" />
      <rect x={170} y={32} width={16} height={12} rx={2} fill="#1f4fa3" />
      <Bus x={140} y={66} clignotant />
      <Fleche d="M128 34 L114 12" />
      <Auto x={110} y={168} fill="#1f4fa3" label="TOI" />
      <Fleche d="M110 148 V124" />
    </>
  ),
  'bus-arret': (
    <>
      <RueTrottoir />
      <rect x={176} y={40} width={4} height={30} fill="#8a919c" />
      <rect x={170} y={32} width={16} height={12} rx={2} fill="#1f4fa3" />
      <Bus x={140} y={66} />
      <Auto x={100} y={168} fill="#1f4fa3" label="TOI" />
      <Fleche d="M100 148 V110" />
    </>
  ),
  'droite-cycliste': (
    <>
      <Carrefour />
      <rect x={126} y={125} width={10} height={75} fill={PISTE} />
      <rect x={126} y={0} width={10} height={75} fill={PISTE} />
      <Velo x={131} y={178} />
      <Fleche d="M131 162 V134" />
      <Auto x={110} y={168} fill="#1f4fa3" label="TOI" />
      <Fleche d="M110 148 V124 Q110 112 122 112 H156" />
    </>
  ),
  'parking-piste': (
    <>
      <rect x={0} y={0} width={200} height={200} fill={PARKING} />
      <rect x={0} y={20} width={200} height={56} fill={ROUTE} />
      {[10, 50, 90, 130, 170].map((x) => <rect key={x} x={x} y={47} width={20} height={2} fill={MARQUAGE} />)}
      <rect x={0} y={76} width={200} height={8} fill={TROTTOIR} />
      <rect x={0} y={84} width={200} height={14} fill={PISTE} />
      <rect x={0} y={98} width={200} height={8} fill={TROTTOIR} />
      {[16, 40, 140, 164, 188].map((x) => <rect key={x} x={x} y={120} width={2} height={34} fill={MARQUAGE} />)}
      <Velo x={34} y={91} rot={90} />
      <Fleche d="M50 91 H72" />
      <Auto x={100} y={168} fill="#1f4fa3" label="TOI" />
      <Fleche d="M100 148 V114" />
    </>
  ),
  'gauche-piste': (
    <>
      <RouteDroite />
      <rect x={98} y={0} width={4} height={200} fill={MARQUAGE} />
      <rect x={138} y={0} width={16} height={200} fill={PISTE} />
      {[0, 25, 50, 75, 100, 125, 150, 175].map((y) => <rect key={y} x={136} y={y + 4} width={2} height={12} fill={MARQUAGE} />)}
      <Auto x={120} y={72} fill="#c8102e" />
      <ClignoGauche x={120} y={72} />
      <Fleche d="M118 52 Q116 34 94 30" />
      <Auto x={120} y={168} fill="#1f4fa3" label="TOI" />
    </>
  ),
  'passage-pietons-arret': (
    <>
      <RueDeuxTrottoirs />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={36 + i * 15} y={56} width={9} height={26} fill={MARQUAGE} />
      ))}
      {/* Flèches au sol : sens unique, deux bandes */}
      {[66, 134].map((x) => (
        <path key={x} d={`M${x} 40 V24 M${x - 5} 29 L${x} 22 L${x + 5} 29`} stroke={MARQUAGE} strokeWidth={2.5} fill="none" />
      ))}
      <Pieton x={160} y={69} />
      <Auto x={134} y={104} fill="#c8102e" />
      <Auto x={66} y={168} fill="#1f4fa3" label="TOI" />
      <Fleche d="M66 148 V122" />
    </>
  ),
  'chemin-terre': (
    <>
      <rect x={0} y={0} width={200} height={200} fill="#9bb07a" />
      <rect x={0} y={60} width={200} height={60} fill={ROUTE} />
      {[10, 50, 90, 130, 170].map((x) => <rect key={x} x={x} y={89} width={20} height={2} fill={MARQUAGE} />)}
      <rect x={84} y={120} width={32} height={80} fill={TERRE} />
      {[[90, 135], [108, 150], [94, 170], [110, 188], [88, 192]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={1.6} fill="#7a5e39" />
      ))}
      <Auto x={100} y={168} fill="#1f4fa3" label="TOI" />
      <Fleche d="M100 148 V128" />
      <Auto x={32} y={105} rot={90} fill="#c8102e" />
      <Fleche d="M50 105 H72" />
    </>
  ),
  'tracteur-chemin': (
    <>
      <rect x={0} y={0} width={200} height={200} fill="#9bb07a" />
      <rect x={60} y={0} width={80} height={200} fill={ROUTE} />
      {[0, 40, 80, 120, 160].map((y) => <rect key={y} x={99} y={y + 10} width={2} height={20} fill={MARQUAGE} />)}
      <rect x={140} y={64} width={60} height={34} fill={TERRE} />
      <Tracteur x={172} y={81} rot={-90} />
      <Fleche d="M154 81 H136" />
      <Auto x={120} y={168} fill="#1f4fa3" label="TOI" />
      <Fleche d="M120 148 V112" />
    </>
  ),
  'sortie-parking': (
    <>
      <rect x={0} y={0} width={200} height={200} fill={PARKING} />
      <rect x={0} y={16} width={200} height={62} fill={ROUTE} />
      {[10, 50, 90, 130, 170].map((x) => <rect key={x} x={x} y={46} width={20} height={2} fill={MARQUAGE} />)}
      <rect x={0} y={78} width={200} height={14} fill={TROTTOIR} />
      {[16, 40, 140, 164, 188].map((x) => <rect key={x} x={x} y={110} width={2} height={40} fill={MARQUAGE} />)}
      <rect x={6} y={150} width={44} height={2} fill={MARQUAGE} />
      <rect x={140} y={150} width={54} height={2} fill={MARQUAGE} />
      <Auto x={36} y={63} rot={90} fill="#c8102e" />
      <Auto x={168} y={31} rot={-90} fill="#6b7f2a" />
      <Pieton x={146} y={85} />
      <Auto x={100} y={150} fill="#1f4fa3" label="TOI" />
      <Fleche d="M100 130 V96" />
    </>
  ),
  'carrefour-encombre': (
    <>
      <Carrefour />
      <rect x={102} y={128} width={22} height={4} fill={MARQUAGE} />
      <Auto x={112} y={92} fill="#c8102e" />
      <Auto x={112} y={54} fill="#6b7f2a" />
      <Auto x={112} y={18} fill="#8a5cc2" />
      <g transform="translate(130 132) scale(0.22)">
        <Feux allume="vert" sansFond />
      </g>
      <Auto x={112} y={162} fill="#1f4fa3" label="TOI" />
    </>
  ),
  'agent-bras-leve': <Agent bras="leve" />,
  'agent-bras-tendus': <Agent bras="tendus" />,
  // ---------- Étape 5 : dépassement et cyclistes ----------
  'depasser-cycliste-campagne': (
    <>
      <RouteCampagne />
      <Velo x={142} y={96} />
      <Auto x={104} y={100} fill="#1f4fa3" label="TOI" />
      <Cote x1={114} x2={137} y={100} />
      <Fleche d="M104 80 V56" />
    </>
  ),
  'depasser-cycliste-ville': (
    <>
      <RueDeuxTrottoirs />
      <Velo x={154} y={96} />
      <Auto x={118} y={100} fill="#1f4fa3" label="TOI" />
      <Cote x1={128} x2={149} y={100} />
      <Fleche d="M118 80 V56" />
    </>
  ),
  'route-etroite-cycliste': (
    <>
      <RouteCampagne centre="aucune" etroite />
      <Velo x={118} y={82} />
      <Auto x={84} y={26} rot={180} fill="#c8102e" />
      <Auto x={112} y={162} fill="#1f4fa3" label="TOI" />
    </>
  ),
  'groupe-cyclistes': (
    <>
      <RouteCampagne />
      <Velo x={124} y={52} />
      <Velo x={142} y={52} />
      <Velo x={124} y={84} />
      <Velo x={142} y={84} />
      <Auto x={132} y={162} fill="#1f4fa3" label="TOI" />
    </>
  ),
  'rabattre-cycliste': (
    <>
      <RouteCampagne />
      <Velo x={142} y={150} />
      <Auto x={112} y={96} fill="#1f4fa3" label="TOI" />
      <Fleche d="M112 76 V60" />
    </>
  ),
  'tracteur-discontinue': (
    <>
      <RouteCampagne />
      <Tracteur x={130} y={92} />
      <Auto x={130} y={160} fill="#1f4fa3" label="TOI" />
    </>
  ),
  'sommet-cote': (
    <>
      <rect x={0} y={0} width={200} height={200} fill={FOND_CIEL} />
      <path d="M0 200 L0 150 Q100 40 200 150 L200 200 Z" fill="#55704a" />
      <path d="M0 150 Q100 40 200 150" stroke={ROUTE} strokeWidth={8} fill="none" />
      <AutoProfil x={24} y={125} angle={-40} fill="#1f4fa3" />
      <AutoProfil x={68} y={99} angle={-19} fill="#6b7f2a" />
      <AutoProfil x={168} y={119} angle={37} fill="#c8102e" cachee sens={-1} />
      <text x={168} y={92} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={900} fontSize={18} fill="#f2b441">
        ?
      </text>
      <text x={30} y={156} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={900} fontSize={10} fill={BLANC}>
        TOI
      </text>
    </>
  ),
  'carrefour-depassement': (
    <>
      <Carrefour />
      <Auto x={112} y={140} fill="#6b7f2a" />
      <Auto x={112} y={176} fill="#1f4fa3" label="TOI" />
    </>
  ),
  'depasser-cavalier': (
    <>
      <RouteCampagne centre="aucune" etroite />
      <Cavalier x={120} y={80} />
      <Auto x={112} y={160} fill="#1f4fa3" label="TOI" />
    </>
  ),
  'croisement-etroit': (
    <>
      <RouteCampagne centre="aucune" etroite />
      <Auto x={86} y={44} rot={180} fill="#c8102e" />
      <Auto x={114} y={156} fill="#1f4fa3" label="TOI" />
    </>
  ),
  'double-depassement': (
    <>
      <RouteCampagne />
      <Auto x={130} y={56} fill="#6b7f2a" />
      <Auto x={76} y={80} fill="#c8102e" />
      <ClignoGauche x={76} y={80} />
      <Auto x={130} y={150} fill="#1f4fa3" label="TOI" />
    </>
  ),
  'deja-depasse': (
    <>
      <RouteCampagne />
      <Camion x={130} y={50} />
      <Auto x={130} y={118} fill="#1f4fa3" label="TOI" />
      <Auto x={76} y={170} fill="#c8102e" />
      <ClignoGauche x={76} y={170} />
      <Fleche d="M76 150 V128" />
    </>
  ),
  // ---------- Étape 5 : autoroute ----------
  'autoroute-3-bandes': (
    <>
      <Autoroute />
      <Auto x={89} y={176} fill="#1f4fa3" label="TOI" />
      {[43, 89, 135].map((x) => (
        <g key={x}>
          <path d={`M89 156 Q89 120 ${x} 90`} stroke="#f2b441" strokeWidth={2} strokeDasharray="4 4" fill="none" />
          <Question x={x} y={76} />
        </g>
      ))}
      <Auto x={135} y={20} fill="#6b7f2a" />
    </>
  ),
  'autoroute-camions': (
    <>
      <Autoroute />
      <Camion x={135} y={60} />
      <Camion x={89} y={150} />
      <Auto x={43} y={40} fill="#c8102e" />
      <Auto x={135} y={160} fill="#1f4fa3" label="TOI" />
    </>
  ),
  'bau-arret': (
    <>
      <Autoroute />
      <Auto x={171} y={96} fill="#1f4fa3" label="TOI" />
      <Auto x={135} y={40} fill="#6b7f2a" />
      <Camion x={89} y={150} />
    </>
  ),
  'bau-marche-arriere': (
    <>
      <Autoroute />
      <g transform="translate(120 172)">
        <rect x={0} y={0} width={44} height={20} rx={3} fill="#1f4fa3" stroke={BLANC} strokeWidth={1.5} />
        <text x={22} y={14} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={800} fontSize={10} fill={BLANC}>
          SORTIE
        </text>
      </g>
      <Auto x={171} y={70} fill="#1f4fa3" label="TOI" />
      <path d="M171 92 V140" stroke="#f2b441" strokeWidth={3} strokeDasharray="5 4" fill="none" markerEnd="url(#pointe)" />
      <Question x={150} y={120} />
    </>
  ),
  'sortie-autoroute': (
    <>
      <Autoroute />
      <path d="M184 130 L200 70 L200 0 L184 0 Z" fill={ROUTE} />
      <g transform="translate(150 10)">
        <rect x={0} y={0} width={44} height={22} rx={3} fill="#1f4fa3" stroke={BLANC} strokeWidth={1.5} />
        <text x={22} y={15} textAnchor="middle" fontFamily="Overpass, Arial, sans-serif" fontWeight={800} fontSize={10} fill={BLANC}>
          SORTIE
        </text>
      </g>
      <Auto x={43} y={160} fill="#1f4fa3" label="TOI" />
      <Question x={43} y={128} />
    </>
  ),
  'changement-bande': (
    <>
      <Autoroute />
      <Auto x={135} y={100} fill="#1f4fa3" label="TOI" />
      <Auto x={89} y={138} fill="#c8102e" />
      <Auto x={89} y={30} fill="#6b7f2a" />
      <path d="M126 92 L100 70" stroke="#f2b441" strokeWidth={2} strokeDasharray="4 4" fill="none" markerEnd="url(#pointe)" />
    </>
  ),
  'depasser-camion': (
    <>
      <Autoroute />
      <Camion x={135} y={140} />
      <Auto x={89} y={84} fill="#1f4fa3" label="TOI" />
      <Fleche d="M89 64 V40" />
    </>
  ),
  'files-denses': (
    <>
      <Autoroute />
      {[43, 89, 135].map((x, i) => [12, 52, 92, 132].map((y) => (
        <Auto key={`${x}-${y}`} x={x} y={y + (i % 2) * 14} fill={['#c8102e', '#6b7f2a', '#8a5cc2'][(y / 40 + i) % 3 | 0]} />
      )))}
      <Auto x={135} y={180} fill="#1f4fa3" label="TOI" />
    </>
  ),
  contresens: (
    <>
      <Autoroute />
      <Auto x={43} y={30} rot={180} fill="#c8102e" />
      <path d="M43 52 V80" stroke="#ff3b30" strokeWidth={3} markerEnd="url(#pointe-rouge)" />
      <Auto x={89} y={160} fill="#1f4fa3" label="TOI" />
      <Auto x={135} y={110} fill="#6b7f2a" />
    </>
  ),
  'accident-en-face': (
    <>
      <rect x={0} y={0} width={200} height={200} fill="#9bb07a" />
      {/* Chaussée d'en face (sens vers le bas) */}
      <rect x={4} y={0} width={80} height={200} fill={ROUTE} />
      {[0, 40, 80, 120, 160].map((y) => <rect key={y} x={43} y={y + 6} width={3} height={24} fill={MARQUAGE} />)}
      {/* Berme centrale et glissière */}
      <rect x={84} y={0} width={20} height={200} fill="#7f9663" />
      <rect x={93} y={0} width={3} height={200} fill="#c4c9cf" />
      {/* Ta chaussée */}
      <rect x={104} y={0} width={92} height={200} fill={ROUTE} />
      {[0, 40, 80, 120, 160].map((y) => <rect key={y} x={149} y={y + 6} width={3} height={24} fill={MARQUAGE} />)}
      <Auto x={30} y={70} rot={160} fill="#c8102e" />
      <Auto x={56} y={92} rot={-120} fill="#8a5cc2" />
      <Auto x={30} y={150} rot={180} fill="#6b7f2a" />
      <Detresse x={30} y={150} />
      <Auto x={172} y={160} fill="#1f4fa3" label="TOI" />
      <Fleche d="M172 140 V112" />
    </>
  ),
  remorquage: (
    <>
      <Autoroute />
      <Auto x={135} y={66} fill="#6b7f2a" />
      <rect x={134} y={81} width={2} height={14} fill="#1b1b1b" />
      <Auto x={135} y={110} fill="#1f4fa3" label="TOI" />
      <Auto x={89} y={170} fill="#c8102e" />
    </>
  ),
  'contresens-bretelle': (
    <>
      <rect x={0} y={0} width={200} height={200} fill="#9bb07a" />
      <path d="M70 200 Q80 100 160 0 L200 0 Q120 100 120 200 Z" fill={ROUTE} />
      {/* Flèches au sol : la bretelle se parcourt vers le bas */}
      {[[150, 40], [112, 100]].map(([x, y]) => (
        <path key={x} d={`M${x} ${y - 14} L${x - 6} ${y + 6} M${x - 12} ${y} L${x - 6} ${y + 8} L${x + 2} ${y + 2}`} stroke={MARQUAGE} strokeWidth={3} fill="none" />
      ))}
      <g transform="translate(28 120)">
        <circle cx={14} cy={14} r={13} fill="#c8102e" />
        <rect x={5} y={11} width={18} height={6} fill={BLANC} />
        <rect x={13} y={27} width={3} height={30} fill="#8a919c" />
      </g>
      <Auto x={96} y={160} rot={10} fill="#1f4fa3" label="TOI" />
    </>
  ),
  'autoroute-pluie': (
    <>
      <Autoroute />
      <Auto x={135} y={150} fill="#1f4fa3" label="TOI" />
      <Auto x={89} y={60} fill="#6b7f2a" />
      <g stroke="#9fc1e6" strokeWidth={1.5} opacity={0.7}>
        {Array.from({ length: 40 }, (_, i) => {
          const x = (i * 37) % 200
          const y = (i * 53) % 200
          return <line key={i} x1={x} y1={y} x2={x - 5} y2={y + 12} />
        })}
      </g>
    </>
  ),
  'bau-ouverte': (
    <>
      <Autoroute bauOuverte />
      <rect x={150} y={8} width={42} height={36} rx={3} fill="#0b0e13" stroke="#3a3f48" strokeWidth={2} />
      <path d="M171 14 V36 M162 27 L171 37 L180 27" stroke="#2ee07a" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Auto x={171} y={120} fill="#c8102e" />
      <Auto x={135} y={160} fill="#1f4fa3" label="TOI" />
    </>
  ),
  'etre-depasse': (
    <>
      <RouteCampagne />
      <Auto x={130} y={100} fill="#1f4fa3" label="TOI" />
      <Auto x={74} y={128} fill="#c8102e" />
      <ClignoGauche x={74} y={128} />
      <Fleche d="M74 108 V80" />
    </>
  ),
}

export function Schema({ schema, titre }: { schema: SchemaType; titre: string }) {
  if (schema.type === 'panneau') {
    const dessin = PANNEAUX[schema.code]
    if (!dessin) return null
    const h = HAUTEUR_PANNEAU[schema.code] ?? 100
    return (
      <svg viewBox={`0 0 100 ${h}`} width={160} height={(160 * h) / 100} role="img" aria-label={titre}>
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

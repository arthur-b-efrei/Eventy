import { PLACES, PLACE_LIBRE } from './places.js'

// Dans un SVG, on fait tourner et grandir les formes autour du centre de la table (50, 50)
const AUTOUR_DE_LA_TABLE = '[transform-box:view-box] origin-[50px_50px]'
// …ou autour de leur propre centre
const AUTOUR_DE_SOI = '[transform-box:fill-box] origin-center'

// Le logo de la landing page :
// 1. la table (cercle pointillé) apparaît, 2. les 5 places arrivent du centre en tournant,
// 3. la place libre se dessine en lampion et "respire", 4. les lettres d'eventy montent une par une.
// Au survol, la place libre se remplit : c'est toi qui t'assois.
// Les animations sont déclarées dans index.css (bloc @theme) ; les délais, calculés, restent en "style".
export default function LogoAnime() {
  return (
    <div className="group inline-flex cursor-default items-center gap-[clamp(12px,2.4vw,26px)] text-white" role="img" aria-label="Eventy">
      <svg className="h-auto w-[clamp(92px,17vw,172px)] shrink-0 overflow-visible" viewBox="0 0 100 100" aria-hidden="true">
        <circle
          className={`animate-table fill-none stroke-white/30 [stroke-dasharray:0.5_4.6] [stroke-linecap:round] [stroke-width:0.8] ${AUTOUR_DE_LA_TABLE}`}
          cx="50"
          cy="50"
          r="33"
        />

        <g className={`animate-groupe-tourne ${AUTOUR_DE_LA_TABLE}`}>
          {PLACES.map((p, i) => (
            <g key={i} className={`animate-respire ${AUTOUR_DE_SOI}`} style={{ animationDelay: `${2.4 + i * 0.22}s` }}>
              <circle
                className={`animate-place-arrive fill-current ${AUTOUR_DE_LA_TABLE}`}
                cx="50"
                cy="50"
                r="10"
                style={{
                  '--x': `${p.x - 50}px`,
                  '--y': `${p.y - 50}px`,
                  transform: 'translate(var(--x), var(--y))',
                  animationDelay: `${0.2 + i * 0.09}s`,
                }}
              />
            </g>
          ))}

          <circle
            className={`animate-halo fill-none stroke-lampion opacity-0 [stroke-width:1.4] motion-reduce:hidden ${AUTOUR_DE_SOI}`}
            cx={PLACE_LIBRE.x}
            cy={PLACE_LIBRE.y}
            r="8.25"
          />
          <circle
            className={`animate-libre-dessin fill-transparent stroke-lampion transition-[fill,scale] duration-300 [stroke-dasharray:52] [stroke-dashoffset:52] [stroke-width:3.5] group-hover:scale-112 group-hover:fill-lampion motion-reduce:[stroke-dashoffset:0] ${AUTOUR_DE_SOI}`}
            cx={PLACE_LIBRE.x}
            cy={PLACE_LIBRE.y}
            r="8.25"
          />
        </g>
      </svg>

      <span className="inline-flex pb-[0.08em] font-titre text-[clamp(64px,14vw,156px)] leading-[0.9] font-[750] tracking-[-0.05em]" aria-hidden="true">
        {'eventy'.split('').map((lettre, i) => (
          <span key={i} className="inline-block animate-lettre" style={{ animationDelay: `${1.05 + i * 0.065}s` }}>
            {lettre}
          </span>
        ))}
      </span>
    </div>
  )
}

import { PLACES, PLACE_LIBRE } from './places.js'

// Le symbole seul : 5 places prises + 1 place libre
export function Symbole({ couleur = 'currentColor', couleurLibre = '#FFB21E', ...props }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" {...props}>
      <g fill={couleur}>
        {PLACES.map((p) => (
          <circle key={`${p.x}-${p.y}`} cx={p.x} cy={p.y} r="10" />
        ))}
      </g>
      <circle
        cx={PLACE_LIBRE.x}
        cy={PLACE_LIBRE.y}
        r="8.25"
        fill="none"
        stroke={couleurLibre}
        strokeWidth="3.5"
      />
    </svg>
  )
}

// Le logo complet : symbole + « eventy ».
// Sa taille se règle avec une classe de texte (ex : text-[26px]) : le symbole suit.
export default function Logo({ couleur, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-[0.32em] font-titre leading-none font-[750] tracking-[-0.045em] ${className}`}
      aria-label="Eventy"
    >
      <Symbole couleur={couleur} className="size-[1.02em] shrink-0" />
      <span aria-hidden="true">eventy</span>
    </span>
  )
}

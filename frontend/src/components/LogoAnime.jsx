import { PLACES, PLACE_LIBRE } from './places.js'
import './LogoAnime.css'

// Le logo de la landing page :
// 1. la table (cercle pointillé) apparaît, 2. les 5 places arrivent du centre en tournant,
// 3. la place libre se dessine en lampion et "respire", 4. les lettres d'eventy montent une par une.
// Au survol, la place libre se remplit : c'est toi qui t'assois.
export default function LogoAnime() {
  return (
    <div className="logo-anime" role="img" aria-label="Eventy">
      <svg className="la-symbole" viewBox="0 0 100 100" aria-hidden="true">
        <circle className="la-table" cx="50" cy="50" r="33" />

        <g className="la-tourne">
          {PLACES.map((p, i) => (
            <g key={i} className="la-respire" style={{ '--i': i }}>
              <circle
                className="la-place"
                cx="50"
                cy="50"
                r="10"
                style={{ '--x': `${p.x - 50}px`, '--y': `${p.y - 50}px`, '--i': i }}
              />
            </g>
          ))}

          <circle className="la-halo" cx={PLACE_LIBRE.x} cy={PLACE_LIBRE.y} r="8.25" />
          <circle className="la-libre" cx={PLACE_LIBRE.x} cy={PLACE_LIBRE.y} r="8.25" />
        </g>
      </svg>

      <span className="la-mot" aria-hidden="true">
        {'eventy'.split('').map((lettre, i) => (
          <span key={i} style={{ '--i': i }}>
            {lettre}
          </span>
        ))}
      </span>
    </div>
  )
}

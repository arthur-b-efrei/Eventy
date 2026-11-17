import { Link } from 'react-router-dom'

const BASE =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 font-bold no-underline transition duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-lampion disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50'

const TAILLES = {
  normal: 'min-h-12 px-[26px] text-base',
  petit: 'min-h-9 px-4 text-sm',
}

// Chaque variante donne sa propre couleur de bordure.
// (Deux classes Tailwind qui règlent la même chose se battent : on n'en met qu'une.)
const VARIANTES = {
  lampion:
    'border-transparent bg-lampion text-ardoise shadow-[0_10px_24px_rgba(255,178,30,0.35)] hover:shadow-[0_14px_30px_rgba(255,178,30,0.45)]',
  outremer: 'border-transparent bg-outremer text-white hover:bg-outremer-fonce',
  contour: 'border-white/70 bg-transparent text-white hover:border-white hover:bg-white hover:text-outremer',
  discret: 'border-bordure bg-white text-ardoise hover:border-gris',
  // Pour les actions définitives (ex : supprimer son compte) : grenadine foncée, lisible en blanc
  danger: 'border-transparent bg-[#d63a5a] text-white hover:bg-[#bf2e4c]',
  // Le même, en plus discret (le bouton qui ouvre la confirmation)
  'danger-contour': 'border-[#f3c2cc] bg-white text-[#bf2e4c] hover:border-[#d63a5a] hover:bg-[#fff5f7]',
}

// Le bouton de la marque. variante : lampion, outremer, contour, discret, danger ou danger-contour.
// taille : normal ou petit. Avec "to", il devient un lien vers une autre page de l'appli.
export default function Bouton({ variante = 'outremer', taille = 'normal', to, className = '', type = 'button', ...props }) {
  const classes = `${BASE} ${TAILLES[taille]} ${VARIANTES[variante]} ${className}`

  if (to) {
    return <Link to={to} className={classes} {...props} />
  }
  return <button type={type} className={classes} {...props} />
}

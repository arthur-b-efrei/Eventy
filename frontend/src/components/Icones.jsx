// Petites icônes au trait, dans le style Eventy (trait de 1.75, bouts arrondis).
// Elles prennent la couleur du texte autour (currentColor) et la taille via className.
function Icone({ children, className = 'size-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

export const IconeAppareilPhoto = (p) => (
  <Icone {...p}>
    <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.3l1.4-2h5.6l1.4 2h1.3A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z" />
    <circle cx="12" cy="12.5" r="3.5" />
  </Icone>
)

export const IconeCrayon = (p) => (
  <Icone {...p}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />
    <path d="m13.5 6.5 4 4" />
  </Icone>
)

export const IconeCadenas = (p) => (
  <Icone {...p}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </Icone>
)

export const IconeSortie = (p) => (
  <Icone {...p}>
    <path d="M14 4h3.5A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5H14" />
    <path d="M10 8l-4 4 4 4M6 12h10" />
  </Icone>
)

export const IconePoubelle = (p) => (
  <Icone {...p}>
    <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.8 11.5A2 2 0 0 0 9.3 20.5h5.4a2 2 0 0 0 2-2L17.5 7" />
  </Icone>
)

export const IconeUtilisateur = (p) => (
  <Icone {...p}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
  </Icone>
)

export const IconeBouclier = (p) => (
  <Icone {...p}>
    <path d="M12 3.5 5 6v5.5c0 4.3 3 7.6 7 9 4-1.4 7-4.7 7-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </Icone>
)

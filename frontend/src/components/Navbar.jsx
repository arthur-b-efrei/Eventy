import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import Avatar from './Avatar.jsx'
import { useAuth } from '../context/AuthContext.js'

const LIENS = [
  { to: '/accueil', label: 'Accueil' },
  { to: '/mes-reservations', label: 'Mes réservations' },
  { to: '/creer-evenement', label: 'Créer un événement' },
  { to: '/profil', label: 'Profil' },
]

function classeLien({ isActive }) {
  return [
    'rounded-full px-3.5 py-2 text-sm font-bold no-underline transition',
    isActive
      ? 'bg-outremer/10 text-outremer'
      : 'text-texte-doux hover:bg-white/70 hover:text-ardoise',
  ].join(' ')
}

export default function Navbar() {
  const { user } = useAuth()
  const [ouvert, setOuvert] = useState(false)

  function fermer() {
    setOuvert(false)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-bordure/80 bg-nappe/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between gap-3 px-4 sm:px-5">
        <Link to="/accueil" className="shrink-0 text-ardoise no-underline" onClick={fermer}>
          <Logo couleur="#3A3DFF" className="text-[22px] sm:text-[24px]" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          {LIENS.map((lien) => (
            <NavLink key={lien.to} to={lien.to} className={classeLien}>
              {lien.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/profil"
            className="hidden items-center gap-2 rounded-full py-1 pr-1 pl-1 no-underline sm:flex"
            aria-label="Profil"
          >
            <Avatar user={user} taille={36} />
          </Link>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full border border-bordure bg-white font-bold text-ardoise md:hidden"
            aria-expanded={ouvert}
            aria-controls="menu-mobile"
            aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setOuvert((v) => !v)}
          >
            <span aria-hidden="true">{ouvert ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {ouvert ? (
        <nav
          id="menu-mobile"
          className="border-t border-bordure bg-nappe px-4 py-3 md:hidden"
          aria-label="Navigation mobile"
        >
          <ul className="grid gap-1">
            {LIENS.map((lien) => (
              <li key={lien.to}>
                <NavLink to={lien.to} className={classeLien} onClick={fermer}>
                  {lien.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  )
}

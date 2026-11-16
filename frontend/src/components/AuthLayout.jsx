import { Link } from 'react-router-dom'
import Logo, { Symbole } from './Logo.jsx'
import './AuthLayout.css'

// Mise en page commune aux pages Connexion et Inscription :
// panneau Outremer à gauche (caché sur mobile), formulaire à droite.
export default function AuthLayout({ titre, sousTitre, accroche, children }) {
  return (
    <div className="auth">
      <aside className="auth-panneau">
        <Link to="/" className="auth-retour">
          <Logo couleur="#FFFFFF" style={{ fontSize: 28 }} />
        </Link>
        <Symbole className="auth-grand-symbole" couleur="rgba(255,255,255,0.12)" />
        <p className="auth-accroche">{accroche}</p>
        <span className="mono auth-ticket">Jeu. 20:30 · Quiz au bar · 3 places</span>
      </aside>

      <main className="auth-contenu">
        <Link to="/" className="auth-logo-mobile">
          <Logo couleur="#3A3DFF" style={{ fontSize: 26 }} />
        </Link>
        <div className="auth-carte">
          <h1>{titre}</h1>
          <p className="auth-sous-titre">{sousTitre}</p>
          {children}
        </div>
      </main>
    </div>
  )
}

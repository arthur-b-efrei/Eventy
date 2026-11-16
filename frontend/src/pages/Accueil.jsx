import Logo from '../components/Logo.jsx'
import { useAuth } from '../context/AuthContext.js'

// Page provisoire après connexion : la liste des events viendra ici.
export default function Accueil() {
  const { user, logout } = useAuth()

  // Une fois déconnecté, la route protégée renvoie automatiquement vers la landing page
  function seDeconnecter() {
    logout()
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <Logo couleur="#3A3DFF" style={{ fontSize: 26 }} />
        <button type="button" className="btn btn-discret" onClick={seDeconnecter}>
          Se déconnecter
        </button>
      </header>
      <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', marginTop: 56 }}>Salut {user?.name}, on sort ce soir ?</h1>
      <p style={{ color: 'var(--texte-doux)', marginTop: 12 }}>La liste des plans arrive bientôt ici.</p>
    </div>
  )
}

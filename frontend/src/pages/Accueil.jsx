import Logo from '../components/Logo.jsx'
import Avatar from '../components/Avatar.jsx'
import Bouton from '../components/Bouton.jsx'
import { useAuth } from '../context/AuthContext.js'

// Page provisoire après connexion : la liste des events viendra ici.
export default function Accueil() {
  const { user, logout } = useAuth()

  // Une fois déconnecté, la route protégée renvoie automatiquement vers la landing page
  function seDeconnecter() {
    logout()
  }

  return (
    <div className="mx-auto max-w-[960px] px-5 py-6">
      <header className="flex items-center justify-between gap-4">
        <Logo couleur="#3A3DFF" className="text-[26px]" />
        <div className="flex items-center gap-3">
          <Avatar user={user} taille={42} />
          <Bouton variante="discret" onClick={seDeconnecter}>
            Se déconnecter
          </Bouton>
        </div>
      </header>
      <h1 className="mt-14 text-[clamp(32px,5vw,52px)]">Salut {user?.name}, on sort ce soir ?</h1>
      <p className="mt-3 text-texte-doux">La liste des plans arrive bientôt ici.</p>
    </div>
  )
}

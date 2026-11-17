import AppLayout from '../components/AppLayout.jsx'
import { useAuth } from '../context/AuthContext.js'

// Page provisoire après connexion : la liste des events viendra ici.
export default function Accueil() {
  const { user } = useAuth()

  return (
    <AppLayout>
      <h1 className="text-[clamp(32px,5vw,52px)]">Salut {user?.name}, on sort ce soir ?</h1>
      <p className="mt-3 text-texte-doux">La liste des plans arrive bientôt ici.</p>
    </AppLayout>
  )
}

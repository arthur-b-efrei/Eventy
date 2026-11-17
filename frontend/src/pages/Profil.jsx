import AppLayout from '../components/AppLayout.jsx'
import Avatar from '../components/Avatar.jsx'
import Bouton from '../components/Bouton.jsx'
import { useAuth } from '../context/AuthContext.js'

export default function Profil() {
  const { user, logout } = useAuth()

  return (
    <AppLayout>
      <h1 className="text-[clamp(28px,4.5vw,44px)]">Profil</h1>
      <p className="mt-3 text-texte-doux">Tes infos de compte.</p>

      <section className="mt-8 flex items-center gap-4 rounded-2xl border border-bordure bg-white p-5">
        <Avatar user={user} taille={64} />
        <div>
          <p className="font-titre text-xl font-bold tracking-[-0.03em]">{user?.name}</p>
          <p className="text-texte-doux">{user?.email}</p>
        </div>
      </section>

      <div className="mt-6">
        <Bouton variante="discret" onClick={logout}>
          Se déconnecter
        </Bouton>
      </div>
    </AppLayout>
  )
}

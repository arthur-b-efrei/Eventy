import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import Avatar from '../components/Avatar.jsx'
import Bouton from '../components/Bouton.jsx'
import { ERREUR } from '../components/ui.js'
import { envoyerPhoto } from '../api/users.js'
import { preparerPhoto } from '../utils/image.js'
import { useAuth } from '../context/AuthContext.js'

// Page affichée juste après la vérification du code :
// on propose d'ajouter une photo, ou de passer (l'emoji tiré à l'inscription reste alors l'avatar).
export default function Bienvenue() {
  const { user, token, majUser } = useAuth()
  const navigate = useNavigate()
  const champFichier = useRef(null)

  const [apercu, setApercu] = useState(null)
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)
  const [survol, setSurvol] = useState(false)

  async function choisir(fichier) {
    if (!fichier) return
    setErreur('')
    try {
      setApercu(await preparerPhoto(fichier))
    } catch (err) {
      setErreur(err.message)
    }
  }

  async function enregistrer() {
    setErreur('')
    setChargement(true)
    try {
      const userMisAJour = await envoyerPhoto(token, apercu)
      majUser(userMisAJour)
      navigate('/accueil')
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  return (
    <AuthLayout
      titre={`Bienvenue ${user?.name} !`}
      sousTitre="Ajoute une photo pour que les autres te reconnaissent en arrivant à la table."
      accroche="Une tête connue, c'est déjà un peu un ami."
    >
      <div className="grid gap-3.5">
        {erreur && (
          <p className={ERREUR} role="alert">
            {erreur}
          </p>
        )}

        <button
          type="button"
          className={`relative grid cursor-pointer justify-items-center gap-3.5 rounded-3xl border-2 border-dashed px-4 pt-7 pb-[22px] text-texte-doux transition hover:border-outremer hover:bg-[#f3f4ff] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-lampion ${survol ? 'border-outremer bg-[#f3f4ff]' : 'border-bordure bg-white'}`}
          onClick={() => champFichier.current.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setSurvol(true)
          }}
          onDragLeave={() => setSurvol(false)}
          onDrop={(e) => {
            e.preventDefault()
            setSurvol(false)
            choisir(e.dataTransfer.files[0])
          }}
          aria-label="Choisir une photo de profil"
        >
          {/* Anneau "place libre" en lampion autour de l'avatar */}
          <Avatar
            user={user}
            apercu={apercu}
            taille={148}
            className="animate-avatar-arrive shadow-[0_0_0_5px_#fff,0_0_0_8px_var(--color-lampion)]"
          />
          <span
            className="absolute top-[132px] left-[calc(50%+42px)] grid size-9 place-items-center rounded-full bg-outremer text-xl font-extrabold text-white shadow-[0_0_0_4px_#fff]"
            aria-hidden="true"
          >
            {apercu ? '✓' : '+'}
          </span>
          <span className="text-sm font-semibold">{apercu ? 'Cliquer pour changer' : 'Clique ou glisse une photo ici'}</span>
        </button>

        <input
          ref={champFichier}
          id="photo"
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            choisir(e.target.files[0])
            e.target.value = ''
          }}
        />

        {apercu ? (
          <Bouton variante="outremer" className="w-full" onClick={enregistrer} disabled={chargement}>
            {chargement ? 'Envoi…' : 'Enregistrer ma photo'}
          </Bouton>
        ) : (
          <Bouton variante="outremer" className="w-full" onClick={() => champFichier.current.click()}>
            Choisir une photo
          </Bouton>
        )}

        <Bouton variante="discret" className="w-full" onClick={() => navigate('/accueil')} disabled={chargement}>
          Passer pour l'instant
        </Bouton>

        <p className="flex flex-wrap items-center justify-center gap-1.5 text-center text-sm text-texte-doux">
          Si tu passes, tu gardes cet avatar : <Avatar user={user} taille={24} /> Tu pourras ajouter une photo plus tard dans ton profil.
        </p>
      </div>
    </AuthLayout>
  )
}

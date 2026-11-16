import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import Avatar from '../components/Avatar.jsx'
import { envoyerPhoto } from '../api/users.js'
import { preparerPhoto } from '../utils/image.js'
import { useAuth } from '../context/AuthContext.js'
import './Bienvenue.css'

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
      <div className="bienvenue">
        {erreur && (
          <p className="erreur" role="alert">
            {erreur}
          </p>
        )}

        <button
          type="button"
          className={`bienvenue-zone ${survol ? 'survol' : ''}`}
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
          <Avatar user={user} apercu={apercu} taille={148} className="bienvenue-avatar" />
          <span className="bienvenue-badge" aria-hidden="true">
            {apercu ? '✓' : '+'}
          </span>
          <span className="bienvenue-consigne">{apercu ? 'Cliquer pour changer' : 'Clique ou glisse une photo ici'}</span>
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
          <button type="button" className="btn btn-outremer" onClick={enregistrer} disabled={chargement}>
            {chargement ? 'Envoi…' : 'Enregistrer ma photo'}
          </button>
        ) : (
          <button type="button" className="btn btn-outremer" onClick={() => champFichier.current.click()}>
            Choisir une photo
          </button>
        )}

        <button type="button" className="btn btn-discret" onClick={() => navigate('/accueil')} disabled={chargement}>
          Passer pour l'instant
        </button>

        <p className="bienvenue-note">
          Si tu passes, tu gardes cet avatar : <Avatar user={user} taille={24} /> Tu pourras ajouter une photo plus tard dans ton profil.
        </p>
      </div>
    </AuthLayout>
  )
}

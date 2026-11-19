import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import ChampMotDePasse from '../components/ChampMotDePasse.jsx'
import Bouton from '../components/Bouton.jsx'
import { CHAMP, ERREUR, FORMULAIRE, INFO, INPUT, LABEL, TEXTE_BAS } from '../components/ui.js'
import { connecter } from '../api/auth.js'
import { useAuth } from '../context/AuthContext.js'

export default function Connexion() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)
  const { login, expiree } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Message venu d'une autre page (ex : "mot de passe changé") ou session expirée
  const info = location.state?.info || (expiree ? 'Ta session a expiré, reconnecte-toi.' : '')

  async function envoyer(e) {
    e.preventDefault()
    setErreur('')
    setChargement(true)
    try {
      const session = await connecter({ email, password })
      login(session)
      navigate('/accueil')
    } catch (err) {
      // Bon mot de passe mais email pas encore vérifié : un code vient d'être envoyé
      if (err.donnees?.code === 'EMAIL_NON_VERIFIE') {
        navigate('/verification', { state: { email: err.donnees.email } })
        return
      }
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  return (
    <AuthLayout
      titre="Content de te revoir"
      sousTitre="Connecte-toi pour retrouver tes plans et tes réservations."
      accroche="Ta table t'attend toujours."
    >
      <form className={FORMULAIRE} onSubmit={envoyer}>
        {erreur && (
          <p className={ERREUR} role="alert">
            {erreur}
          </p>
        )}
        {!erreur && info && (
          <p className={INFO} role="status">
            {info}
          </p>
        )}

        <div className={CHAMP}>
          <label htmlFor="email" className={LABEL}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="ines@mail.fr"
            required
            className={INPUT}
          />
        </div>

        <ChampMotDePasse
          id="password"
          label="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          minLength={0}
        />
        <Link to="/mot-de-passe-oublie" state={{ email }} className="-mt-2 justify-self-end text-sm font-bold">
          Mot de passe oublié ?
        </Link>

        <Bouton type="submit" variante="outremer" className="mt-1.5 w-full" disabled={chargement}>
          {chargement ? 'Connexion…' : 'Se connecter'}
        </Bouton>
      </form>

      <p className={TEXTE_BAS}>
        Pas encore de compte ? <Link to="/inscription">Crée-le en 1 minute</Link>
      </p>
    </AuthLayout>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import ChampMotDePasse from '../components/ChampMotDePasse.jsx'
import { connecter } from '../api/auth.js'
import { useAuth } from '../context/AuthContext.js'

export default function Connexion() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function envoyer(e) {
    e.preventDefault()
    setErreur('')
    setChargement(true)
    try {
      const session = await connecter({ email, password })
      login(session)
      navigate('/accueil')
    } catch (err) {
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
      <form className="form" onSubmit={envoyer}>
        {erreur && (
          <p className="erreur" role="alert">
            {erreur}
          </p>
        )}

        <div className="champ">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="ines@mail.fr"
            required
          />
        </div>

        <ChampMotDePasse
          id="password"
          label="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button type="submit" className="btn btn-outremer" disabled={chargement}>
          {chargement ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <p className="auth-bas">
        Pas encore de compte ? <Link to="/inscription">Crée-le en 1 minute</Link>
      </p>
    </AuthLayout>
  )
}

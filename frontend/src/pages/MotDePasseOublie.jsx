import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import ChampCode from '../components/ChampCode.jsx'
import ChampMotDePasse from '../components/ChampMotDePasse.jsx'
import Bouton from '../components/Bouton.jsx'
import { CHAMP, ERREUR, FORMULAIRE, INFO, INPUT, LABEL, LIEN_BOUTON, TEXTE_BAS } from '../components/ui.js'
import { changerMotDePasse, demanderNouveauMotDePasse } from '../api/auth.js'
import { useAuth } from '../context/AuthContext.js'

const DELAI_RENVOI = 60 // secondes avant de pouvoir redemander un code

// Deux étapes : 1. on donne son email, 2. on tape le code reçu et on choisit un nouveau mot de passe
export default function MotDePasseOublie() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()

  const [etape, setEtape] = useState('email')
  const [email, setEmail] = useState(location.state?.email || '')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState('')
  const [info, setInfo] = useState('')
  const [chargement, setChargement] = useState(false)
  const [attente, setAttente] = useState(0)

  // Compte à rebours avant de pouvoir renvoyer un code
  useEffect(() => {
    if (attente <= 0) return
    const minuteur = setTimeout(() => setAttente(attente - 1), 1000)
    return () => clearTimeout(minuteur)
  }, [attente])

  async function envoyerCode(e) {
    e?.preventDefault()
    setErreur('')
    setInfo('')
    setChargement(true)
    try {
      await demanderNouveauMotDePasse({ email })
      setEtape('code')
      setAttente(DELAI_RENVOI)
      if (e === undefined) setInfo('Nouveau code envoyé. Pense à regarder dans tes spams.')
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  async function valider(e) {
    e.preventDefault()
    setErreur('')
    setInfo('')
    if (code.length !== 6) {
      setErreur('Tape les 6 chiffres du code.')
      return
    }
    if (password.length < 8) {
      setErreur('Le mot de passe doit faire au moins 8 caractères.')
      return
    }

    setChargement(true)
    try {
      const session = await changerMotDePasse({ email, code, password })
      login(session)
      navigate('/accueil')
    } catch (err) {
      setErreur(err.message)
      setCode('')
    } finally {
      setChargement(false)
    }
  }

  const messages = (
    <>
      {erreur && (
        <p className={ERREUR} role="alert">
          {erreur}
        </p>
      )}
      {info && (
        <p className={INFO} role="status">
          {info}
        </p>
      )}
    </>
  )

  if (etape === 'email') {
    return (
      <AuthLayout
        titre="Mot de passe oublié"
        sousTitre="Donne ton email : on t'envoie un code pour choisir un nouveau mot de passe."
        accroche="Ça arrive aux meilleurs."
      >
        <form className={FORMULAIRE} onSubmit={envoyerCode}>
          {messages}
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
              autoFocus
              className={INPUT}
            />
          </div>
          <Bouton type="submit" variante="outremer" className="mt-1.5 w-full" disabled={chargement}>
            {chargement ? 'Envoi…' : 'Recevoir un code'}
          </Bouton>
        </form>
        <p className={TEXTE_BAS}>
          Ça te revient ? <Link to="/connexion">Retour à la connexion</Link>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      titre="Nouveau mot de passe"
      sousTitre={
        <>
          Si un compte existe pour <strong>{email}</strong>, un code à 6 chiffres vient d'y être envoyé. Il est valable 10 minutes.
        </>
      }
      accroche="Ça arrive aux meilleurs."
    >
      <form className={FORMULAIRE} onSubmit={valider}>
        {messages}
        <div className={CHAMP}>
          <span className={LABEL}>Code reçu par email</span>
          <ChampCode valeur={code} onChange={setCode} desactive={chargement} />
        </div>
        <ChampMotDePasse
          id="password"
          label="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          aide="8 caractères minimum."
        />
        <Bouton type="submit" variante="outremer" className="mt-1.5 w-full" disabled={chargement}>
          {chargement ? 'Enregistrement…' : 'Changer mon mot de passe'}
        </Bouton>
      </form>

      <p className={TEXTE_BAS}>
        Pas reçu ?{' '}
        {attente > 0 ? (
          <span>Nouveau code possible dans {attente} s</span>
        ) : (
          <button type="button" className={LIEN_BOUTON} onClick={() => envoyerCode()}>
            Renvoyer un code
          </button>
        )}
      </p>
      <p className={`${TEXTE_BAS} mt-2!`}>
        <button type="button" className={LIEN_BOUTON} onClick={() => setEtape('email')}>
          Changer d'adresse email
        </button>
      </p>
    </AuthLayout>
  )
}

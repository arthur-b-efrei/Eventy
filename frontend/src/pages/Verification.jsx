import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import ChampCode from '../components/ChampCode.jsx'
import Bouton from '../components/Bouton.jsx'
import { ERREUR, FORMULAIRE, INFO, LIEN_BOUTON, TEXTE_BAS } from '../components/ui.js'
import { renvoyerCode, verifierEmail } from '../api/auth.js'
import { useAuth } from '../context/AuthContext.js'

const DELAI_RENVOI = 60 // secondes avant de pouvoir redemander un code

export default function Verification() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()

  // L'email arrive de la page Inscription ou Connexion
  const email = location.state?.email || ''

  const [code, setCode] = useState('')
  const [erreur, setErreur] = useState('')
  const [info, setInfo] = useState('')
  const [chargement, setChargement] = useState(false)
  const [attente, setAttente] = useState(DELAI_RENVOI)

  // Compte à rebours avant de pouvoir renvoyer un code
  useEffect(() => {
    if (attente <= 0) return
    const minuteur = setTimeout(() => setAttente(attente - 1), 1000)
    return () => clearTimeout(minuteur)
  }, [attente])

  async function verifier(codeAVerifier) {
    if (chargement) return
    setErreur('')
    setInfo('')
    setChargement(true)
    try {
      const session = await verifierEmail({ email, code: codeAVerifier })
      login(session)
      // Compte tout neuf : on propose d'ajouter une photo de profil
      navigate('/bienvenue')
    } catch (err) {
      setErreur(err.message)
      setCode('')
    } finally {
      setChargement(false)
    }
  }

  // Dès que les 6 chiffres sont là, on vérifie sans attendre le clic
  function changerCode(nouveau) {
    setCode(nouveau)
    setErreur('')
    if (nouveau.length === 6) verifier(nouveau)
  }

  async function renvoyer() {
    setErreur('')
    setInfo('')
    try {
      await renvoyerCode({ email })
      setInfo('Nouveau code envoyé. Pense à regarder dans tes spams.')
      setAttente(DELAI_RENVOI)
    } catch (err) {
      setErreur(err.message)
    }
  }

  // Arrivée directe sur /verification sans passer par l'inscription
  if (!email) {
    return (
      <AuthLayout titre="Vérifie ton email" sousTitre="On ne sait pas encore quelle adresse vérifier." accroche="Il reste une place. C'est la tienne.">
        <p className={`${TEXTE_BAS} text-left!`}>
          Commence par <Link to="/inscription">créer ton compte</Link> ou <Link to="/connexion">te connecter</Link> : on t'enverra le code à ce moment-là.
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      titre="Vérifie ton email"
      sousTitre={
        <>
          On a envoyé un code à 6 chiffres à <strong>{email}</strong>. Il est valable 10 minutes.
        </>
      }
      accroche="Plus qu'un code et ta place est réservée."
    >
      <form
        className={FORMULAIRE}
        onSubmit={(e) => {
          e.preventDefault()
          if (code.length === 6) verifier(code)
          else setErreur('Tape les 6 chiffres du code.')
        }}
      >
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

        <ChampCode valeur={code} onChange={changerCode} desactive={chargement} />

        <Bouton type="submit" variante="outremer" className="mt-1.5 w-full" disabled={chargement}>
          {chargement ? 'Vérification…' : 'Valider le code'}
        </Bouton>
      </form>

      <p className={TEXTE_BAS}>
        Pas reçu ?{' '}
        {attente > 0 ? (
          <span>Nouveau code possible dans {attente} s</span>
        ) : (
          <button type="button" className={LIEN_BOUTON} onClick={renvoyer}>
            Renvoyer un code
          </button>
        )}
      </p>
      <p className={`${TEXTE_BAS} mt-2!`}>
        Mauvaise adresse ? <Link to="/inscription">Recommencer l'inscription</Link>
      </p>
    </AuthLayout>
  )
}

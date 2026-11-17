import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import ChampMotDePasse from '../components/ChampMotDePasse.jsx'
import Bouton from '../components/Bouton.jsx'
import { CHAMP, ERREUR, FORMULAIRE, INPUT, LABEL, TEXTE_BAS } from '../components/ui.js'
import { inscrire } from '../api/auth.js'

const AGE_MINIMUM = 18

// Date au format AAAA-MM-JJ, "il y a X ans" jour pour jour
function ilYA(annees) {
  const d = new Date()
  d.setFullYear(d.getFullYear() - annees)
  const mois = String(d.getMonth() + 1).padStart(2, '0')
  const jour = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mois}-${jour}`
}

// Plus jeune date de naissance acceptée : il faut avoir 18 ans aujourd'hui
const DATE_MAX = ilYA(AGE_MINIMUM)
const DATE_MIN = ilYA(120)

export default function Inscription() {
  const [form, setForm] = useState({ name: '', email: '', date_naissance: '', password: '' })
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)
  const navigate = useNavigate()

  // Un seul handler pour tous les champs : on se sert de l'attribut name
  function changer(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function envoyer(e) {
    e.preventDefault()
    setErreur('')

    if (form.password.length < 6) {
      setErreur('Le mot de passe doit faire au moins 6 caractères.')
      return
    }
    // Les dates "AAAA-MM-JJ" se comparent directement comme du texte
    if (form.date_naissance > DATE_MAX) {
      setErreur(`Eventy est réservé aux personnes majeures (${AGE_MINIMUM} ans et plus).`)
      return
    }
    if (form.date_naissance < DATE_MIN) {
      setErreur('Vérifie ta date de naissance.')
      return
    }

    setChargement(true)
    try {
      // Le compte est créé et un code part par email : on passe à la page de vérification
      const { email } = await inscrire(form)
      navigate('/verification', { state: { email } })
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  return (
    <AuthLayout
      titre="Rejoins la table"
      sousTitre="Crée ton compte pour réserver ta place aux plans près de chez toi."
      accroche="Il reste une place. C'est la tienne."
    >
      <form className={FORMULAIRE} onSubmit={envoyer}>
        {erreur && (
          <p className={ERREUR} role="alert">
            {erreur}
          </p>
        )}

        <div className={CHAMP}>
          <label htmlFor="name" className={LABEL}>
            Prénom ou pseudo
          </label>
          <input id="name" name="name" value={form.name} onChange={changer} autoComplete="given-name" placeholder="Inès" required className={INPUT} />
        </div>

        <div className={CHAMP}>
          <label htmlFor="email" className={LABEL}>
            Email
          </label>
          <input id="email" name="email" type="email" value={form.email} onChange={changer} autoComplete="email" placeholder="ines@mail.fr" required className={INPUT} />
        </div>

        <div className={CHAMP}>
          <label htmlFor="date_naissance" className={LABEL}>
            Date de naissance
          </label>
          <input
            id="date_naissance"
            name="date_naissance"
            type="date"
            value={form.date_naissance}
            onChange={changer}
            min={DATE_MIN}
            max={DATE_MAX}
            autoComplete="bday"
            required
            className={INPUT}
          />
        </div>

        <ChampMotDePasse
          id="password"
          label="Mot de passe"
          value={form.password}
          onChange={changer}
          autoComplete="new-password"
          aide="6 caractères minimum."
        />

        <Bouton type="submit" variante="lampion" className="mt-1.5 w-full" disabled={chargement}>
          {chargement ? 'Création du compte…' : 'Créer mon compte'}
        </Bouton>
      </form>

      <p className={TEXTE_BAS}>
        Déjà un compte ? <Link to="/connexion">Connecte-toi</Link>
      </p>
    </AuthLayout>
  )
}

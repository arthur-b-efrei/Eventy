import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import ChampMotDePasse from '../components/ChampMotDePasse.jsx'
import { inscrire } from '../api/auth.js'

// Date du jour au format AAAA-MM-JJ, pour empêcher une date de naissance dans le futur
const AUJOURDHUI = new Date().toISOString().slice(0, 10)

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
      <form className="form" onSubmit={envoyer}>
        {erreur && (
          <p className="erreur" role="alert">
            {erreur}
          </p>
        )}

        <div className="champ">
          <label htmlFor="name">Prénom ou pseudo</label>
          <input id="name" name="name" value={form.name} onChange={changer} autoComplete="given-name" placeholder="Inès" required />
        </div>

        <div className="champ">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={changer} autoComplete="email" placeholder="ines@mail.fr" required />
        </div>

        <div className="champ">
          <label htmlFor="date_naissance">Date de naissance</label>
          <input
            id="date_naissance"
            name="date_naissance"
            type="date"
            value={form.date_naissance}
            onChange={changer}
            max={AUJOURDHUI}
            autoComplete="bday"
            required
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

        <button type="submit" className="btn btn-lampion" disabled={chargement}>
          {chargement ? 'Création du compte…' : 'Créer mon compte'}
        </button>
      </form>

      <p className="auth-bas">
        Déjà un compte ? <Link to="/connexion">Connecte-toi</Link>
      </p>
    </AuthLayout>
  )
}

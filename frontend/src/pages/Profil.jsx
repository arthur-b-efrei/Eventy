import { useRef, useState } from 'react'
import AppLayout from '../components/AppLayout.jsx'
import Avatar from '../components/Avatar.jsx'
import Bouton from '../components/Bouton.jsx'
import ChampMotDePasse from '../components/ChampMotDePasse.jsx'
import { AIDE, CHAMP, ERREUR, FORMULAIRE, INFO, INPUT, LABEL } from '../components/ui.js'
import { changerMotDePasseConnecte, envoyerPhoto, modifierInfos, supprimerCompte, supprimerPhoto } from '../api/users.js'
import { preparerPhoto } from '../utils/image.js'
import { DATE_NAISSANCE_MAX, DATE_NAISSANCE_MIN, erreurDateNaissance } from '../utils/dates.js'
import { useAuth } from '../context/AuthContext.js'

// Un bloc blanc avec un titre, pour chaque partie du profil
function Carte({ titre, description, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-bordure bg-white p-5 sm:p-6 ${className}`}>
      <h2 className="text-xl font-bold">{titre}</h2>
      {description && <p className="mt-1 text-sm text-texte-doux">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

// Petit outil pour gérer "chargement / erreur / message de réussite" dans chaque bloc
function useEnvoi() {
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')
  const [info, setInfo] = useState('')

  async function lancer(action, messageReussite) {
    setErreur('')
    setInfo('')
    setChargement(true)
    try {
      await action()
      if (messageReussite) setInfo(messageReussite)
    } catch (err) {
      setErreur(err.message)
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

  return { chargement, setErreur, lancer, messages }
}

// ----- Photo de profil -----
function BlocPhoto() {
  const { user, token, majUser } = useAuth()
  const champFichier = useRef(null)
  const { chargement, lancer, messages } = useEnvoi()
  const aUnePhoto = Boolean(user?.avatar?.photo_version)

  function choisir(fichier) {
    if (!fichier) return
    lancer(async () => {
      const image = await preparerPhoto(fichier)
      majUser(await envoyerPhoto(token, image))
    }, 'Photo mise à jour.')
  }

  return (
    <Carte titre="Photo de profil" description="Elle s'affiche à côté de ton nom quand tu rejoins un plan.">
      <div className="grid gap-4">
        {messages}
        <div className="flex flex-wrap items-center gap-5">
          <Avatar user={user} taille={88} className="shadow-[0_0_0_4px_#fff,0_0_0_6px_var(--color-lampion)]" />
          <div className="flex flex-wrap gap-2.5">
            <Bouton variante="outremer" onClick={() => champFichier.current.click()} disabled={chargement}>
              {chargement ? 'Envoi…' : aUnePhoto ? 'Changer la photo' : 'Ajouter une photo'}
            </Bouton>
            {aUnePhoto && (
              <Bouton
                variante="discret"
                disabled={chargement}
                onClick={() => lancer(async () => majUser(await supprimerPhoto(token)), 'Photo retirée, ton emoji est de retour.')}
              >
                Retirer la photo
              </Bouton>
            )}
          </div>
        </div>
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
      </div>
    </Carte>
  )
}

// ----- Prénom, email, date de naissance -----
function BlocInfos() {
  const { user, token, majUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [dateNaissance, setDateNaissance] = useState(user?.date_naissance?.slice(0, 10) || '')
  const { chargement, setErreur, lancer, messages } = useEnvoi()

  const modifie = name.trim() !== user?.name || dateNaissance !== user?.date_naissance?.slice(0, 10)

  function enregistrer(e) {
    e.preventDefault()
    const erreurDate = erreurDateNaissance(dateNaissance)
    if (erreurDate) {
      setErreur(erreurDate)
      return
    }
    lancer(async () => {
      majUser(await modifierInfos(token, { name, date_naissance: dateNaissance }))
    }, 'Infos enregistrées.')
  }

  return (
    <Carte titre="Mes infos">
      <form className={FORMULAIRE} onSubmit={enregistrer}>
        {messages}
        <div className={CHAMP}>
          <label htmlFor="name" className={LABEL}>
            Prénom ou pseudo
          </label>
          <input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required className={INPUT} />
        </div>
        <div className={CHAMP}>
          <label htmlFor="email" className={LABEL}>
            Email
          </label>
          <input id="email" value={user?.email || ''} readOnly className={`${INPUT} cursor-not-allowed bg-nappe! text-texte-doux!`} />
          <span className={AIDE}>L'email sert à te connecter, il ne peut pas être modifié pour l'instant.</span>
        </div>
        <div className={CHAMP}>
          <label htmlFor="date_naissance" className={LABEL}>
            Date de naissance
          </label>
          <input
            id="date_naissance"
            type="date"
            value={dateNaissance}
            onChange={(e) => setDateNaissance(e.target.value)}
            min={DATE_NAISSANCE_MIN}
            max={DATE_NAISSANCE_MAX}
            required
            className={INPUT}
          />
        </div>
        <Bouton type="submit" variante="outremer" className="justify-self-start" disabled={chargement || !modifie}>
          {chargement ? 'Enregistrement…' : 'Enregistrer'}
        </Bouton>
      </form>
    </Carte>
  )
}

// ----- Mot de passe -----
function BlocMotDePasse() {
  const { token, login } = useAuth()
  const [ancien, setAncien] = useState('')
  const [nouveau, setNouveau] = useState('')
  const { chargement, setErreur, lancer, messages } = useEnvoi()

  function changer(e) {
    e.preventDefault()
    if (nouveau.length < 6) {
      setErreur('Le nouveau mot de passe doit faire au moins 6 caractères.')
      return
    }
    lancer(async () => {
      // L'API renvoie un nouveau token : on le garde pour rester connecté sur cet appareil
      login(await changerMotDePasseConnecte(token, { ancien, nouveau }))
      setAncien('')
      setNouveau('')
    }, 'Mot de passe changé. Tes autres appareils ont été déconnectés.')
  }

  return (
    <Carte titre="Mot de passe">
      <form className={FORMULAIRE} onSubmit={changer}>
        {messages}
        <ChampMotDePasse id="ancien" label="Mot de passe actuel" value={ancien} onChange={(e) => setAncien(e.target.value)} autoComplete="current-password" />
        <ChampMotDePasse
          id="nouveau"
          label="Nouveau mot de passe"
          value={nouveau}
          onChange={(e) => setNouveau(e.target.value)}
          autoComplete="new-password"
          aide="6 caractères minimum."
        />
        <Bouton type="submit" variante="outremer" className="justify-self-start" disabled={chargement}>
          {chargement ? 'Changement…' : 'Changer le mot de passe'}
        </Bouton>
      </form>
    </Carte>
  )
}

// ----- Suppression du compte -----
function BlocSuppression() {
  const { token, logout } = useAuth()
  const [ouvert, setOuvert] = useState(false)
  const [password, setPassword] = useState('')
  const { chargement, lancer, messages } = useEnvoi()

  function supprimer(e) {
    e.preventDefault()
    lancer(async () => {
      await supprimerCompte(token, password)
      // Plus de compte : on vide la session, la page protégée renvoie vers l'accueil du site
      logout()
    })
  }

  return (
    <Carte
      titre="Supprimer mon compte"
      description="Ton compte, ta photo, tes réservations et les événements que tu as créés seront supprimés définitivement."
      className="border-[#f3c2cc]!"
    >
      {!ouvert ? (
        <Bouton variante="discret" className="border-[#f3c2cc]! text-[#bf2e4c]!" onClick={() => setOuvert(true)}>
          Supprimer mon compte
        </Bouton>
      ) : (
        <form className={FORMULAIRE} onSubmit={supprimer}>
          {messages}
          <ChampMotDePasse
            id="mdp-suppression"
            label="Tape ton mot de passe pour confirmer"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <div className="flex flex-wrap gap-2.5">
            <Bouton type="submit" variante="danger" disabled={chargement}>
              {chargement ? 'Suppression…' : 'Supprimer définitivement'}
            </Bouton>
            <Bouton
              variante="discret"
              onClick={() => {
                setOuvert(false)
                setPassword('')
              }}
              disabled={chargement}
            >
              Annuler
            </Bouton>
          </div>
        </form>
      )}
    </Carte>
  )
}

export default function Profil() {
  const { user, logout } = useAuth()
  const membreDepuis = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : null

  return (
    <AppLayout>
      <header className="flex flex-wrap items-center gap-5">
        <Avatar user={user} taille={72} />
        <div className="min-w-0">
          <h1 className="text-[clamp(28px,4.5vw,44px)]">{user?.name}</h1>
          <p className="mt-1 break-all text-texte-doux">
            {user?.email}
            {membreDepuis && <span className="whitespace-nowrap"> · membre depuis {membreDepuis}</span>}
          </p>
        </div>
      </header>

      <div className="mt-8 grid gap-5">
        <BlocPhoto />
        <BlocInfos />
        <BlocMotDePasse />
        <div>
          <Bouton variante="discret" onClick={logout}>
            Se déconnecter
          </Bouton>
        </div>
        <BlocSuppression />
      </div>
    </AppLayout>
  )
}

import { useCallback, useRef, useState } from 'react'
import AppLayout from '../components/AppLayout.jsx'
import Avatar from '../components/Avatar.jsx'
import Bouton from '../components/Bouton.jsx'
import ChampMotDePasse from '../components/ChampMotDePasse.jsx'
import Modal, { PiedModal } from '../components/Modal.jsx'
import Toast from '../components/Toast.jsx'
import { Symbole } from '../components/Logo.jsx'
import {
  IconeAppareilPhoto,
  IconeCadenas,
  IconeCrayon,
  IconePoubelle,
  IconeSortie,
  IconeUtilisateur,
} from '../components/Icones.jsx'
import { CHAMP, ERREUR, FORMULAIRE, INPUT, LABEL, MONO } from '../components/ui.js'
import { changerMotDePasseConnecte, envoyerPhoto, modifierInfos, supprimerCompte, supprimerPhoto } from '../api/users.js'
import { preparerPhoto } from '../utils/image.js'
import { DATE_NAISSANCE_MAX, DATE_NAISSANCE_MIN, erreurDateNaissance } from '../utils/dates.js'
import { useAuth } from '../context/AuthContext.js'

// ---------- Petits outils ----------

// "2000-05-10T00:00:00.000Z" -> "10 mai 2000"
function dateLisible(iso, options = { day: 'numeric', month: 'long', year: 'numeric' }) {
  return iso ? new Date(iso).toLocaleDateString('fr-FR', { ...options, timeZone: 'UTC' }) : ''
}

function calculerAge(iso) {
  if (!iso) return null
  const naissance = new Date(iso)
  const auj = new Date()
  let age = auj.getFullYear() - naissance.getUTCFullYear()
  const pasEncore = auj.getMonth() < naissance.getUTCMonth() || (auj.getMonth() === naissance.getUTCMonth() && auj.getDate() < naissance.getUTCDate())
  return pasEncore ? age - 1 : age
}

// Gère "en cours / erreur" pour une action envoyée au serveur depuis une fenêtre
function useEnvoi() {
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function lancer(action) {
    setErreur('')
    setChargement(true)
    try {
      await action()
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  const blocErreur = erreur ? (
    <p className={`${ERREUR} mb-5`} role="alert">
      {erreur}
    </p>
  ) : null

  return { chargement, setErreur, lancer, blocErreur }
}

// Une carte blanche avec une icône et un titre
function Carte({ icone, titre, action, children, className = '' }) {
  return (
    <section className={`rounded-3xl border border-bordure bg-white p-5 sm:p-6 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-lg font-bold">
          <span className="grid size-9 place-items-center rounded-xl bg-outremer/10 text-outremer">{icone}</span>
          {titre}
        </h2>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}

// Une ligne "libellé / valeur" dans une carte
function Ligne({ libelle, children, action }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-bordure/70 py-3.5 last:border-0">
      <div className="min-w-0">
        <p className={`${MONO} text-gris`}>{libelle}</p>
        <div className="mt-1 break-words font-semibold">{children}</div>
      </div>
      {action}
    </div>
  )
}

// ---------- Les fenêtres ----------

function ModalePhoto({ ouvert, onFermer, onReussite }) {
  const { user, token, majUser } = useAuth()
  const champFichier = useRef(null)
  const [apercu, setApercu] = useState(null)
  const [survol, setSurvol] = useState(false)
  const { chargement, setErreur, lancer, blocErreur } = useEnvoi()
  const aUnePhoto = Boolean(user?.avatar?.photo_version)

  function fermer() {
    setApercu(null)
    setErreur('')
    onFermer()
  }

  async function choisir(fichier) {
    if (!fichier) return
    setErreur('')
    try {
      setApercu(await preparerPhoto(fichier))
    } catch (err) {
      setErreur(err.message)
    }
  }

  return (
    <Modal ouvert={ouvert} onFermer={fermer} titre="Photo de profil" description="Elle s'affiche à côté de ton nom quand tu rejoins un plan." icone={<IconeAppareilPhoto />}>
      {blocErreur}
      <button
        type="button"
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
        className={`grid w-full cursor-pointer justify-items-center gap-4 rounded-3xl border-2 border-dashed px-4 py-7 transition focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-lampion ${survol ? 'border-outremer bg-[#f3f4ff]' : 'border-bordure bg-nappe hover:border-outremer hover:bg-[#f3f4ff]'}`}
      >
        <Avatar user={user} apercu={apercu} taille={136} className="shadow-[0_0_0_5px_#fff,0_0_0_8px_var(--color-lampion)]" />
        <span className="text-sm font-semibold text-texte-doux">
          {apercu ? 'Clique pour en choisir une autre' : 'Clique ou glisse une photo ici'}
        </span>
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

      <PiedModal>
        {aUnePhoto && !apercu && (
          <Bouton
            variante="danger-contour"
            className="sm:mr-auto"
            disabled={chargement}
            onClick={() =>
              lancer(async () => {
                majUser(await supprimerPhoto(token))
                fermer()
                onReussite('Photo retirée, ton emoji est de retour')
              })
            }
          >
            Retirer la photo
          </Bouton>
        )}
        <Bouton variante="discret" onClick={fermer} disabled={chargement}>
          Annuler
        </Bouton>
        <Bouton
          variante="outremer"
          disabled={!apercu || chargement}
          onClick={() =>
            lancer(async () => {
              majUser(await envoyerPhoto(token, apercu))
              fermer()
              onReussite('Photo mise à jour')
            })
          }
        >
          {chargement ? 'Envoi…' : 'Enregistrer'}
        </Bouton>
      </PiedModal>
    </Modal>
  )
}

function ModaleInfos({ ouvert, onFermer, onReussite }) {
  const { user, token, majUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [dateNaissance, setDateNaissance] = useState(user?.date_naissance?.slice(0, 10) || '')
  const { chargement, setErreur, lancer, blocErreur } = useEnvoi()
  const modifie = name.trim() !== user?.name || dateNaissance !== user?.date_naissance?.slice(0, 10)

  function fermer() {
    // On remet les valeurs actuelles pour la prochaine ouverture
    setName(user?.name || '')
    setDateNaissance(user?.date_naissance?.slice(0, 10) || '')
    setErreur('')
    onFermer()
  }

  function enregistrer(e) {
    e.preventDefault()
    const erreurDate = erreurDateNaissance(dateNaissance)
    if (erreurDate) {
      setErreur(erreurDate)
      return
    }
    lancer(async () => {
      majUser(await modifierInfos(token, { name, date_naissance: dateNaissance }))
      onFermer()
      onReussite('Infos enregistrées')
    })
  }

  return (
    <Modal ouvert={ouvert} onFermer={fermer} titre="Modifier mes infos" icone={<IconeCrayon />}>
      <form className={FORMULAIRE} onSubmit={enregistrer}>
        {blocErreur}
        <div className={CHAMP}>
          <label htmlFor="name" className={LABEL}>
            Prénom ou pseudo
          </label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required autoFocus className={INPUT} />
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
        <PiedModal>
          <Bouton variante="discret" onClick={fermer} disabled={chargement}>
            Annuler
          </Bouton>
          <Bouton type="submit" variante="outremer" disabled={chargement || !modifie}>
            {chargement ? 'Enregistrement…' : 'Enregistrer'}
          </Bouton>
        </PiedModal>
      </form>
    </Modal>
  )
}

function ModaleMotDePasse({ ouvert, onFermer, onReussite }) {
  const { token, login } = useAuth()
  const [ancien, setAncien] = useState('')
  const [nouveau, setNouveau] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const { chargement, setErreur, lancer, blocErreur } = useEnvoi()

  function fermer() {
    setAncien('')
    setNouveau('')
    setConfirmation('')
    setErreur('')
    onFermer()
  }

  function changer(e) {
    e.preventDefault()
    if (nouveau.length < 8) {
      setErreur('Le nouveau mot de passe doit faire au moins 8 caractères.')
      return
    }
    if (nouveau !== confirmation) {
      setErreur('Les deux nouveaux mots de passe ne sont pas identiques.')
      return
    }
    lancer(async () => {
      // L'API renvoie un nouveau token : on le garde pour rester connecté sur cet appareil
      login(await changerMotDePasseConnecte(token, { ancien, nouveau }))
      fermer()
      onReussite('Mot de passe changé, tes autres appareils sont déconnectés')
    })
  }

  return (
    <Modal ouvert={ouvert} onFermer={fermer} titre="Changer de mot de passe" description="Tu resteras connectée ici. Tes autres appareils seront déconnectés." icone={<IconeCadenas />}>
      <form className={FORMULAIRE} onSubmit={changer}>
        {blocErreur}
        <ChampMotDePasse id="ancien" label="Mot de passe actuel" value={ancien} onChange={(e) => setAncien(e.target.value)} autoComplete="current-password" minLength={0} />
        <ChampMotDePasse id="nouveau" label="Nouveau mot de passe" value={nouveau} onChange={(e) => setNouveau(e.target.value)} autoComplete="new-password" aide="8 caractères minimum." />
        <ChampMotDePasse id="confirmation" label="Confirme le nouveau mot de passe" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} autoComplete="new-password" />
        <PiedModal>
          <Bouton variante="discret" onClick={fermer} disabled={chargement}>
            Annuler
          </Bouton>
          <Bouton type="submit" variante="outremer" disabled={chargement}>
            {chargement ? 'Changement…' : 'Changer le mot de passe'}
          </Bouton>
        </PiedModal>
      </form>
    </Modal>
  )
}

function ModaleSuppression({ ouvert, onFermer }) {
  const { token, logout } = useAuth()
  const [password, setPassword] = useState('')
  const { chargement, setErreur, lancer, blocErreur } = useEnvoi()

  function fermer() {
    setPassword('')
    setErreur('')
    onFermer()
  }

  function supprimer(e) {
    e.preventDefault()
    lancer(async () => {
      await supprimerCompte(token, password)
      // Plus de compte : on vide la session, la page protégée renvoie vers la landing page
      logout()
    })
  }

  return (
    <Modal ouvert={ouvert} onFermer={fermer} titre="Supprimer ton compte ?" description="C'est définitif, on ne pourra pas le récupérer." icone={<IconePoubelle />} danger>
      <form className={FORMULAIRE} onSubmit={supprimer}>
        {blocErreur}
        <ul className="grid gap-2 rounded-2xl bg-[#fff5f7] p-4 text-sm text-[#7a1f33]">
          {['Ton compte et ta photo', 'Tes réservations (tes places sont libérées)', 'Les événements que tu as créés'].map((t) => (
            <li key={t} className="flex items-center gap-2.5">
              <span className="size-2 shrink-0 rounded-full bg-[#d63a5a]" aria-hidden="true" />
              {t}
            </li>
          ))}
        </ul>
        <ChampMotDePasse id="mdp-suppression" label="Tape ton mot de passe pour confirmer" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" minLength={0} />
        <PiedModal>
          <Bouton variante="discret" onClick={fermer} disabled={chargement}>
            Annuler
          </Bouton>
          <Bouton type="submit" variante="danger" disabled={chargement || !password}>
            {chargement ? 'Suppression…' : 'Supprimer définitivement'}
          </Bouton>
        </PiedModal>
      </form>
    </Modal>
  )
}

// ---------- La page ----------

export default function Profil() {
  const { user, logout } = useAuth()
  const [modale, setModale] = useState(null) // 'photo' | 'infos' | 'mdp' | 'suppression' | null
  const [toast, setToast] = useState('')
  const fermer = () => setModale(null)
  const finToast = useCallback(() => setToast(''), [])
  const age = calculerAge(user?.date_naissance)

  return (
    <AppLayout>
      {/* ----- En-tête : bannière + avatar ----- */}
      <section className="overflow-hidden rounded-3xl border border-bordure bg-white">
        <div className="relative h-28 overflow-hidden bg-outremer sm:h-36" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.14)_2.5px,transparent_3px)] [background-size:28px_28px]" />
          <Symbole className="absolute -top-10 -right-8 w-56 sm:w-72" couleur="rgba(255,255,255,0.14)" couleurLibre="#FFB21E" />
        </div>

        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-14 flex flex-wrap items-end justify-between gap-4">
            <button
              type="button"
              onClick={() => setModale('photo')}
              className="group relative cursor-pointer rounded-full focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-lampion"
              aria-label="Changer la photo de profil"
            >
              <Avatar user={user} taille={112} className="shadow-[0_0_0_5px_#fff] transition group-hover:brightness-95" />
              <span className="absolute right-0 bottom-1 grid size-9 place-items-center rounded-full bg-lampion text-ardoise shadow-[0_0_0_4px_#fff] transition group-hover:scale-110">
                <IconeAppareilPhoto className="size-[18px]" />
              </span>
            </button>
            <Bouton variante="discret" taille="petit" onClick={() => setModale('infos')}>
              <IconeCrayon className="size-4" />
              Modifier le profil
            </Bouton>
          </div>

          <h1 className="mt-4 text-[clamp(28px,4.5vw,40px)] font-[750] break-words">{user?.name}</h1>
          <p className="mt-1 break-all text-texte-doux">{user?.email}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {user?.createdAt && (
              <span className="rounded-full bg-nappe px-3 py-1 text-xs font-bold text-texte-doux">
                Membre depuis {dateLisible(user.createdAt, { month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ----- Infos + sécurité ----- */}
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Carte
          icone={<IconeUtilisateur className="size-[18px]" />}
          titre="Mes infos"
          action={
            <Bouton variante="discret" taille="petit" onClick={() => setModale('infos')}>
              Modifier
            </Bouton>
          }
        >
          <Ligne libelle="Prénom ou pseudo">{user?.name}</Ligne>
          <Ligne libelle="Email">
            <span className="flex items-center gap-1.5">
              {user?.email}
              <IconeCadenas className="size-3.5 shrink-0 text-gris" />
            </span>
          </Ligne>
          <Ligne libelle="Date de naissance">
            {dateLisible(user?.date_naissance)}
            {age !== null && <span className="font-normal text-texte-doux"> · {age} ans</span>}
          </Ligne>
        </Carte>

        <Carte icone={<IconeCadenas className="size-[18px]" />} titre="Sécurité">
          <Ligne
            libelle="Mot de passe"
            action={
              <Bouton variante="discret" taille="petit" onClick={() => setModale('mdp')}>
                Changer
              </Bouton>
            }
          >
            <span className="tracking-[0.2em]">••••••••</span>
          </Ligne>
          <Ligne
            libelle="Session"
            action={
              <Bouton variante="discret" taille="petit" onClick={logout}>
                <IconeSortie className="size-4" />
                Se déconnecter
              </Bouton>
            }
          >
            Connectée sur cet appareil
          </Ligne>
        </Carte>
      </div>

      {/* ----- Zone sensible ----- */}
      <section className="mt-5 flex flex-col gap-4 rounded-3xl border border-[#f3c2cc] bg-[#fffafb] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-[#7a1f33]">Supprimer mon compte</h2>
          <p className="mt-1 text-sm text-texte-doux">Ton compte, tes réservations et tes événements seront effacés définitivement.</p>
        </div>
        <Bouton variante="danger-contour" taille="petit" className="self-start sm:self-auto" onClick={() => setModale('suppression')}>
          <IconePoubelle className="size-4" />
          Supprimer
        </Bouton>
      </section>

      <ModalePhoto ouvert={modale === 'photo'} onFermer={fermer} onReussite={setToast} />
      <ModaleInfos key={`${user?.name}-${user?.date_naissance}`} ouvert={modale === 'infos'} onFermer={fermer} onReussite={setToast} />
      <ModaleMotDePasse ouvert={modale === 'mdp'} onFermer={fermer} onReussite={setToast} />
      <ModaleSuppression ouvert={modale === 'suppression'} onFermer={fermer} />
      <Toast message={toast} onFin={finToast} />
    </AppLayout>
  )
}

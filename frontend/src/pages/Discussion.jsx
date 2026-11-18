import { useLayoutEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Avatar from '../components/Avatar.jsx'
import Bouton from '../components/Bouton.jsx'
import { useAuth } from '../context/AuthContext.js'
import useDiscussion from '../hooks/useDiscussion.js'
import { ERREUR, MONO } from '../components/ui.js'

const TEXTE_MAX = 500
const REGROUPEMENT_MS = 5 * 60 * 1000 // deux messages du même user à moins de 5 min : une seule bulle d'en-tête

const heure = (date) => new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

// "Aujourd'hui", "Hier" ou "lundi 17 novembre"
function jour(date) {
  const d = new Date(date)
  const aujourdhui = new Date()
  const hier = new Date()
  hier.setDate(hier.getDate() - 1)
  if (d.toDateString() === aujourdhui.toDateString()) return "Aujourd'hui"
  if (d.toDateString() === hier.toDateString()) return 'Hier'
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: d.getFullYear() === aujourdhui.getFullYear() ? undefined : 'numeric',
  })
}

const dateEvent = (date) =>
  new Date(date).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function texteQuiEcrit(noms) {
  if (noms.length === 0) return ''
  if (noms.length === 1) return `${noms[0]} écrit…`
  if (noms.length === 2) return `${noms[0]} et ${noms[1]} écrivent…`
  return 'Plusieurs personnes écrivent…'
}

function Message({ message, estMoi, debutGroupe }) {
  const auteur = message.user?.name || 'Compte supprimé'
  return (
    <li className={`flex items-end gap-2 ${estMoi ? 'flex-row-reverse' : ''} ${debutGroupe ? 'mt-3' : 'mt-0.5'}`}>
      {/* L'avatar n'apparaît qu'au début d'une série, sinon une place vide garde l'alignement */}
      {!estMoi ? (
        debutGroupe ? <Avatar user={message.user} taille={32} /> : <span className="w-8 shrink-0" aria-hidden="true" />
      ) : null}
      <div className={`flex max-w-[78%] flex-col ${estMoi ? 'items-end' : 'items-start'}`}>
        {debutGroupe && !estMoi ? <span className="mb-1 ml-1 text-xs font-bold text-texte-doux">{auteur}</span> : null}
        <div
          className={`rounded-2xl px-3.5 py-2 text-[15px] leading-snug whitespace-pre-wrap [overflow-wrap:anywhere] ${
            estMoi ? 'rounded-br-md bg-outremer text-white' : 'rounded-bl-md border border-bordure bg-white text-ardoise'
          }`}
        >
          {message.texte}
          <time
            dateTime={message.createdAt}
            className={`ml-2 inline-block translate-y-0.5 align-baseline text-[11px] ${estMoi ? 'text-white/70' : 'text-gris'}`}
          >
            {heure(message.createdAt)}
          </time>
        </div>
      </div>
    </li>
  )
}

export default function Discussion() {
  const { id } = useParams()
  const { user } = useAuth()
  const {
    etat,
    erreur,
    event,
    messages,
    encoreAvant,
    chargementAvant,
    connecte,
    quiEcrit,
    envoyer,
    signalerEcrit,
    chargerPlusAnciens,
  } = useDiscussion(id)

  const [texte, setTexte] = useState('')
  const [erreurEnvoi, setErreurEnvoi] = useState('')
  const listeRef = useRef(null)
  const champRef = useRef(null)
  const scrollRef = useRef({ hauteur: 0, enBas: true, premier: '', dernier: '' })

  // Gestion du défilement quand la liste change :
  // - messages plus anciens ajoutés en haut : on garde la position de lecture
  // - nouveau message en bas : on descend si on était déjà en bas, ou si c'est le nôtre
  useLayoutEffect(() => {
    const liste = listeRef.current
    if (!liste || messages.length === 0) return
    const avant = scrollRef.current
    const premier = messages[0]._id
    const dernier = messages[messages.length - 1]
    const ajoutEnHaut = avant.premier && premier !== avant.premier && dernier._id === avant.dernier

    if (ajoutEnHaut) {
      liste.scrollTop += liste.scrollHeight - avant.hauteur
    } else if (dernier._id !== avant.dernier && (avant.enBas || dernier.user?._id === user?._id)) {
      liste.scrollTop = liste.scrollHeight
    }
    scrollRef.current = { ...avant, hauteur: liste.scrollHeight, premier, dernier: dernier._id }
  }, [messages, user?._id])

  function surDefilement() {
    const liste = listeRef.current
    scrollRef.current.enBas = liste.scrollHeight - liste.scrollTop - liste.clientHeight < 80
    scrollRef.current.hauteur = liste.scrollHeight
  }

  async function soumettre(e) {
    e?.preventDefault()
    const propre = texte.trim()
    if (!propre) return
    setErreurEnvoi('')
    setTexte('') // on vide tout de suite ; on remet le texte si l'envoi échoue
    try {
      await envoyer(propre)
    } catch (err) {
      setTexte(propre)
      setErreurEnvoi(err.message)
    }
    champRef.current?.focus()
  }

  function surTouche(e) {
    // Entrée envoie, Maj + Entrée va à la ligne
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      void soumettre()
    }
  }

  if (etat === 'chargement') {
    return (
      <AppLayout>
        <p className="py-20 text-center text-texte-doux" aria-live="polite">Chargement de la discussion…</p>
      </AppLayout>
    )
  }

  if (etat === 'erreur') {
    return (
      <AppLayout>
        <div className="mx-auto grid max-w-md gap-4 py-16 text-center">
          <p className={ERREUR}>{erreur}</p>
          <Bouton variante="discret" to="/mes-reservations">Retour à mes réservations</Bouton>
        </div>
      </AppLayout>
    )
  }

  const ferme = etat === 'fermee'
  const ecrit = texteQuiEcrit(quiEcrit)

  return (
    <AppLayout>
      <section className="flex h-[calc(100svh-8.5rem)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-bordure bg-white shadow-[0_10px_30px_rgba(26,28,46,0.04)]">
        {/* En-tête : retour, titre de l'event, état de la connexion */}
        <header className="flex items-center gap-3 border-b border-bordure px-4 py-3 sm:px-5">
          <Link
            to="/mes-reservations"
            className="grid size-9 shrink-0 place-items-center rounded-full text-xl text-texte-doux no-underline transition hover:bg-nappe hover:text-ardoise"
            aria-label="Retour à mes réservations"
          >
            ←
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-titre text-lg tracking-[-0.02em]">{event?.titre}</h1>
            {event ? (
              <p className="truncate text-sm text-texte-doux">
                {dateEvent(event.date_event)} · {event.localisation}
              </p>
            ) : null}
          </div>
          {!ferme ? (
            <span className={`${MONO} flex shrink-0 items-center gap-1.5 text-[11px] text-texte-doux`} aria-live="polite">
              <span className={`size-2 rounded-full ${connecte ? 'bg-menthe' : 'animate-pulse bg-lampion'}`} aria-hidden="true" />
              {connecte ? 'En direct' : 'Connexion…'}
            </span>
          ) : null}
        </header>

        {/* Les messages */}
        <ol
          ref={listeRef}
          onScroll={surDefilement}
          className="flex-1 overflow-y-auto bg-nappe/60 px-3 py-4 sm:px-5"
          aria-label="Messages"
        >
          {encoreAvant ? (
            <li className="mb-2 flex justify-center">
              <Bouton variante="discret" taille="petit" disabled={chargementAvant} onClick={() => void chargerPlusAnciens()}>
                {chargementAvant ? 'Chargement…' : 'Messages plus anciens'}
              </Bouton>
            </li>
          ) : null}

          {messages.length === 0 ? (
            <li className="grid h-full place-items-center text-center text-texte-doux">
              <p>
                Pas encore de message.
                <br />
                Dis bonjour aux autres participants 👋
              </p>
            </li>
          ) : null}

          {messages.flatMap((message, i) => {
            const precedent = messages[i - 1]
            const nouveauJour = !precedent || jour(precedent.createdAt) !== jour(message.createdAt)
            const debutGroupe =
              nouveauJour ||
              precedent.user?._id !== message.user?._id ||
              new Date(message.createdAt) - new Date(precedent.createdAt) > REGROUPEMENT_MS
            const elements = []
            if (nouveauJour) {
              elements.push(
                <li key={`jour-${message._id}`} className="my-4 flex justify-center first:mt-0">
                  <span className={`${MONO} rounded-full bg-white px-3 py-1 text-[11px] text-texte-doux shadow-sm`}>
                    {jour(message.createdAt)}
                  </span>
                </li>,
              )
            }
            elements.push(
              <Message
                key={message._id}
                message={message}
                estMoi={Boolean(user?._id) && message.user?._id === user._id}
                debutGroupe={debutGroupe}
              />,
            )
            return elements
          })}
        </ol>

        {/* Zone de saisie */}
        <div className="border-t border-bordure px-3 py-3 sm:px-5">
          <p className="h-5 px-1 text-xs text-texte-doux italic" aria-live="polite">
            {ecrit}
          </p>
          {ferme ? (
            <p className={ERREUR}>{erreur}</p>
          ) : (
            <form onSubmit={soumettre} className="flex items-end gap-2">
              <label htmlFor="message" className="sr-only">
                Ton message
              </label>
              <textarea
                id="message"
                ref={champRef}
                rows={1}
                value={texte}
                maxLength={TEXTE_MAX}
                onChange={(e) => {
                  setTexte(e.target.value)
                  if (e.target.value.trim()) signalerEcrit()
                }}
                onKeyDown={surTouche}
                placeholder="Écris un message…"
                className="max-h-36 min-h-12 flex-1 resize-none rounded-[22px] border-[1.5px] border-bordure bg-white px-4 py-3 text-ardoise [field-sizing:content] transition hover:border-gris focus:border-outremer focus:ring-4 focus:ring-outremer/15 focus:outline-none"
              />
              <Bouton type="submit" variante="outremer" className="min-h-12 shrink-0 px-5" disabled={!texte.trim() || !connecte}>
                Envoyer
              </Bouton>
            </form>
          )}
          {erreurEnvoi ? <p className={`${ERREUR} mt-2`}>{erreurEnvoi}</p> : null}
          {!ferme && texte.length > TEXTE_MAX - 100 ? (
            <p className="mt-1 px-1 text-right text-xs text-texte-doux">
              {texte.length}/{TEXTE_MAX}
            </p>
          ) : null}
        </div>
      </section>
    </AppLayout>
  )
}

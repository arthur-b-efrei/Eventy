import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.js'
import { EVENEMENT_SESSION_EXPIREE } from '../api/client.js'
import { chargerMessages, connecterSocket } from '../api/discussion.js'

const DUREE_ECRIT_MS = 3000 // "X écrit…" disparaît après 3 s sans nouvelle frappe
const INTERVALLE_ECRIT_MS = 1500 // on ne prévient pas les autres à chaque touche

// Ajoute des messages à la liste sans doublon, triés par date d'envoi
function fusionner(liste, nouveaux) {
  const parId = new Map(liste.map((m) => [m._id, m]))
  for (const m of nouveaux) parId.set(m._id, m)
  return [...parId.values()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
}

// Toute la logique de la discussion d'un event : historique, direct, envoi, "écrit…".
// etat : 'chargement' | 'pret' | 'erreur' | 'fermee'
export default function useDiscussion(eventId) {
  const { token, user } = useAuth()
  const socketRef = useRef(null)
  const dernierEcritRef = useRef(0)

  const [etat, setEtat] = useState('chargement')
  const [erreur, setErreur] = useState('')
  const [event, setEvent] = useState(null)
  const [messages, setMessages] = useState([])
  const [encoreAvant, setEncoreAvant] = useState(false)
  const [chargementAvant, setChargementAvant] = useState(false)
  const [connecte, setConnecte] = useState(false)
  const [ecrivent, setEcrivent] = useState({}) // { userId: prénom } de ceux qui tapent en ce moment

  useEffect(() => {
    let actif = true
    const minuteries = new Map()
    const monId = user?._id

    // Changement d'event (ou remount) : on repart à zéro pour ne pas mélanger les fils
    setEtat('chargement')
    setErreur('')
    setEvent(null)
    setMessages([])
    setEncoreAvant(false)
    setChargementAvant(false)
    setConnecte(false)
    setEcrivent({})

    // 1. L'historique d'abord (vérifie aussi que le user a accès à la discussion)
    // initial=true : remplace l'état ; sinon (reconnexion) : fusionne sans toucher encoreAvant
    async function chargerDerniers({ initial = false } = {}) {
      const donnees = await chargerMessages(token, eventId)
      if (!actif) return
      setEvent(donnees.event)
      if (initial) {
        setMessages(fusionner([], donnees.messages))
        setEncoreAvant(donnees.encoreAvant)
      } else {
        setMessages((liste) => fusionner(liste, donnees.messages))
      }
      setEtat('pret')
    }

    chargerDerniers({ initial: true })
      .then(() => {
        if (!actif) return
        // 2. Puis le direct
        const socket = connecterSocket(token)
        socketRef.current = socket
        let premiereConnexion = true

        socket.on('connect', () => {
          setConnecte(true)
          socket.emit('rejoindre', eventId, (reponse) => {
            if (reponse?.erreur) {
              setErreur(reponse.erreur)
              setEtat('fermee')
            }
          })
          // Après une coupure : on récupère les messages envoyés pendant qu'on était absent
          if (!premiereConnexion) chargerDerniers().catch(() => {})
          premiereConnexion = false
        })

        socket.on('disconnect', () => setConnecte(false))

        socket.on('connect_error', (err) => {
          setConnecte(false)
          // Token refusé (expiré, mot de passe changé…) : même traitement qu'un 401 de l'API
          if (err.data?.code === 'NON_AUTORISE') {
            window.dispatchEvent(new Event(EVENEMENT_SESSION_EXPIREE))
          }
        })

        socket.on('message', (message) => {
          if (message.id_event !== eventId) return
          setMessages((liste) => fusionner(liste, [message]))
          // Il vient d'envoyer : il n'écrit plus
          const auteur = message.user?._id
          if (auteur) {
            setEcrivent(({ [auteur]: _retire, ...reste }) => reste)
          }
        })

        socket.on('ecrit', ({ eventId: id, userId, name }) => {
          // On s'ignore soi-même (cas où on a la discussion ouverte dans deux onglets)
          if (id !== eventId || userId === monId) return
          setEcrivent((e) => ({ ...e, [userId]: name || "Quelqu'un" }))
          clearTimeout(minuteries.get(userId))
          minuteries.set(
            userId,
            setTimeout(() => setEcrivent(({ [userId]: _retire, ...reste }) => reste), DUREE_ECRIT_MS),
          )
        })

        socket.on('discussion-fermee', ({ eventId: id, raison }) => {
          if (id !== eventId) return
          setErreur(
            raison === 'supprime'
              ? 'Cet événement a été supprimé : sa discussion est fermée.'
              : "Tu n'es plus inscrit à cet événement : tu n'as plus accès à sa discussion.",
          )
          setEtat('fermee')
          socket.disconnect()
        })
      })
      .catch((err) => {
        if (!actif) return
        setErreur(
          err.status === 404
            ? "Cette discussion n'existe pas, ou tu n'es pas inscrit à cet événement."
            : err.message,
        )
        setEtat('erreur')
      })

    return () => {
      actif = false
      minuteries.forEach(clearTimeout)
      socketRef.current?.disconnect()
      socketRef.current = null
    }
    // user._id ne change pas pendant la session : inutile de reconnecter si le reste du user change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, token])

  // Envoie un message. Renvoie une promesse : rejetée avec un message lisible si ça échoue.
  const envoyer = useCallback(
    (texte) =>
      new Promise((resolve, reject) => {
        const socket = socketRef.current
        if (!socket?.connected) {
          reject(new Error('Pas de connexion pour le moment, réessaie dans un instant.'))
          return
        }
        socket.timeout(8000).emit('message', { eventId, texte }, (delai, reponse) => {
          if (delai) reject(new Error("Le message n'est pas parti, réessaie."))
          else if (reponse?.erreur) reject(new Error(reponse.erreur))
          else resolve(reponse.message)
        })
      }),
    [eventId],
  )

  // À appeler quand le user tape : prévient les autres (au plus toutes les 1,5 s)
  const signalerEcrit = useCallback(() => {
    const maintenant = Date.now()
    if (maintenant - dernierEcritRef.current < INTERVALLE_ECRIT_MS) return
    dernierEcritRef.current = maintenant
    socketRef.current?.emit('ecrit', eventId)
  }, [eventId])

  // Charge les 50 messages d'avant le plus ancien affiché
  const chargerPlusAnciens = useCallback(async () => {
    const plusAncien = messages[0]
    if (!plusAncien || chargementAvant) return
    setChargementAvant(true)
    try {
      const donnees = await chargerMessages(token, eventId, plusAncien._id)
      setMessages((liste) => fusionner(liste, donnees.messages))
      setEncoreAvant(donnees.encoreAvant)
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargementAvant(false)
    }
  }, [messages, chargementAvant, token, eventId])

  return {
    etat,
    erreur,
    event,
    messages,
    encoreAvant,
    chargementAvant,
    connecte,
    quiEcrit: Object.values(ecrivent),
    envoyer,
    signalerEcrit,
    chargerPlusAnciens,
  }
}

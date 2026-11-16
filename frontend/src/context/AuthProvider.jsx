import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext.js'
import { EVENEMENT_SESSION_EXPIREE } from '../api/client.js'
import { moi } from '../api/auth.js'

const CLE_TOKEN = 'eventy_token'
const CLE_USER = 'eventy_user'

const DECONNECTE = { token: null, user: null, expiree: false }

// Lit la date d'expiration écrite dans le token (le milieu du JWT est du JSON en base64)
function tokenExpire(token) {
  try {
    const contenu = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return contenu.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

function viderStockage() {
  try {
    localStorage.removeItem(CLE_TOKEN)
    localStorage.removeItem(CLE_USER)
  } catch {
    // stockage indisponible (navigation privée…) : rien à vider
  }
}

// Relit la session enregistrée dans le navigateur (si l'utilisateur était déjà connecté)
function lireSession() {
  try {
    const token = localStorage.getItem(CLE_TOKEN)
    const user = JSON.parse(localStorage.getItem(CLE_USER))
    if (!token || !user) return DECONNECTE
    // Token périmé pendant que l'appli était fermée : on repart déconnecté, avec un message
    if (tokenExpire(token)) {
      viderStockage()
      return { ...DECONNECTE, expiree: true }
    }
    return { token, user, expiree: false }
  } catch {
    return DECONNECTE
  }
}

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(lireSession)

  // Appelé après une connexion ou une inscription réussie
  function login({ token, user }) {
    localStorage.setItem(CLE_TOKEN, token)
    localStorage.setItem(CLE_USER, JSON.stringify(user))
    setSession({ token, user, expiree: false })
  }

  function logout() {
    viderStockage()
    setSession(DECONNECTE)
  }

  // Met à jour les infos du user connecté (ex : après un changement de photo)
  function majUser(user) {
    localStorage.setItem(CLE_USER, JSON.stringify(user))
    setSession((s) => ({ ...s, user }))
  }

  // Le serveur a refusé le token (expiré, mot de passe changé ailleurs, compte supprimé…)
  useEffect(() => {
    function sessionExpiree() {
      viderStockage()
      setSession({ ...DECONNECTE, expiree: true })
    }
    window.addEventListener(EVENEMENT_SESSION_EXPIREE, sessionExpiree)
    return () => window.removeEventListener(EVENEMENT_SESSION_EXPIREE, sessionExpiree)
  }, [])

  // À l'ouverture de l'appli : on demande au serveur si le token marche toujours,
  // et on récupère au passage les infos à jour du user (nouvelle photo…)
  useEffect(() => {
    if (!session.token) return
    moi(session.token)
      .then((user) => {
        localStorage.setItem(CLE_USER, JSON.stringify(user))
        setSession((s) => (s.token ? { ...s, user } : s))
      })
      .catch(() => {
        // 401 : déjà géré par l'événement "session expirée". Serveur injoignable : on garde la session.
      })
    // On ne vérifie qu'au démarrage, pas à chaque changement de session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthContext.Provider value={{ ...session, login, logout, majUser }}>
      {children}
    </AuthContext.Provider>
  )
}

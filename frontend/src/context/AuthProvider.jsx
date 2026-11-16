import { useState } from 'react'
import { AuthContext } from './AuthContext.js'

const CLE_TOKEN = 'eventy_token'
const CLE_USER = 'eventy_user'

// Relit la session enregistrée dans le navigateur (si l'utilisateur était déjà connecté)
function lireSession() {
  try {
    const token = localStorage.getItem(CLE_TOKEN)
    const user = JSON.parse(localStorage.getItem(CLE_USER))
    return token && user ? { token, user } : { token: null, user: null }
  } catch {
    return { token: null, user: null }
  }
}

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(lireSession)

  // Appelé après une connexion ou une inscription réussie
  function login({ token, user }) {
    localStorage.setItem(CLE_TOKEN, token)
    localStorage.setItem(CLE_USER, JSON.stringify(user))
    setSession({ token, user })
  }

  function logout() {
    localStorage.removeItem(CLE_TOKEN)
    localStorage.removeItem(CLE_USER)
    setSession({ token: null, user: null })
  }

  // Met à jour les infos du user connecté (ex : après un changement de photo)
  function majUser(user) {
    localStorage.setItem(CLE_USER, JSON.stringify(user))
    setSession((s) => ({ ...s, user }))
  }

  return (
    <AuthContext.Provider value={{ ...session, login, logout, majUser }}>
      {children}
    </AuthContext.Provider>
  )
}

import { createContext, useContext } from 'react'

// Le contexte partagé dans toute l'appli : user connecté, token, login(), logout()
export const AuthContext = createContext(null)

// Raccourci pour lire le contexte dans un composant : const { user } = useAuth()
export function useAuth() {
  return useContext(AuthContext)
}

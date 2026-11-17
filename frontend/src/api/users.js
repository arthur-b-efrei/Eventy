import { API_URL, requete } from './client.js'

const avecToken = (token) => ({ Authorization: `Bearer ${token}` })

// Adresse de la photo de profil d'un user (null s'il n'a pas de photo)
export function urlPhoto(user) {
  const version = user?.avatar?.photo_version
  return version ? `${API_URL}/users/${user._id}/avatar?v=${version}` : null
}

// Envoie la photo (image déjà réduite, en data URL) -> renvoie le user mis à jour
export function envoyerPhoto(token, image) {
  return requete('/users/me/avatar', { method: 'PUT', headers: avecToken(token), body: JSON.stringify({ image }) })
}

// Supprime la photo et revient à l'emoji -> renvoie le user mis à jour
export function supprimerPhoto(token) {
  return requete('/users/me/avatar', { method: 'DELETE', headers: avecToken(token) })
}

// Modifie le prénom et/ou la date de naissance -> renvoie le user mis à jour
export function modifierInfos(token, infos) {
  return requete('/users/me', { method: 'PATCH', headers: avecToken(token), body: JSON.stringify(infos) })
}

// Change le mot de passe : { ancien, nouveau } -> { token, user } (nouveau token pour cet appareil)
export function changerMotDePasseConnecte(token, motsDePasse) {
  return requete('/users/me/password', { method: 'PUT', headers: avecToken(token), body: JSON.stringify(motsDePasse) })
}

// Supprime le compte (le mot de passe est demandé pour confirmer)
export function supprimerCompte(token, password) {
  return requete('/users/me', { method: 'DELETE', headers: avecToken(token), body: JSON.stringify({ password }) })
}

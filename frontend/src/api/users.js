import { API_URL, requete } from './client.js'

// Adresse de la photo de profil d'un user (null s'il n'a pas de photo)
export function urlPhoto(user) {
  const version = user?.avatar?.photo_version
  return version ? `${API_URL}/users/${user._id}/avatar?v=${version}` : null
}

// Envoie la photo (image déjà réduite, en data URL) -> renvoie le user mis à jour
export function envoyerPhoto(token, image) {
  return requete('/users/me/avatar', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ image }),
  })
}

// Supprime la photo et revient à l'emoji -> renvoie le user mis à jour
export function supprimerPhoto(token) {
  return requete('/users/me/avatar', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

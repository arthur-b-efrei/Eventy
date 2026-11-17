import { requete } from './client.js'

// Une page d'événements (route GET /api/events)
// Les filtres sont ajoutés à l'adresse : /events?page=2&recherche=jazz&genre=Musique
// Avec "position" { lat, lng, rayon (mètres) } : seulement les events autour, du plus proche au plus loin,
// chacun avec "distance" en mètres. La position n'est pas enregistrée par le serveur.
// -> renvoie { items, page, pages, total }
export function listerEvents({ page = 1, recherche = '', genre = '', position = null } = {}) {
  const params = new URLSearchParams({ page })
  if (recherche) params.set('recherche', recherche)
  if (genre) params.set('genre', genre)
  if (position) {
    params.set('lat', String(position.lat))
    params.set('lng', String(position.lng))
    params.set('rayon', String(position.rayon))
  }
  return requete(`/events?${params}`)
}

// "à 650 m", "à 1,2 km", "à 14 km"
export function formaterDistance(metres) {
  if (metres < 1000) return `à ${Math.max(10, Math.round(metres / 10) * 10)} m`
  if (metres < 10000) return `à ${(metres / 1000).toFixed(1).replace('.', ',')} km`
  return `à ${Math.round(metres / 1000)} km`
}

// S'inscrire à un événement (route POST /api/events/:id/inscription)
// Le token prouve au backend qui est connecté -> renvoie l'événement mis à jour
export const inscrireEvent = (token, eventId) =>
  requete(`/events/${eventId}/inscription`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })

import { requete } from './client.js'

// Liste des événements (route GET /api/events).
// Avec une position { lat, lng, rayon (mètres) } : seulement ceux autour, du plus proche au plus loin,
// chacun avec "distance" en mètres. La position n'est pas enregistrée par le serveur.
export function listerEvents(position) {
  if (!position) return requete('/events')
  const parametres = new URLSearchParams({
    lat: String(position.lat),
    lng: String(position.lng),
    rayon: String(position.rayon),
  })
  return requete(`/events?${parametres}`)
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

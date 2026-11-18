import { requete } from './client.js'

// Une page d'événements (route GET /api/events)
// Les filtres sont ajoutés à l'adresse : /events?page=2&recherche=jazz&genre=Musique
// -> renvoie { items, page, pages, total }
export function listerEvents({ page = 1, recherche = '', genre = '' } = {}) {
  const params = new URLSearchParams({ page })
  if (recherche) params.set('recherche', recherche)
  if (genre) params.set('genre', genre)
  return requete(`/events?${params}`)
}

// S'inscrire à un événement (route POST /api/events/:id/inscription)
// Le token prouve au backend qui est connecté -> renvoie l'événement mis à jour
export const inscrireEvent = (token, eventId) =>
  requete(`/events/${eventId}/inscription`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })

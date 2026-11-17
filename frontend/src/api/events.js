import { requete } from './client.js'

// Liste de tous les événements (route GET /api/events)
export const listerEvents = () => requete('/events')

// S'inscrire à un événement (route POST /api/events/:id/inscription)
// Le token prouve au backend qui est connecté -> renvoie l'événement mis à jour
export const inscrireEvent = (token, eventId) =>
  requete(`/events/${eventId}/inscription`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })

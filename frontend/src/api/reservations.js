import { requete } from './client.js'

function avecToken(token, options = {}) {
  return {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  }
}

// Liste des réservations du user connecté
export function listerMesReservations(token) {
  return requete('/reservations', avecToken(token))
}

// Modifier le message de la réservation
export function modifierReservation(token, id, describe) {
  return requete(
    `/reservations/${id}`,
    avecToken(token, {
      method: 'PATCH',
      body: JSON.stringify({ describe }),
    }),
  )
}

// Annuler une réservation
export function annulerReservation(token, id) {
  return requete(
    `/reservations/${id}`,
    avecToken(token, { method: 'DELETE' }),
  )
}

// Inscrits d'un event (créateur uniquement)
export function listerInscrits(token, eventId) {
  return requete(`/events/${eventId}/inscrits`, avecToken(token))
}

// Modifier un event (créateur) : date_event, describe, nb_max_user
export function modifierEvenement(token, eventId, champs) {
  return requete(
    `/events/${eventId}`,
    avecToken(token, {
      method: 'PATCH',
      body: JSON.stringify(champs),
    }),
  )
}

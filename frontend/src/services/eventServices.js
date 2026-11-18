import { requete } from '../api/client.js'

// Envoie un nouvel événement au backend (POST /api/events)
export async function createEvent(eventData) {
  const token = localStorage.getItem('eventy_token')

  try {
    return await requete('/events', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(eventData),
    })
  } catch (err) {
    if (err.status === 401) {
      err.message = 'Vous devez être connecté pour créer un événement.'
    }
    // createEvent.jsx lit err.errors pour les champs (ex. localisation)
    err.errors = err.donnees?.errors || {}
    throw err
  }
}

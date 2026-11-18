import { io } from 'socket.io-client'
import { API_URL, requete } from './client.js'

// Le WebSocket tourne sur le même serveur que l'API, mais sans le "/api" à la fin
const URL_SOCKET = new URL(API_URL).origin

// Historique de la discussion : { event, messages, encoreAvant }.
// "avant" = id du plus vieux message déjà affiché, pour charger les précédents.
export function chargerMessages(token, eventId, avant) {
  const parametre = avant ? `?avant=${encodeURIComponent(avant)}` : ''
  return requete(`/events/${eventId}/messages${parametre}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Ouvre la connexion temps réel. Le serveur vérifie le token avant d'accepter.
export function connecterSocket(token) {
  return io(URL_SOCKET, { auth: { token } })
}

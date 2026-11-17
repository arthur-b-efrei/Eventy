import { requete } from './client.js'

// Liste de tous les événements (route GET /api/events)
export const listerEvents = () => requete('/events')

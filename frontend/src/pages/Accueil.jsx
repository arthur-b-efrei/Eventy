import { useEffect, useState } from 'react'
import AppLayout from '../components/AppLayout.jsx'
import { useAuth } from '../context/AuthContext.js'
import { listerEvents } from '../api/events.js'
import EventCard from '../components/EventCard.jsx'
import { ERREUR } from '../components/ui.js'

// Page d'accueil : liste des événements
export default function Accueil() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [erreur, setErreur] = useState(null)

  // Au chargement de la page, on demande les événements au backend
  useEffect(() => {
    listerEvents()
      .then((donnees) => setEvents(donnees))
      .catch((err) => setErreur(err.message))
  }, [])

  // Clic sur "S'inscrire" d'une carte
  function inscrire(eventId) {
    // TODO : appeler la route backend d'inscription quand elle existera
    console.log('Inscription à', eventId)
  }

  return (
    <AppLayout>
      <h1 className="text-[clamp(30px,5vw,44px)] text-ardoise">
        Salut {user?.name}, <span className="text-outremer">on sort ce soir ?</span>
      </h1>
      <p className="mt-2 text-texte-doux">
        {events.length} événement{events.length > 1 ? 's' : ''} à venir
      </p>

      {erreur && <p className={`${ERREUR} mt-6`}>{erreur}</p>}

      {/* Grille : 1 colonne sur téléphone, 2 sur tablette, 3 sur ordinateur */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event, index) => (
          <EventCard key={event._id} event={event} index={index} onInscrire={inscrire} />
        ))}
      </div>
    </AppLayout>
  )
}

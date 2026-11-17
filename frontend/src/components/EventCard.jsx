import Bouton from './Bouton.jsx'

// Couleur de la fine bande en haut des cartes (couleurs de l'équipe, dans index.css)
const COULEURS = ['border-t-outremer', 'border-t-lampion', 'border-t-grenadine', 'border-t-menthe', 'border-t-lilas']

// Carte d'un événement (reçoit un event venant de la route /api/events)
// index : position de la carte dans la liste, pour choisir sa couleur
// onInscrire : fonction donnée par la page, appelée au clic sur le bouton
export default function EventCard({ event, index, onInscrire }) {
  const date = new Date(event.date_event)
  const jour = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const heure = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  const placesRestantes = event.nb_max_user - event.nb_user
  const complet = placesRestantes <= 0

  // % (modulo) : après la dernière couleur, on revient à la première
  const couleur = COULEURS[index % COULEURS.length]

  return (
    <article className={`flex flex-col rounded-2xl border border-t-4 border-bordure bg-white ${couleur}`}>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm font-semibold text-outremer first-letter:uppercase">
          {jour} · {heure}
        </p>

        <h2 className="mt-2 text-xl font-bold text-ardoise">{event.titre}</h2>
        <p className="mt-1 text-sm text-texte-doux">{event.localisation}</p>

        {event.describe && <p className="mt-3 text-[15px]">{event.describe}</p>}

        {/* Places + bouton, toujours en bas de la carte */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <p className={`text-sm ${complet ? 'font-semibold text-grenadine' : 'text-texte-doux'}`}>
            {complet ? 'Complet' : `${placesRestantes} place${placesRestantes > 1 ? 's' : ''} sur ${event.nb_max_user}`}
          </p>
          <Bouton
            variante={complet ? 'discret' : 'lampion'}
            disabled={complet}
            onClick={() => onInscrire(event._id)}
            className="min-h-10! px-5! text-sm!"
          >
            {complet ? 'Complet' : "S'inscrire"}
          </Bouton>
        </div>
      </div>
    </article>
  )
}

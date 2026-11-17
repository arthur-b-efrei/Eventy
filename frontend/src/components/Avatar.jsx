import { urlPhoto } from '../api/users.js'

// Photo de profil du user, ou son emoji sur un rond de couleur s'il n'a pas de photo.
// "apercu" permet d'afficher une image choisie mais pas encore envoyée.
// La taille et la couleur dépendent du user : elles restent en "style" (valeurs calculées).
export default function Avatar({ user, taille = 40, apercu, className = '' }) {
  const photo = apercu || urlPhoto(user)
  const emoji = user?.avatar?.emoji || '🙂'
  const couleur = user?.avatar?.couleur || '#3A3DFF'

  return (
    <span
      className={`inline-grid shrink-0 place-items-center overflow-hidden rounded-full leading-none select-none ${className}`}
      style={{ width: taille, height: taille, fontSize: taille * 0.52, background: photo ? '#E7E8EF' : couleur }}
      role="img"
      aria-label={user?.name ? `Avatar de ${user.name}` : 'Avatar'}
    >
      {photo ? <img src={photo} alt="" className="block size-full object-cover" /> : <span aria-hidden="true">{emoji}</span>}
    </span>
  )
}

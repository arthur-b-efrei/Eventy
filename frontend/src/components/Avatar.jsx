import { urlPhoto } from '../api/users.js'
import './Avatar.css'

// Photo de profil du user, ou son emoji sur un rond de couleur s'il n'a pas de photo.
// "apercu" permet d'afficher une image choisie mais pas encore envoyée.
export default function Avatar({ user, taille = 40, apercu, className = '' }) {
  const photo = apercu || urlPhoto(user)
  const emoji = user?.avatar?.emoji || '🙂'
  const couleur = user?.avatar?.couleur || '#3A3DFF'

  return (
    <span
      className={`avatar ${className}`}
      style={{ width: taille, height: taille, fontSize: taille * 0.52, background: photo ? '#E7E8EF' : couleur }}
      role="img"
      aria-label={user?.name ? `Avatar de ${user.name}` : 'Avatar'}
    >
      {photo ? <img src={photo} alt="" /> : <span aria-hidden="true">{emoji}</span>}
    </span>
  )
}

// Adresse de l'API (modifiable dans frontend/.env avec VITE_API_URL)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Nom de l'événement envoyé quand le serveur refuse le token
export const EVENEMENT_SESSION_EXPIREE = 'eventy:session-expiree'

// Envoie une requête à l'API et renvoie le JSON, ou lance une erreur lisible.
// L'erreur garde le code HTTP (err.status) et les infos renvoyées par l'API (err.donnees).
export async function requete(chemin, options = {}) {
  let reponse
  try {
    reponse = await fetch(`${API_URL}${chemin}`, {
      ...options,
      // Les en-têtes passés en option s'ajoutent au Content-Type (au lieu de le remplacer)
      headers: { 'Content-Type': 'application/json', ...options.headers },
    })
  } catch {
    throw new Error("Impossible de joindre le serveur. Vérifie que le backend est lancé.")
  }

  const donnees = await reponse.json().catch(() => ({}))

  // Requête faite avec un token, mais le serveur le refuse (expiré, mot de passe changé…) :
  // on prévient toute l'appli, qui déconnecte le user et l'envoie vers la connexion.
  if (reponse.status === 401 && options.headers?.Authorization) {
    window.dispatchEvent(new Event(EVENEMENT_SESSION_EXPIREE))
  }

  if (!reponse.ok) {
    const erreur = new Error(donnees.message || 'Une erreur est survenue, réessaie.')
    erreur.status = reponse.status
    erreur.donnees = donnees
    throw erreur
  }
  return donnees
}

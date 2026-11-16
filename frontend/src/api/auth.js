// Adresse de l'API (modifiable dans frontend/.env avec VITE_API_URL)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Envoie une requête à l'API et renvoie le JSON, ou lance une erreur lisible
async function requete(chemin, options = {}) {
  let reponse
  try {
    reponse = await fetch(`${API_URL}${chemin}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })
  } catch {
    throw new Error("Impossible de joindre le serveur. Vérifie que le backend est lancé.")
  }

  const donnees = await reponse.json().catch(() => ({}))
  if (!reponse.ok) {
    throw new Error(donnees.message || 'Une erreur est survenue, réessaie.')
  }
  return donnees
}

// Inscription : { name, email, password, date_naissance } -> { token, user }
export function inscrire(infos) {
  return requete('/auth/register', { method: 'POST', body: JSON.stringify(infos) })
}

// Connexion : { email, password } -> { token, user }
export function connecter(identifiants) {
  return requete('/auth/login', { method: 'POST', body: JSON.stringify(identifiants) })
}

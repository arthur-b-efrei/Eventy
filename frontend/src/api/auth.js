// Adresse de l'API (modifiable dans frontend/.env avec VITE_API_URL)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Envoie une requête à l'API et renvoie le JSON, ou lance une erreur lisible.
// L'erreur garde le code HTTP (err.status) et les infos renvoyées par l'API (err.donnees).
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
    const erreur = new Error(donnees.message || 'Une erreur est survenue, réessaie.')
    erreur.status = reponse.status
    erreur.donnees = donnees
    throw erreur
  }
  return donnees
}

function post(chemin, corps) {
  return requete(chemin, { method: 'POST', body: JSON.stringify(corps) })
}

// Inscription : { name, email, password, date_naissance } -> { message, email } (un code est envoyé)
export const inscrire = (infos) => post('/auth/register', infos)

// Vérification : { email, code } -> { token, user }
export const verifierEmail = (infos) => post('/auth/verify-email', infos)

// Renvoyer un code : { email } -> { message, delai }
export const renvoyerCode = (infos) => post('/auth/resend-code', infos)

// Connexion : { email, password } -> { token, user }
// Si l'email n'est pas vérifié : erreur 403 avec err.donnees.code === 'EMAIL_NON_VERIFIE'
export const connecter = (identifiants) => post('/auth/login', identifiants)

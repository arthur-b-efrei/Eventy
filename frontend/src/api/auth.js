import { requete } from './client.js'

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

// Mot de passe oublié : { email } -> { message, delai } (un code part par email)
export const demanderNouveauMotDePasse = (infos) => post('/auth/forgot-password', infos)

// Nouveau mot de passe : { email, code, password } -> { token, user }
export const changerMotDePasse = (infos) => post('/auth/reset-password', infos)

// Infos à jour du user connecté (sert aussi à vérifier que le token est encore valable)
export const moi = (token) => requete('/auth/me', { headers: { Authorization: `Bearer ${token}` } })

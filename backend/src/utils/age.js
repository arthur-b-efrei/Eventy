export const AGE_MINIMUM = 18;
const AGE_MAXIMUM = 120;

// Calcule l'âge exact à partir d'une date "AAAA-MM-JJ" (anniversaire pas encore passé = un an de moins)
export function calculerAge(dateNaissance, aujourdhui = new Date()) {
  const d = new Date(dateNaissance);
  let age = aujourdhui.getUTCFullYear() - d.getUTCFullYear();
  const mois = aujourdhui.getUTCMonth() - d.getUTCMonth();
  if (mois < 0 || (mois === 0 && aujourdhui.getUTCDate() < d.getUTCDate())) {
    age--;
  }
  return age;
}

// Renvoie un message d'erreur si la date de naissance n'est pas acceptable, sinon null
export function erreurDateNaissance(dateNaissance) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(String(dateNaissance)) || Number.isNaN(new Date(dateNaissance).getTime())) {
    return "Date de naissance invalide";
  }
  const age = calculerAge(dateNaissance);
  if (age < 0) return "La date de naissance ne peut pas être dans le futur";
  if (age < AGE_MINIMUM) return `Eventy est réservé aux personnes majeures (${AGE_MINIMUM} ans et plus)`;
  if (age > AGE_MAXIMUM) return "Date de naissance invalide";
  return null;
}

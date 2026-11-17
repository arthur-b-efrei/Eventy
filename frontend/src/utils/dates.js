export const AGE_MINIMUM = 18

// Date au format AAAA-MM-JJ, "il y a X ans" jour pour jour
function ilYA(annees) {
  const d = new Date()
  d.setFullYear(d.getFullYear() - annees)
  const mois = String(d.getMonth() + 1).padStart(2, '0')
  const jour = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mois}-${jour}`
}

// Limites du champ "date de naissance" : avoir 18 ans aujourd'hui, et pas plus de 120 ans
export const DATE_NAISSANCE_MAX = ilYA(AGE_MINIMUM)
export const DATE_NAISSANCE_MIN = ilYA(120)

// Message d'erreur si la date de naissance n'est pas acceptable, sinon chaîne vide
// (les dates "AAAA-MM-JJ" se comparent directement comme du texte)
export function erreurDateNaissance(date) {
  if (date > DATE_NAISSANCE_MAX) return `Eventy est réservé aux personnes majeures (${AGE_MINIMUM} ans et plus).`
  if (date < DATE_NAISSANCE_MIN) return 'Vérifie ta date de naissance.'
  return ''
}

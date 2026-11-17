// Suggestions d'adresses pendant la saisie, avec l'API Adresse de l'État (Géoplateforme IGN).
// Gratuit, sans clé, appelable directement depuis le navigateur. Voir docs/geolocalisation.md
const URL_RECHERCHE = 'https://data.geopf.fr/geocodage/search'

// type : 'adresse' (rue, numéro…) ou 'ville' (communes seulement, pour "Ta ville")
// Renvoie [{ label, contexte, lat, lng }] — au plus 5 suggestions.
export async function suggererAdresses(texte, { type = 'adresse', signal } = {}) {
  const q = texte.trim()
  if (q.length < 3) return [] // l'API refuse les textes trop courts

  const parametres = new URLSearchParams({ q, limit: '5', autocomplete: '1' })
  if (type === 'ville') parametres.set('type', 'municipality')

  const reponse = await fetch(`${URL_RECHERCHE}?${parametres}`, { signal })
  if (!reponse.ok) throw new Error('Suggestions indisponibles')
  const donnees = await reponse.json()

  return (donnees.features || []).map((f) => {
    // GeoJSON : longitude d'abord, puis latitude
    const [lng, lat] = f.geometry.coordinates
    return { label: f.properties.label, contexte: f.properties.context, lat, lng }
  })
}

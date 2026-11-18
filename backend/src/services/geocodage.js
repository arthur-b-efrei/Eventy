// Géocodage : adresse en texte -> coordonnées, avec l'API Adresse de l'État (Géoplateforme IGN).
// Gratuit, sans clé, France uniquement. Doc : https://geoservices.ign.fr/documentation/services/services-geoplateforme/geocodage
// Voir aussi docs/geolocalisation.md

const URL_RECHERCHE = "https://data.geopf.fr/geocodage/search";

// En dessous de ce score (0 à 1), l'API a "deviné" : on préfère refuser l'adresse
const SCORE_MINIMUM = 0.5;

// Erreur quand l'API ne répond pas (à distinguer d'une adresse introuvable)
export class GeocodageIndisponible extends Error {}

// Renvoie { label, coordinates: [longitude, latitude] }, ou null si l'adresse est introuvable.
// Attention : comme en GeoJSON et dans MongoDB, la LONGITUDE vient en premier.
export async function geocoderAdresse(adresse) {
  const texte = typeof adresse === "string" ? adresse.trim() : "";
  // L'API refuse les textes de moins de 3 caractères
  if (texte.length < 3) return null;

  const url = `${URL_RECHERCHE}?q=${encodeURIComponent(texte.slice(0, 200))}&limit=1`;

  let donnees;
  try {
    const reponse = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
    donnees = await reponse.json();
  } catch (error) {
    throw new GeocodageIndisponible(`Service d'adresses injoignable (${error.message})`);
  }

  const resultat = donnees.features?.[0];
  if (!resultat || resultat.properties?.score < SCORE_MINIMUM) return null;

  const [longitude, latitude] = resultat.geometry.coordinates;
  return {
    label: resultat.properties.label,
    coordinates: [longitude, latitude],
  };
}

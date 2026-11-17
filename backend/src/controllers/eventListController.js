import Event from "../models/Event.js";

const RAYON_DEFAUT = 10000; // 10 km
const RAYON_MAX = 100000; // 100 km

// Lit un nombre dans l'adresse (?lat=48.86), ou NaN s'il est absent ou invalide
function nombre(valeur) {
  return typeof valeur === "string" && valeur.trim() !== "" ? Number(valeur) : NaN;
}

// GET /api/events : liste des événements (pour la homepage)
// GET /api/events?lat=48.86&lng=2.37&rayon=5000 : seulement ceux à moins de "rayon" mètres,
//   du plus proche au plus loin, avec "distance" (en mètres) sur chaque event.
// La position de l'utilisateur sert uniquement à cette recherche : elle n'est jamais enregistrée.
export async function listEvents(req, res) {
  try {
    const { lat, lng, rayon } = req.query;

    // Sans position : tous les événements, comme avant
    if (lat === undefined && lng === undefined) {
      const events = await Event.find();
      return res.json(events);
    }

    const latitude = nombre(lat);
    const longitude = nombre(lng);
    if (!(Math.abs(latitude) <= 90) || !(Math.abs(longitude) <= 180)) {
      return res.status(400).json({ message: "Position invalide : lat et lng sont obligatoires ensemble." });
    }

    let distanceMax = RAYON_DEFAUT;
    if (rayon !== undefined) {
      distanceMax = nombre(rayon);
      if (!(distanceMax > 0 && distanceMax <= RAYON_MAX)) {
        return res.status(400).json({ message: `Le rayon doit être compris entre 1 et ${RAYON_MAX} mètres.` });
      }
    }

    // $geoNear utilise l'index 2dsphere de Event.position, trie par distance et calcule la distance.
    // Les events sans position (anciens, non géocodés) sont ignorés.
    const events = await Event.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] }, // longitude d'abord !
          key: "position",
          distanceField: "distance",
          maxDistance: distanceMax,
          spherical: true,
        },
      },
      { $set: { distance: { $round: ["$distance", 0] } } },
    ]);

    res.json(events);
  } catch (error) {
    console.error("listEvents :", error.message);
    res.status(500).json({ message: "Impossible de charger les événements." });
  }
}

import Event from "../models/Event.js";

// Nombre d'événements par page (si le front ne précise pas "limite")
const PAR_PAGE = 6;

// Recherche "autour de moi"
const RAYON_DEFAUT = 10000; // 10 km
const RAYON_MAX = 100000; // 100 km

// Transforme le texte cherché en expression régulière qui ignore les accents :
// "soiree" doit trouver "Soirée". Chaque lettre devient "cette lettre ou ses versions accentuées".
const ACCENTS = {
  a: "[aàâä]",
  c: "[cç]",
  e: "[eéèêë]",
  i: "[iîï]",
  o: "[oôö]",
  u: "[uùûü]",
};
function regexSansAccents(texte) {
  const sansAccents = texte.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  // On protège les caractères spéciaux des regex (., *, ?, etc.)
  const protege = sansAccents.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const motif = [...protege].map((lettre) => ACCENTS[lettre] || lettre).join("");
  return new RegExp(motif, "i"); // "i" = majuscules ou minuscules, pareil
}

// Lit un nombre dans l'adresse (?lat=48.86), ou NaN s'il est absent ou invalide
function nombre(valeur) {
  return typeof valeur === "string" && valeur.trim() !== "" ? Number(valeur) : NaN;
}

// Renvoie une page d'événements (pour la homepage)
// Paramètres possibles dans l'adresse : ?page=2&limite=6&recherche=jazz&genre=Musique
// + "autour de moi" : &lat=48.86&lng=2.37&rayon=5000 -> seulement les events à moins de "rayon" mètres,
//   du plus proche au plus loin, avec "distance" (en mètres) sur chaque event.
//   La position de l'utilisateur sert uniquement à cette recherche : elle n'est jamais enregistrée.
export async function listEvents(req, res) {
  try {
    // 1. Lire les paramètres (avec des valeurs par défaut si absents ou invalides)
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limite = Math.min(50, Math.max(1, parseInt(req.query.limite) || PAR_PAGE));
    const recherche = (req.query.recherche || "").trim();
    const genre = (req.query.genre || "").trim();

    // 2. Construire le filtre MongoDB
    const filtre = {};
    if (genre) {
      filtre.genre = genre;
    }
    if (recherche) {
      const regex = regexSansAccents(recherche);
      // $or : le texte doit être dans le titre OU la description OU le lieu
      filtre.$or = [{ titre: regex }, { describe: regex }, { localisation: regex }];
    }

    // 3a. Sans position : tri par date
    const { lat, lng, rayon } = req.query;
    if (lat === undefined && lng === undefined) {
      // Compter le total (pour savoir combien de pages il y a)
      const total = await Event.countDocuments(filtre);
      const pages = Math.max(1, Math.ceil(total / limite));

      // Récupérer seulement les événements de la page demandée
      const items = await Event.find(filtre)
        .sort({ date_event: 1, _id: 1 }) // du plus proche au plus lointain (ordre toujours le même)
        .skip((page - 1) * limite) // sauter les pages d'avant
        .limit(limite); // ne garder qu'une page

      return res.json({ items, page, pages, total });
    }

    // 3b. Avec position : tri par distance
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

    // $geoNear utilise l'index 2dsphere de Event.position, applique le même filtre (genre, recherche),
    // trie par distance et calcule la distance. Les events sans position (non géocodés) sont ignorés.
    // $facet : la page demandée et le total en une seule requête.
    const [resultat] = await Event.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] }, // longitude d'abord !
          key: "position",
          distanceField: "distance",
          maxDistance: distanceMax,
          spherical: true,
          query: filtre,
        },
      },
      { $set: { distance: { $round: ["$distance", 0] } } },
      {
        $facet: {
          items: [{ $skip: (page - 1) * limite }, { $limit: limite }],
          compte: [{ $count: "total" }],
        },
      },
    ]);

    const total = resultat.compte[0]?.total || 0;
    const pages = Math.max(1, Math.ceil(total / limite));
    res.json({ items: resultat.items, page, pages, total });
  } catch (error) {
    console.error("listEvents :", error.message);
    res.status(500).json({ message: "Impossible de charger les événements." });
  }
}

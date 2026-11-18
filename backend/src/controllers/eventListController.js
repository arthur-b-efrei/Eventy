import Event from "../models/Event.js";

// Nombre d'événements par page (si le front ne précise pas "limite")
const PAR_PAGE = 6;

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

// Renvoie une page d'événements (pour la homepage)
// Paramètres possibles dans l'adresse : ?page=2&limite=6&recherche=jazz&genre=Musique
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

    // 3. Compter le total (pour savoir combien de pages il y a)
    const total = await Event.countDocuments(filtre);
    const pages = Math.max(1, Math.ceil(total / limite));

    // 4. Récupérer seulement les événements de la page demandée
    const items = await Event.find(filtre)
      .sort({ date_event: 1, _id: 1 }) // du plus proche au plus lointain (ordre toujours le même)
      .skip((page - 1) * limite) // sauter les pages d'avant
      .limit(limite); // ne garder qu'une page

    res.json({ items, page, pages, total });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}

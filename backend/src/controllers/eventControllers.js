
import Event from "../models/Event.js";

const GENRES = [
  "Autre",
  "Musique",
  "Karaoké",
  "Sport",
  "Cinéma",
  "Conférence",
  "Jeux",
  "Gastronomie",
];

// Vérifie les données reçues du frontend
function validateEventData({
  titre,
  describe,
  nb_max_user,
  localisation,
  date_event,
  genre,
  image,
}) {
  const errors = {};

  // Titre obligatoire
  if (typeof titre !== "string" || !titre.trim()) {
    errors.titre = "Le titre est obligatoire.";
  }

  // Description obligatoire
  if (typeof describe !== "string" || !describe.trim()) {
    errors.describe = "La description est obligatoire.";
  }

  // Localisation obligatoire
  if (
    typeof localisation !== "string" ||
    !localisation.trim()
  ) {
    errors.localisation = "La localisation est obligatoire.";
  }

  // Nombre de participants obligatoire
  const max = Number(nb_max_user);

  if (
    (typeof nb_max_user !== "number" &&
      typeof nb_max_user !== "string") ||
    nb_max_user === "" ||
    !Number.isInteger(max) ||
    max <= 0
  ) {
    errors.nb_max_user =
      "Le nombre maximum de participants doit être un entier supérieur à 0.";
  }

  // Date obligatoire et dans le futur
  const date = new Date(date_event);

  if (!date_event) {
    errors.date_event =
      "La date de l'événement est obligatoire.";
  } else if (Number.isNaN(date.getTime())) {
    errors.date_event = "La date est invalide.";
  } else if (date <= new Date()) {
    errors.date_event =
      "La date de l'événement doit être dans le futur.";
  }

  // Genre obligatoire
  if (
    typeof genre !== "string" ||
    !GENRES.includes(genre) ||
    genre === "Autre"
  ) {
    errors.genre =
      "Veuillez sélectionner un genre valide.";
  }

  // Image FACULTATIVE
  // Vérifier l'URL uniquement si une image est fournie
  if (image !== undefined && image !== null) {
    if (typeof image !== "string") {
      errors.image = "L'image doit être une URL valide.";
    } else if (image.trim()) {
      try {
        const url = new URL(image.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
          errors.image =
            "L'image doit utiliser une URL HTTP ou HTTPS.";
        }
      } catch {
        errors.image = "L'URL de l'image est invalide.";
      }
    }
  }

  return errors;
}

// POST /api/events
export async function createEvent(req, res) {
  try {
    const errors = validateEventData(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Données invalides.",
        errors,
      });
    }

    const {
      titre,
      describe,
      nb_max_user,
      localisation,
      date_event,
      genre,
      image,
    } = req.body;

    // Création de l'événement
    const event = await Event.create({
      titre: titre.trim(),
      describe: describe.trim(),
      nb_max_user: Number(nb_max_user),
      localisation: localisation.trim(),
      date_event: new Date(date_event),

      // Genre obligatoire
      genre,

      // Image facultative
      image: typeof image === "string"
        ? image.trim()
        : "",

      // Données définies par le serveur
      nb_user: 0,
      id_creator: req.user.id,
    });

    return res.status(201).json(event);
  } catch (error) {
    console.error(
      "Erreur création événement :",
      error.message
    );

    return res.status(500).json({
      message: "Erreur serveur.",
    });
  }
}

// GET /api/events
export async function getEvents(req, res) {
  try {
    const events = await Event.find().sort({
      date_event: 1,
    });

    return res.status(200).json(events);
  } catch (error) {
    console.error("getEvents :", error.message);

    return res.status(500).json({
      message: "Impossible de récupérer les événements.",
    });
  }
}

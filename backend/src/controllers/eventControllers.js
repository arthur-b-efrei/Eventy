import Event from "../models/Event.js";

// Vérifie les données reçues. Retourne un objet d'erreurs (vide si tout est OK).
// On refait la validation ici : celle du front peut être contournée.
function validateEventData({ titre, describe, nb_max_user, localisation, date_event }) {
  const errors = {};

  if (typeof titre !== "string" || !titre.trim()) {
    errors.titre = "Le titre est obligatoire.";
  }
  if (typeof describe !== "string" || !describe.trim()) {
    errors.describe = "La description est obligatoire.";
  }
  if (typeof localisation !== "string" || !localisation.trim()) {
    errors.localisation = "La localisation est obligatoire.";
  }

  const max = Number(nb_max_user);
  if (
    (typeof nb_max_user !== "number" && typeof nb_max_user !== "string") ||
    nb_max_user === "" ||
    !Number.isInteger(max) ||
    max <= 0
  ) {
    errors.nb_max_user = "Le nombre maximum de participants doit être un entier supérieur à 0.";
  }

  const date = new Date(date_event);
  if (!date_event) {
    errors.date_event = "La date de l'événement est obligatoire.";
  } else if (Number.isNaN(date.getTime())) {
    errors.date_event = "La date est invalide.";
  } else if (date <= new Date()) {
    errors.date_event = "La date de l'événement doit être dans le futur.";
  }

  return errors;
}

// POST /api/events
export async function createEvent(req, res) {
  try {
    const errors = validateEventData(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Données invalides.", errors });
    }

    const { titre, describe, nb_max_user, localisation, date_event } = req.body;

    // On choisit nous-mêmes nb_user et id_creator : on ignore ce que le front pourrait envoyer.
    const event = await Event.create({
      titre: titre.trim(),
      describe: describe.trim(),
      nb_max_user: Number(nb_max_user),
      localisation: localisation.trim(),
      date_event: new Date(date_event),
      nb_user: 0,
      id_creator: req.user.id, // fourni par le middleware JWT
    });

    return res.status(201).json(event);
  } catch (error) {
    console.error("Erreur création événement :", error.message);
    return res.status(500).json({ message: "Erreur serveur." });
  }
}
// Valide les champs du formulaire "Créer un événement".
// Retourne un objet d'erreurs : vide si tout est valide.
export function validateEvent({
  titre,
  describe,
  nb_max_user,
  localisation,
  date_event,
}) {
  const errors = {};

  if (!titre || !titre.trim()) {
    errors.titre = "Le titre est obligatoire.";
  }

  if (!describe || !describe.trim()) {
    errors.describe = "La description est obligatoire.";
  }

  if (!localisation || !localisation.trim()) {
    errors.localisation = "La localisation est obligatoire.";
  }

  const max = Number(nb_max_user);
  if (nb_max_user === "" || nb_max_user === null || nb_max_user === undefined) {
    errors.nb_max_user = "Le nombre maximum de participants est obligatoire.";
  } else if (!Number.isInteger(max) || max <= 0) {
    errors.nb_max_user = "Le nombre de participants doit être un entier supérieur à 0.";
  }

  if (!date_event) {
    errors.date_event = "La date de l'événement est obligatoire.";
  } else if (Number.isNaN(new Date(date_event).getTime())) {
    errors.date_event = "La date est invalide.";
  } else if (new Date(date_event) <= new Date()) {
    errors.date_event = "La date de l'événement doit être dans le futur.";
  }

  return errors;
}
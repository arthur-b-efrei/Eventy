
import { useState } from "react";
import { validateEvent } from "../utils/validateEvent";
import { createEvent } from "../services/eventServices";
import AppLayout from "../components/AppLayout.jsx";
import "./createEvent.css";

const emptyForm = {
  titre: "",
  describe: "",
  nb_max_user: "",
  localisation: "",
  date_event: "",
  genre: "",
  image: "",
};

const genres = [
  "Autre",
  "Musique",
  "Karaoké",
  "Sport",
  "Cinéma",
  "Conférence",
  "Jeux",
  "Gastronomie",
];

function CreateEvent() {
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));

    if (name === "image") {
      setImageError(false);
    }

    setSuccess("");
    setServerError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    setSuccess("");

    // Validation existante + nouveaux champs obligatoires
    const validationErrors = {
      ...validateEvent(form),
    };

    if (!form.genre) {
      validationErrors.genre = "Veuillez sélectionner un genre.";
    }

    if (!form.image.trim()) {
      validationErrors.image = "L'image est obligatoire.";
    } else {
      try {
        const url = new URL(form.image.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
          validationErrors.image =
            "Veuillez saisir une URL HTTP ou HTTPS.";
        }
      } catch {
        validationErrors.image =
          "Veuillez saisir une URL d'image valide.";
      }
    }

    if (imageError) {
      validationErrors.image =
        "Impossible de charger cette image. Vérifie son URL.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const created = await createEvent({
        titre: form.titre.trim(),
        describe: form.describe.trim(),
        nb_max_user: Number(form.nb_max_user),
        localisation: form.localisation.trim(),
        date_event: form.date_event,
        genre: form.genre,
        image: form.image.trim(),
      });

      setSuccess(
        `L'événement « ${created.titre} » a bien été créé !`
      );

      setForm({ ...emptyForm });
      setErrors({});
      setImageError(false);
    } catch (err) {
      setServerError(
        err.message || "Erreur lors de la création."
      );

      if (err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <main className="ce-page">
        <form
          className="ce-card"
          onSubmit={handleSubmit}
          noValidate
        >
          <h1 className="ce-title">
            Créer un événement
          </h1>

          <p className="ce-subtitle">
            Remplis les informations ci-dessous.
            Tous les champs sont obligatoires.
          </p>

          {success && (
            <div
              className="ce-alert ce-alert--success"
              role="status"
            >
              {success}
            </div>
          )}

          {serverError && (
            <div
              className="ce-alert ce-alert--error"
              role="alert"
            >
              {serverError}
            </div>
          )}

          {/* TITRE */}
          <div className="ce-field">
            <label htmlFor="titre">
              Titre *
            </label>

            <input
              id="titre"
              name="titre"
              type="text"
              required
              value={form.titre}
              onChange={handleChange}
              placeholder="Soirée jeux de société"
              className={errors.titre ? "ce-invalid" : ""}
            />

            {errors.titre && (
              <span className="ce-error">
                {errors.titre}
              </span>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="ce-field">
            <label htmlFor="describe">
              Description *
            </label>

            <textarea
              id="describe"
              name="describe"
              rows="4"
              required
              value={form.describe}
              onChange={handleChange}
              placeholder="De quoi s'agit-il ?"
              className={errors.describe ? "ce-invalid" : ""}
            />

            {errors.describe && (
              <span className="ce-error">
                {errors.describe}
              </span>
            )}
          </div>

          {/* GENRE */}
          <div className="ce-field">
            <label htmlFor="genre">
              Genre de l'événement *
            </label>

            <select
              id="genre"
              name="genre"
              required
              value={form.genre}
              onChange={handleChange}
              className={
                errors.genre
                  ? "ce-select ce-invalid"
                  : "ce-select"
              }
            >
              <option value="" disabled>
                Sélectionner un genre
              </option>

              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>

            {errors.genre && (
              <span className="ce-error">
                {errors.genre}
              </span>
            )}

            <p className="ce-help">
              Choisis la catégorie qui correspond
              le mieux à ton événement.
            </p>
          </div>

          {/* IMAGE */}
          <div className="ce-field">
            <label htmlFor="image">
              Image de l'événement *
            </label>

            <input
              id="image"
              name="image"
              type="url"
              required
              value={form.image}
              onChange={handleChange}
              placeholder="https://exemple.com/image.jpg"
              className={errors.image ? "ce-invalid" : ""}
            />

            <p className="ce-help">
              Colle l'URL d'une image pour
              illustrer ton événement.
            </p>

            {errors.image && (
              <span className="ce-error">
                {errors.image}
              </span>
            )}

            {form.image.trim() && !imageError && (
              <div className="ce-image-preview">
                <img
                  src={form.image.trim()}
                  alt="Aperçu de l'événement"
                  onError={() => setImageError(true)}
                />
              </div>
            )}

            {imageError && (
              <p className="ce-error">
                Impossible d'afficher cette image.
                Vérifie son URL.
              </p>
            )}
          </div>

          {/* PARTICIPANTS ET LOCALISATION */}
          <div className="ce-row">
            <div className="ce-field">
              <label htmlFor="nb_max_user">
                Participants maximum *
              </label>

              <input
                id="nb_max_user"
                name="nb_max_user"
                type="number"
                min="1"
                step="1"
                required
                value={form.nb_max_user}
                onChange={handleChange}
                placeholder="30"
                className={
                  errors.nb_max_user ? "ce-invalid" : ""
                }
              />

              {errors.nb_max_user && (
                <span className="ce-error">
                  {errors.nb_max_user}
                </span>
              )}
            </div>

            <div className="ce-field">
              <label htmlFor="localisation">
                Localisation *
              </label>

              <input
                id="localisation"
                name="localisation"
                type="text"
                required
                value={form.localisation}
                onChange={handleChange}
                placeholder="Paris"
                className={
                  errors.localisation ? "ce-invalid" : ""
                }
              />

              {errors.localisation && (
                <span className="ce-error">
                  {errors.localisation}
                </span>
              )}
            </div>
          </div>

          {/* DATE */}
          <div className="ce-field">
            <label htmlFor="date_event">
              Date et heure *
            </label>

            <input
              id="date_event"
              name="date_event"
              type="datetime-local"
              required
              value={form.date_event}
              onChange={handleChange}
              className={
                errors.date_event ? "ce-invalid" : ""
              }
            />

            {errors.date_event && (
              <span className="ce-error">
                {errors.date_event}
              </span>
            )}
          </div>

          {/* BOUTON */}
          <button
            type="submit"
            className="ce-button"
            disabled={loading}
          >
            {loading
              ? "Création en cours..."
              : "Créer l'événement"}
          </button>
        </form>
      </main>
    </AppLayout>
  );
}

export default CreateEvent;


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
};

function CreateEvent() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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

    setSuccess("");
    setServerError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setServerError("");
    setSuccess("");

    const validationErrors = validateEvent(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const created = await createEvent({
        titre: form.titre.trim(),
        describe: form.describe.trim(),
        nb_max_user: Number(form.nb_max_user),
        localisation: form.localisation.trim(),
        date_event: form.date_event,
      });

      setSuccess(
        `L'événement « ${created.titre} » a bien été créé !`
      );

      setForm(emptyForm);
      setErrors({});
    } catch (err) {
      setServerError(err.message || "Erreur lors de la création.");
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

          <div className="ce-field">
            <label htmlFor="titre">Titre</label>
            <input
              id="titre"
              name="titre"
              type="text"
              value={form.titre}
              onChange={handleChange}
              placeholder="Soirée jeux de société"
              className={errors.titre ? "ce-invalid" : ""}
            />
            {errors.titre && (
              <span className="ce-error">{errors.titre}</span>
            )}
          </div>

          <div className="ce-field">
            <label htmlFor="describe">Description</label>
            <textarea
              id="describe"
              name="describe"
              rows="4"
              value={form.describe}
              onChange={handleChange}
              placeholder="De quoi s'agit-il ?"
              className={errors.describe ? "ce-invalid" : ""}
            />
            {errors.describe && (
              <span className="ce-error">{errors.describe}</span>
            )}
          </div>

          <div className="ce-row">
            <div className="ce-field">
              <label htmlFor="nb_max_user">
                Participants maximum
              </label>
              <input
                id="nb_max_user"
                name="nb_max_user"
                type="number"
                min="1"
                step="1"
                value={form.nb_max_user}
                onChange={handleChange}
                placeholder="30"
                className={errors.nb_max_user ? "ce-invalid" : ""}
              />
              {errors.nb_max_user && (
                <span className="ce-error">
                  {errors.nb_max_user}
                </span>
              )}
            </div>

            <div className="ce-field">
              <label htmlFor="localisation">
                Localisation
              </label>
              <input
                id="localisation"
                name="localisation"
                type="text"
                value={form.localisation}
                onChange={handleChange}
                placeholder="Paris"
                className={errors.localisation ? "ce-invalid" : ""}
              />
              {errors.localisation && (
                <span className="ce-error">
                  {errors.localisation}
                </span>
              )}
            </div>
          </div>

          <div className="ce-field">
            <label htmlFor="date_event">
              Date et heure
            </label>
            <input
              id="date_event"
              name="date_event"
              type="datetime-local"
              value={form.date_event}
              onChange={handleChange}
              className={errors.date_event ? "ce-invalid" : ""}
            />
            {errors.date_event && (
              <span className="ce-error">
                {errors.date_event}
              </span>
            )}
          </div>

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

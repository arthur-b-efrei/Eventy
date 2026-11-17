
import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import { useAuth } from "../context/AuthContext.js";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Accueil() {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function chargerEvenements() {
      try {
        const response = await fetch(`${API_URL}/api/events`);

        if (!response.ok) {
          throw new Error("Impossible de charger les événements.");
        }

        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    chargerEvenements();
  }, []);

  return (
    <AppLayout>
      <h1 className="text-[clamp(32px,5vw,52px)]">
        Salut {user?.name}, on sort ce soir ?
      </h1>

      <p className="mt-3 text-texte-doux">
        Découvre les événements proposés sur Eventy !
      </p>

      {loading && (
        <p className="mt-8">Chargement des événements...</p>
      )}

      {error && (
        <p className="mt-8 text-red-600">{error}</p>
      )}

      {!loading && !error && events.length === 0 && (
        <p className="mt-8">
          Aucun événement disponible pour le moment.
        </p>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event._id}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <h2 className="text-2xl font-semibold">
                {event.titre}
              </h2>

              <p className="mt-3 text-texte-doux">
                {event.describe}
              </p>

              <p className="mt-4">
                📍 {event.localisation}
              </p>

              <p className="mt-2">
                📅 {new Date(event.date_event).toLocaleString(
                  "fr-FR",
                  {
                    dateStyle: "long",
                    timeStyle: "short"
                  }
                )}
              </p>

              <p className="mt-2">
                👥 {event.nb_user ?? 0} / {event.nb_max_user} participants
              </p>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}


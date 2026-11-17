
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SearchX,
  WifiOff,
  RotateCw,
  CalendarPlus,
} from "lucide-react";

import AppLayout from "../components/AppLayout.jsx";
import EventCard, {
  EventCardSkeleton,
} from "../components/EventCard.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

import { useAuth } from "../context/AuthContext.js";
import { listerEvents } from "../api/events.js";
import {
  getEventVisual,
  normalizeText,
} from "../utils/eventVisual.js";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-100";

export default function Accueil() {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");

  // Charger les événements avec l'API de ton collègue
  useEffect(() => {
    let active = true;

    async function chargerEvenements() {
      try {
        const donnees = await listerEvents();

        if (active) {
          setEvents(Array.isArray(donnees) ? donnees : []);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            err.message ||
              "Impossible de charger les événements."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    chargerEvenements();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  // Réessayer le chargement
  function reessayer() {
    setLoading(true);
    setError("");
    setReloadKey((k) => k + 1);
  }

  // Fonction de réservation de ton collègue
  function inscrire(eventId) {
    // TODO : brancher l'API de réservation
    // lorsque la logique sera prête.
    console.log("Inscription à", eventId);
  }

  // Préparer les images, icônes et catégories
  const enriched = useMemo(
    () =>
      events.map((event) => ({
        event,
        visual: getEventVisual(event),
      })),
    [events]
  );

  // Recherche par titre, description et localisation
  const filtered = useMemo(() => {
    const q = normalizeText(query.trim());

    if (!q) return enriched;

    return enriched.filter(({ event }) =>
      normalizeText(
        `${event.titre || ""} ${
          event.describe || ""
        } ${event.localisation || ""}`
      ).includes(q)
    );
  }, [enriched, query]);

  return (
    <AppLayout>
      {/* EN-TÊTE */}
      <section className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
            Découvrir
          </p>

          <h1 className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Salut{user?.name ? ` ${user.name}` : ""},
            {" "}
            <span className="text-violet-600">
              on sort ce soir ?
            </span>
          </h1>

          <p className="mt-3 max-w-xl text-slate-500">
            Découvre les événements proposés sur Eventy
            et trouve ta prochaine sortie.
          </p>
        </div>
      </section>

      {/* BARRE DE RECHERCHE */}
      {!loading && !error && events.length > 0 && (
        <section
          className="mt-10"
          aria-label="Recherche d'événements"
        >
          <label className="relative block max-w-md">
            <span className="sr-only">
              Rechercher un événement
            </span>

            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />

            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par titre, lieu…"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </label>
        </section>
      )}

      {/* LISTE DES ÉVÉNEMENTS */}
      <div className="mt-8">
        {/* Chargement */}
        {loading && (
          <div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            aria-busy="true"
          >
            <span className="sr-only">
              Chargement des événements…
            </span>

            {Array.from({ length: 6 }, (_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Erreur */}
        {!loading && error && (
          <EmptyState
            icon={WifiOff}
            tone="error"
            title="Oups, un problème est survenu"
            description={error}
          >
            <button
              type="button"
              onClick={reessayer}
              className={secondaryButton}
            >
              <RotateCw
                className="h-4 w-4"
                aria-hidden="true"
              />
              Réessayer
            </button>
          </EmptyState>
        )}

        {/* Aucun événement */}
        {!loading && !error && events.length === 0 && (
          <EmptyState
            icon={CalendarPlus}
            title="Aucun événement pour le moment"
            description="Aucun événement n'a encore été publié sur Eventy."
          />
        )}

        {/* Événements disponibles */}
        {!loading && !error && events.length > 0 && (
          <>
            <p
              className="mb-4 text-sm text-slate-500"
              aria-live="polite"
            >
              {filtered.length} événement
              {filtered.length > 1 ? "s" : ""}
            </p>

            {filtered.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(({ event, visual }, index) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    visual={visual}
                    index={index}
                    onInscrire={inscrire}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={SearchX}
                title="Aucun résultat"
                description="Aucun événement ne correspond à ta recherche."
              >
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className={secondaryButton}
                >
                  Effacer la recherche
                </button>
              </EmptyState>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

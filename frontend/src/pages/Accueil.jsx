
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  SearchX,
  WifiOff,
  RotateCw,
  CalendarPlus,
  LocateFixed,
  MapPin,
  MapPinOff,
  X,
} from "lucide-react";

import AppLayout from "../components/AppLayout.jsx";
import EventCard, {
  EventCardSkeleton,
} from "../components/EventCard.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import Toast from "../components/Toast.jsx";
import Bouton from "../components/Bouton.jsx";
import ChampAdresse from "../components/ChampAdresse.jsx";
import { ERREUR } from "../components/ui.js";

import { useAuth } from "../context/AuthContext.js";
import { listerEvents, inscrireEvent } from "../api/events.js";
import { listerMesReservations } from "../api/reservations.js";
import {
  getEventVisual,
  normalizeText,
} from "../utils/eventVisual.js";

// Les genres possibles : même liste que dans le modèle Event.js (backend)
// et que la liste déroulante du formulaire de création
const GENRES = [
  "Musique",
  "Karaoké",
  "Sport",
  "Cinéma",
  "Conférence",
  "Jeux",
  "Gastronomie",
  "Autre",
];

// Rayons proposés pour la recherche "autour de moi" (en mètres)
const RAYONS = [2000, 5000, 10000, 25000];
const enKm = (metres) => `${metres / 1000} km`;

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 disabled:cursor-wait disabled:opacity-60";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-100";

export default function Accueil() {
  const { user, token } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");
  // Genre sélectionné dans le filtre ("" = Tous)
  const [genre, setGenre] = useState("");

  // Messages après un clic sur "S'inscrire"
  const [toast, setToast] = useState(""); // succès (petite notification en bas)
  const [erreurInscription, setErreurInscription] = useState(""); // échec
  const finToast = useCallback(() => setToast(""), []);

  // Recherche "autour de moi" : { lat, lng, label } ou null (= tous les événements)
  const [autour, setAutour] = useState(null);
  const [rayon, setRayon] = useState(10000);
  // Localisation : "" | "recherche" (en cours) | "ville" (on demande une ville à la place)
  const [geo, setGeo] = useState("");
  const [messageGeo, setMessageGeo] = useState("");
  const [ville, setVille] = useState("");

  // Ids des événements auxquels le user est déjà inscrit
  const [mesInscriptions, setMesInscriptions] = useState([]);
  // Id de l'événement dont l'inscription est en cours (pour bloquer le double clic)
  const [enCours, setEnCours] = useState(null);

  // Au chargement : on demande les réservations du user pour savoir où il est inscrit
  useEffect(() => {
    if (!token) return;
    listerMesReservations(token)
      .then((res) => {
        const ids = (res.items || []).map((r) => r.event?._id).filter(Boolean);
        setMesInscriptions(ids);
      })
      .catch(() => {
        // Pas grave : les boutons resteront sur "S'inscrire",
        // et le backend refusera quand même une 2e inscription
      });
  }, [token]);

  // Charger les événements avec l'API de ton collègue
  useEffect(() => {
    let active = true;

    async function chargerEvenements() {
      try {
        // La position est envoyée seulement pour cette recherche (jamais enregistrée)
        const donnees = await listerEvents(
          autour ? { lat: autour.lat, lng: autour.lng, rayon } : undefined
        );

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
  }, [reloadKey, autour, rayon]);

  // Change la recherche (position et/ou rayon) : la liste se recharge
  function rechercherAutour(nouvellePosition, nouveauRayon = rayon) {
    setLoading(true);
    setError("");
    setAutour(nouvellePosition);
    setRayon(nouveauRayon);
  }

  // Bouton "Autour de moi" : le navigateur demande l'autorisation à l'utilisateur
  function localiser() {
    setMessageGeo("");
    if (!navigator.geolocation) {
      setGeo("ville");
      setMessageGeo("Ton navigateur ne permet pas la localisation. Choisis plutôt une ville :");
      return;
    }
    setGeo("recherche");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo("");
        // Le navigateur donne latitude puis longitude
        rechercherAutour({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "ta position",
        });
      },
      (err) => {
        // Plan B : la ville
        setGeo("ville");
        setMessageGeo(
          err.code === err.PERMISSION_DENIED
            ? "Tu as refusé la localisation. Pas de souci, choisis plutôt une ville :"
            : "Impossible de te localiser pour le moment. Choisis plutôt une ville :"
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }

  function choisirVille(suggestion) {
    setGeo("");
    setVille("");
    rechercherAutour({ lat: suggestion.lat, lng: suggestion.lng, label: suggestion.label });
  }

  function voirTout() {
    setGeo("");
    setMessageGeo("");
    rechercherAutour(null);
  }

  // Réessayer le chargement
  function reessayer() {
    setLoading(true);
    setError("");
    setReloadKey((k) => k + 1);
  }

  // Clic sur "S'inscrire" d'une carte
  async function inscrire(eventId) {
    if (enCours) return; // une inscription est déjà en train de partir
    setErreurInscription("");
    setEnCours(eventId);
    try {
      // Le backend crée la réservation et renvoie l'événement mis à jour
      const eventMaj = await inscrireEvent(token, eventId);

      // On remplace l'ancien événement par le nouveau dans la liste
      // -> la carte affiche tout de suite le bon nombre de places
      setEvents((liste) =>
        // On garde "distance" (calculée par la recherche autour de moi)
        liste.map((e) => (e._id === eventMaj._id ? { ...e, ...eventMaj } : e))
      );
      // On note qu'on est inscrit -> le bouton passe à "Inscrit"
      setMesInscriptions((ids) => [...ids, eventMaj._id]);
      setToast(`Tu es inscrit à « ${eventMaj.titre} »`);
    } catch (err) {
      // Ex : "Tu es déjà inscrit à cet événement", "Cet événement est complet"
      setErreurInscription(err.message);
    } finally {
      setEnCours(null);
    }
  }

  // Bouton à afficher sur une carte à la place de "S'inscrire" (ou rien = bouton normal)
  function actionCarte(eventId) {
    if (mesInscriptions.includes(eventId)) {
      return (
        <Bouton variante="discret" disabled className="w-full">
          Inscrit ✓
        </Bouton>
      );
    }
    if (enCours === eventId) {
      return (
        <Bouton variante="lampion" disabled className="w-full">
          Inscription…
        </Bouton>
      );
    }
    return null;
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

  // Filtre par genre, puis recherche par titre, description et localisation
  const filtered = useMemo(() => {
    // 1. Genre : si un genre est choisi, on ne garde que les événements de ce genre
    const parGenre = genre
      ? enriched.filter(({ event }) => event.genre === genre)
      : enriched;

    // 2. Recherche texte, sur ce qui reste
    const q = normalizeText(query.trim());

    if (!q) return parGenre;

    return parGenre.filter(({ event }) =>
      normalizeText(
        `${event.titre || ""} ${
          event.describe || ""
        } ${event.localisation || ""}`
      ).includes(q)
    );
  }, [enriched, query, genre]);

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

      {/* AUTOUR DE MOI */}
      <section
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        aria-label="Événements autour de moi"
      >
        {autour ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm text-slate-700">
              <MapPin className="h-4 w-4 shrink-0 text-violet-600" aria-hidden="true" />
              <span>
                Autour de <strong className="text-slate-900">{autour.label}</strong>, à moins de
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {RAYONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => r !== rayon && rechercherAutour(autour, r)}
                  aria-pressed={rayon === r}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                    rayon === r
                      ? "border-violet-600 bg-violet-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700"
                  }`}
                >
                  {enKm(r)}
                </button>
              ))}
              <button
                type="button"
                onClick={voirTout}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Tous les événements
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">Des plans près de chez toi ?</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  Ta position sert seulement à trier les événements par distance : elle n'est jamais enregistrée.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={localiser}
                  disabled={geo === "recherche"}
                  className={primaryButton}
                >
                  <LocateFixed className="h-4 w-4" aria-hidden="true" />
                  {geo === "recherche" ? "Localisation…" : "Autour de moi"}
                </button>
                {geo !== "ville" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMessageGeo("");
                      setGeo("ville");
                    }}
                    className="px-2 py-3 text-sm font-semibold text-violet-700 underline-offset-4 hover:underline"
                  >
                    ou choisir une ville
                  </button>
                )}
              </div>
            </div>

            {/* Plan B : saisir une ville (si la localisation est refusée, ou au choix) */}
            {geo === "ville" && (
              <div className="mt-4 max-w-md">
                {messageGeo && (
                  <p className="mb-2 flex items-start gap-2 text-sm text-slate-600">
                    <MapPinOff className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    {messageGeo}
                  </p>
                )}
                <label htmlFor="ville" className="sr-only">
                  Ta ville
                </label>
                <ChampAdresse
                  id="ville"
                  type="ville"
                  value={ville}
                  onChange={setVille}
                  onChoisir={choisirVille}
                  placeholder="Ta ville (ex : Lyon)"
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                />
              </div>
            )}
          </>
        )}
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

          {/* FILTRE PAR GENRE : un bouton par genre, + "Tous" */}
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Filtrer par genre">
            {["", ...GENRES].map((g) => (
              <button
                key={g || "tous"}
                type="button"
                onClick={() => setGenre(g)}
                aria-pressed={genre === g}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                  genre === g
                    ? "border-violet-600 bg-violet-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700"
                }`}
              >
                {g || "Tous"}
              </button>
            ))}
          </div>
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

        {/* Aucun événement autour */}
        {!loading && !error && events.length === 0 && autour && (
          <EmptyState
            icon={MapPinOff}
            title={`Aucun événement à moins de ${enKm(rayon)}`}
            description="Élargis la zone de recherche, ou regarde tous les événements."
          >
            <div className="flex flex-wrap justify-center gap-2">
              {rayon < RAYONS[RAYONS.length - 1] && (
                <button
                  type="button"
                  onClick={() => rechercherAutour(autour, RAYONS.find((r) => r > rayon))}
                  className={secondaryButton}
                >
                  Chercher à {enKm(RAYONS.find((r) => r > rayon))}
                </button>
              )}
              <button type="button" onClick={voirTout} className={secondaryButton}>
                Tous les événements
              </button>
            </div>
          </EmptyState>
        )}

        {/* Aucun événement */}
        {!loading && !error && events.length === 0 && !autour && (
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

            {/* Erreur d'inscription (déjà inscrit, complet…) */}
            {erreurInscription && (
              <p className={`${ERREUR} mb-4`}>{erreurInscription}</p>
            )}

            {filtered.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(({ event, visual }, index) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    visual={visual}
                    index={index}
                    onInscrire={inscrire}
                    action={actionCarte(event._id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={SearchX}
                title="Aucun résultat"
                description="Aucun événement ne correspond à ta recherche ou au genre choisi."
              >
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setGenre("");
                  }}
                  className={secondaryButton}
                >
                  Effacer les filtres
                </button>
              </EmptyState>
            )}
          </>
        )}
      </div>

      {/* Notification de succès, disparaît toute seule */}
      <Toast message={toast} onFin={finToast} />
    </AppLayout>
  );
}

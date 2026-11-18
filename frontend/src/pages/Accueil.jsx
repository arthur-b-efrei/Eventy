
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import Toast from "../components/Toast.jsx";
import Bouton from "../components/Bouton.jsx";
import { ERREUR } from "../components/ui.js";

import { useAuth } from "../context/AuthContext.js";
import { listerEvents, inscrireEvent } from "../api/events.js";
import { listerMesReservations } from "../api/reservations.js";
import { getEventVisual } from "../utils/eventVisual.js";

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

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-100";

export default function Accueil() {
  const { user, token } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Page, recherche et genre sont rangés dans l'URL du navigateur :
  //   /?page=2&recherche=jazz&genre=Musique
  // -> on garde sa position après F5, on peut partager le lien,
  //    et le bouton "Retour" du navigateur revient à la page précédente.
  const [searchParams, setSearchParams] = useSearchParams();
  // L'URL ne contient que du texte : on le convertit en nombre (1 si absent ou invalide)
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const rechercheEnvoyee = searchParams.get("recherche") || "";
  const genre = searchParams.get("genre") || ""; // "" = Tous

  // Modifier l'URL. Une valeur vide (ou la page 1) est retirée pour garder une URL propre.
  // replace = true : remplace l'entrée de l'historique au lieu d'en ajouter une
  function majUrl(changements, replace = false) {
    const params = new URLSearchParams(searchParams);
    for (const [cle, valeur] of Object.entries(changements)) {
      if (!valeur || (cle === "page" && valeur === 1)) params.delete(cle);
      else params.set(cle, valeur);
    }
    setSearchParams(params, { replace });
  }

  // Texte tapé dans la barre de recherche (change à chaque lettre),
  // pré-rempli avec la recherche de l'URL
  const [query, setQuery] = useState(rechercheEnvoyee);
  // Si la recherche de l'URL change sans qu'on tape (bouton "Retour"),
  // on remet le bon texte dans la barre de recherche
  const [rechercheAffichee, setRechercheAffichee] = useState(rechercheEnvoyee);
  if (rechercheEnvoyee !== rechercheAffichee) {
    setRechercheAffichee(rechercheEnvoyee);
    setQuery(rechercheEnvoyee);
  }

  // Pagination : nombre de pages, renvoyé par le serveur
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Messages après un clic sur "S'inscrire"
  const [toast, setToast] = useState(""); // succès (petite notification en bas)
  const [erreurInscription, setErreurInscription] = useState(""); // échec
  const finToast = useCallback(() => setToast(""), []);

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

  // Recherche : on attend 400 ms après la dernière lettre tapée avant d'interroger le serveur
  // (sinon "jazz" enverrait 4 demandes : "j", "ja", "jaz", "jazz")
  useEffect(() => {
    const texte = query.trim();
    if (texte === rechercheEnvoyee) return;

    const minuteur = setTimeout(() => {
      // nouvelle recherche -> on repart de la page 1
      // (replace : pas une entrée d'historique par recherche tapée)
      majUrl({ recherche: texte, page: 1 }, true);
      setLoading(true);
    }, 400);

    // Si une autre lettre est tapée avant 400 ms, on annule ce minuteur
    return () => clearTimeout(minuteur);
  }, [query, rechercheEnvoyee]);

  // Charger une page d'événements depuis le serveur,
  // à chaque changement de page, de recherche ou de genre
  useEffect(() => {
    let active = true;

    async function chargerEvenements() {
      try {
        const donnees = await listerEvents({
          page,
          recherche: rechercheEnvoyee,
          genre,
        });

        if (active) {
          setEvents(donnees.items || []);
          setPages(donnees.pages || 1);
          setTotal(donnees.total || 0);
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
  }, [page, rechercheEnvoyee, genre, reloadKey]);

  // Réessayer le chargement
  function reessayer() {
    setLoading(true);
    setError("");
    setReloadKey((k) => k + 1);
  }

  // Clic sur un genre : nouveau filtre -> on repart de la page 1
  function choisirGenre(g) {
    if (g === genre) return;
    majUrl({ genre: g, page: 1 });
    setLoading(true);
  }

  // Clic sur une page (Précédent, numéro, Suivant)
  function allerPage(p) {
    if (p === page || p < 1 || p > pages) return;
    majUrl({ page: p });
    setLoading(true);
    window.scrollTo({ top: 0, behavior: "smooth" }); // remonter en haut de la liste
  }

  // Bouton "Effacer les filtres"
  function effacerFiltres() {
    setQuery("");
    setSearchParams({}); // URL vide = page 1, sans recherche ni genre
    setLoading(true);
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
        liste.map((e) => (e._id === eventMaj._id ? eventMaj : e))
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

  // La recherche et le genre sont maintenant filtrés par le serveur :
  // "events" contient déjà uniquement les événements de la page demandée.
  const filtresActifs = Boolean(rechercheEnvoyee || genre);

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

      {/* BARRE DE RECHERCHE (reste affichée pendant le chargement, pour ne pas perdre ce qu'on tape) */}
      {!error && (
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
                onClick={() => choisirGenre(g)}
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

        {/* Aucun événement du tout (pas de filtre actif) */}
        {!loading && !error && total === 0 && !filtresActifs && (
          <EmptyState
            icon={CalendarPlus}
            title="Aucun événement pour le moment"
            description="Aucun événement n'a encore été publié sur Eventy."
          />
        )}

        {/* Événements disponibles, ou aucun résultat pour les filtres */}
        {!loading && !error && (total > 0 || filtresActifs) && (
          <>
            <p
              className="mb-4 text-sm text-slate-500"
              aria-live="polite"
            >
              {total} événement
              {total > 1 ? "s" : ""}
              {pages > 1 && ` · page ${page} sur ${pages}`}
            </p>

            {/* Erreur d'inscription (déjà inscrit, complet…) */}
            {erreurInscription && (
              <p className={`${ERREUR} mb-4`}>{erreurInscription}</p>
            )}

            {enriched.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {enriched.map(({ event, visual }, index) => (
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
                  onClick={effacerFiltres}
                  className={secondaryButton}
                >
                  Effacer les filtres
                </button>
              </EmptyState>
            )}

            {/* PAGINATION : seulement s'il y a plus d'une page */}
            {pages > 1 && (
              <nav
                className="mt-10 flex flex-wrap items-center justify-center gap-2"
                aria-label="Pagination"
              >
                <button
                  type="button"
                  onClick={() => allerPage(page - 1)}
                  disabled={page === 1}
                  className={`${secondaryButton} disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  Précédent
                </button>

                {/* Un bouton par numéro de page : [1, 2, 3, …] */}
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => allerPage(p)}
                    aria-current={p === page ? "page" : undefined}
                    className={`size-11 rounded-xl border text-sm font-semibold transition ${
                      p === page
                        ? "border-violet-600 bg-violet-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:text-violet-700"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => allerPage(page + 1)}
                  disabled={page === pages}
                  className={`${secondaryButton} disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  Suivant
                </button>
              </nav>
            )}
          </>
        )}
      </div>

      {/* Notification de succès, disparaît toute seule */}
      <Toast message={toast} onFin={finToast} />
    </AppLayout>
  );
}

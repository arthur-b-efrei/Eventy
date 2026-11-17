import {
  Mic,
  Music,
  Trophy,
  Clapperboard,
  Dices,
  UtensilsCrossed,
  Presentation,
  CalendarHeart,
} from "lucide-react";

// Apparence de chaque genre : icône + couleurs de la carte.
// Les genres sont ceux du modèle Event.js (backend), choisis par l'organisateur
// dans le formulaire de création. Les classes Tailwind sont écrites en entier
// pour que Tailwind les détecte.
const VISUELS_PAR_GENRE = {
  Musique: {
    icon: Music,
    banner: "from-violet-500 to-indigo-500",
    iconColor: "text-violet-600",
  },
  Karaoké: {
    icon: Mic,
    banner: "from-rose-500 to-pink-500",
    iconColor: "text-rose-600",
  },
  Sport: {
    icon: Trophy,
    banner: "from-emerald-500 to-teal-500",
    iconColor: "text-emerald-600",
  },
  Cinéma: {
    icon: Clapperboard,
    banner: "from-amber-400 to-orange-500",
    iconColor: "text-amber-600",
  },
  Conférence: {
    icon: Presentation,
    banner: "from-blue-500 to-indigo-600",
    iconColor: "text-blue-600",
  },
  Jeux: {
    icon: Dices,
    banner: "from-indigo-500 to-violet-600",
    iconColor: "text-indigo-600",
  },
  Gastronomie: {
    icon: UtensilsCrossed,
    banner: "from-orange-400 to-rose-500",
    iconColor: "text-orange-600",
  },
  Autre: {
    icon: CalendarHeart,
    banner: "from-slate-500 to-slate-700",
    iconColor: "text-slate-600",
  },
};

// Renvoie l'apparence d'un événement à partir de son genre :
// { label, icon, banner, iconColor }
export function getEventVisual(event) {
  const genre = event?.genre;
  const visuel = VISUELS_PAR_GENRE[genre];

  // Genre inconnu ou absent (anciens événements) : apparence par défaut
  if (!visuel) {
    return { label: "Événement", ...VISUELS_PAR_GENRE.Autre };
  }

  return { label: genre, ...visuel };
}

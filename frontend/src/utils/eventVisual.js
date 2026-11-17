import {
  Mic,
  Music,
  Trophy,
  Dumbbell,
  Clapperboard,
  Mountain,
  Cake,
  Laptop,
  Gamepad2,
  Dices,
  UtensilsCrossed,
  Presentation,
  Palette,
  Plane,
  PartyPopper,
  CalendarHeart,
} from "lucide-react";

// Les classes sont écrites en entier pour que Tailwind les détecte.
const TONES = {
  rose: { banner: "from-rose-500 to-pink-500", iconColor: "text-rose-600" },
  violet: { banner: "from-violet-500 to-indigo-500", iconColor: "text-violet-600" },
  emerald: { banner: "from-emerald-500 to-teal-500", iconColor: "text-emerald-600" },
  teal: { banner: "from-teal-500 to-cyan-600", iconColor: "text-teal-600" },
  amber: { banner: "from-amber-400 to-orange-500", iconColor: "text-amber-600" },
  green: { banner: "from-green-500 to-emerald-600", iconColor: "text-green-600" },
  pink: { banner: "from-pink-500 to-fuchsia-500", iconColor: "text-pink-600" },
  sky: { banner: "from-sky-500 to-blue-600", iconColor: "text-sky-600" },
  indigo: { banner: "from-indigo-500 to-violet-600", iconColor: "text-indigo-600" },
  orange: { banner: "from-orange-400 to-rose-500", iconColor: "text-orange-600" },
  blue: { banner: "from-blue-500 to-indigo-600", iconColor: "text-blue-600" },
  fuchsia: { banner: "from-fuchsia-500 to-violet-600", iconColor: "text-fuchsia-600" },
  cyan: { banner: "from-cyan-500 to-sky-600", iconColor: "text-cyan-600" },
  slate: { banner: "from-slate-500 to-slate-700", iconColor: "text-slate-600" },
};

// L'ordre compte : en cas d'égalité, la catégorie la plus haute l'emporte.
// Les catégories spécifiques passent donc avant « Soirée », plus générique.
const CATEGORIES = [
  { id: "karaoke", label: "Karaoké", icon: Mic, tone: "rose",
    keywords: ["karaoke", "chant", "chanter", "blind test"] },
  { id: "musique", label: "Musique", icon: Music, tone: "violet",
    keywords: ["concert", "musique", "festival", "dj", "live", "rap", "jazz", "rock", "electro", "orchestre"] },
  { id: "sport", label: "Sport", icon: Trophy, tone: "emerald",
    keywords: ["foot", "football", "match", "basket", "tennis", "rugby", "volley", "handball", "padel", "tournoi", "sport"] },
  { id: "bien-etre", label: "Bien-être", icon: Dumbbell, tone: "teal",
    keywords: ["yoga", "fitness", "running", "footing", "muscu", "musculation", "pilates", "meditation"] },
  { id: "cinema", label: "Cinéma", icon: Clapperboard, tone: "amber",
    keywords: ["cinema", "cine", "film", "projection", "serie"] },
  { id: "plein-air", label: "Plein air", icon: Mountain, tone: "green",
    keywords: ["randonnee", "rando", "montagne", "balade", "nature", "pique-nique", "camping", "velo"] },
  { id: "anniversaire", label: "Anniversaire", icon: Cake, tone: "pink",
    keywords: ["anniversaire", "anniv", "birthday"] },
  { id: "tech", label: "Tech", icon: Laptop, tone: "sky",
    keywords: ["informatique", "code", "coding", "hackathon", "programmation", "developpement", "tech", "numerique", "web"] },
  { id: "jeux-video", label: "Jeux vidéo", icon: Gamepad2, tone: "indigo",
    keywords: ["jeux video", "jeu video", "gaming", "console", "esport", "lan", "manette", "switch", "playstation"] },
  { id: "jeux", label: "Jeux", icon: Dices, tone: "indigo",
    keywords: ["jeux de societe", "jeu de societe", "jeux", "jeu", "poker", "echecs", "escape game", "quiz"] },
  { id: "gastronomie", label: "Gastronomie", icon: UtensilsCrossed, tone: "orange",
    keywords: ["restaurant", "resto", "diner", "dejeuner", "brunch", "repas", "degustation", "cuisine", "apero", "barbecue", "bbq"] },
  { id: "conference", label: "Conférence", icon: Presentation, tone: "blue",
    keywords: ["conference", "talk", "meetup", "seminaire", "atelier", "workshop", "formation", "table ronde"] },
  { id: "culture", label: "Culture", icon: Palette, tone: "fuchsia",
    keywords: ["expo", "exposition", "musee", "art", "peinture", "theatre", "dessin", "photo"] },
  { id: "sortie", label: "Sortie", icon: Plane, tone: "cyan",
    keywords: ["voyage", "excursion", "visite", "week-end", "road trip"] },
  { id: "soiree", label: "Soirée", icon: PartyPopper, tone: "violet",
    keywords: ["soiree", "fete", "party", "bar", "club"] },
];

const DEFAULT_CATEGORY = {
  id: "autre",
  label: "Événement",
  icon: CalendarHeart,
  tone: "slate",
};

export function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Les expressions régulières sont compilées une seule fois, au chargement du module.
const MATCHERS = CATEGORIES.map((category) => ({
  category,
  patterns: category.keywords.map(
    (keyword) => new RegExp(`(^|[^a-z0-9])${escapeRegExp(keyword)}([^a-z0-9]|$)`)
  ),
}));

function withTone(category) {
  return { ...category, ...TONES[category.tone] };
}

export function getEventVisual(event) {
  const title = normalizeText(event?.titre);
  const description = normalizeText(event?.describe);

  let best = DEFAULT_CATEGORY;
  let bestScore = 0;

  for (const { category, patterns } of MATCHERS) {
    let score = 0;
    for (const pattern of patterns) {
      if (pattern.test(title)) score += 3;
      if (pattern.test(description)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = category;
    }
  }

  return withTone(best);
}
// Avatars par défaut, façon Discord : un emoji sur un rond de couleur, tiré au hasard à l'inscription.
export const EMOJIS = [
  "🦊", "🐙", "🦄", "🐸", "🐼", "🐨", "🦁", "🐯", "🐵", "🐧",
  "🦉", "🐝", "🐢", "🦋", "🐳", "🦖", "🌻", "🌵", "🍉", "🍕",
  "🌮", "🧁", "🎸", "🎲", "🪩", "🎈", "🚀", "⭐", "🍀", "🧃",
];

// Couleurs de la marque Eventy
export const COULEURS = ["#3A3DFF", "#FF5C7A", "#7FE0C2", "#FFB21E", "#B9A8FF"];

const auHasard = (liste) => liste[Math.floor(Math.random() * liste.length)];

export const emojiAuHasard = () => auHasard(EMOJIS);
export const couleurAuHasard = () => auHasard(COULEURS);

// Classes Tailwind réutilisées dans plusieurs pages (formulaires, messages, petits textes).
// Les mettre ici évite de recopier les mêmes longues listes de classes partout.
// Pour remplacer une de ces valeurs à un endroit précis, on ajoute "!" à la fin de la classe
// (ex : `${TEXTE_BAS} mt-2!`) : sinon deux classes qui règlent la même chose se battent.

export const MONO = 'font-mono text-xs uppercase tracking-[0.08em]'

export const FORMULAIRE = 'grid gap-[18px]'
export const CHAMP = 'grid gap-1.5'
export const LABEL = 'text-sm font-bold'
export const INPUT =
  'h-[50px] w-full rounded-[14px] border-[1.5px] border-bordure bg-white px-4 text-ardoise transition hover:border-gris focus:border-outremer focus:outline-none focus:ring-4 focus:ring-outremer/15'
export const AIDE = 'text-[13px] text-texte-doux'

export const ERREUR = 'rounded-xl bg-[#ffe5ea] px-3.5 py-3 text-sm font-semibold text-[#a1223b]'
export const INFO = 'rounded-xl bg-[#dcf7ee] px-3.5 py-3 text-sm font-semibold text-[#0b5a42]'

// Bouton qui ressemble à un lien (ex : "Renvoyer un code")
export const LIEN_BOUTON = 'cursor-pointer font-bold text-outremer underline'

// Petit texte centré sous un formulaire (ex : "Déjà un compte ? Connecte-toi")
export const TEXTE_BAS = 'mt-[22px] text-center text-[15px] text-texte-doux [&_a]:font-bold'

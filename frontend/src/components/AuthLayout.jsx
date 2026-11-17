import { Link } from 'react-router-dom'
import Logo, { Symbole } from './Logo.jsx'
import { MONO } from './ui.js'

// Mise en page commune aux pages Connexion, Inscription, Vérification…
// panneau Outremer à gauche (caché sur mobile), formulaire à droite.
export default function AuthLayout({ titre, sousTitre, accroche, children }) {
  return (
    <div className="grid min-h-dvh grid-cols-1 md:grid-cols-[5fr_6fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-outremer p-10 text-white md:flex">
        <Link to="/" className="relative z-10 self-start text-white no-underline">
          <Logo couleur="#FFFFFF" className="text-[28px]" />
        </Link>
        <Symbole
          className="absolute top-1/2 -right-[55%] w-[140%] -translate-y-1/2 animate-lent"
          couleur="rgba(255,255,255,0.12)"
        />
        <p className="relative max-w-[13ch] font-titre text-[clamp(30px,3.4vw,46px)] leading-[1.05] font-[650] tracking-[-0.03em]">
          {accroche}
        </p>
        <span className={`relative self-start rounded-xl bg-lampion px-4 py-2.5 text-ardoise ${MONO}`}>
          Jeu. 20:30 · Quiz au bar · 3 places
        </span>
      </aside>

      <main className="flex flex-col items-center justify-start gap-6 px-5 py-8 md:justify-center md:py-10">
        <Link to="/" className="text-ardoise no-underline md:hidden">
          <Logo couleur="#3A3DFF" className="text-[26px]" />
        </Link>
        <div className="w-full max-w-[420px] animate-carte">
          <h1 className="text-[clamp(32px,4vw,42px)] font-[750]">{titre}</h1>
          <p className="mt-2.5 mb-7 text-texte-doux">{sousTitre}</p>
          {children}
        </div>
      </main>
    </div>
  )
}

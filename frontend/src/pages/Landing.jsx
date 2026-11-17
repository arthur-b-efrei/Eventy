import LogoAnime from '../components/LogoAnime.jsx'
import Bouton from '../components/Bouton.jsx'
import { MONO } from '../components/ui.js'
import { useAuth } from '../context/AuthContext.js'

// Quelques places libres qui scintillent dans le fond (positions en %)
const PLACES_FOND = [
  { x: 8, y: 14, d: 0 },
  { x: 86, y: 10, d: 1.4 },
  { x: 18, y: 78, d: 2.6 },
  { x: 92, y: 64, d: 0.8 },
  { x: 62, y: 88, d: 3.4 },
  { x: 34, y: 22, d: 4.2 },
  { x: 74, y: 30, d: 2 },
]

// Types de plans qui défilent en bas de la page
const PLANS = ['Quiz au bar', 'Apéro langues', 'Foot du dimanche', 'Karaoké', 'Pétanque', 'Brunch', 'Expo', 'Escalade', 'Ciné en VO']

// Les blocs de texte apparaissent l'un après l'autre, après le logo
const APPARITION = 'animate-monte'

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-outremer text-white">
      {/* Fond "salle pleine" : une trame de places qui glisse doucement */}
      <div
        className="absolute inset-0 animate-trame bg-[radial-gradient(circle,rgba(255,255,255,0.11)_3px,transparent_3.6px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,transparent_18%,#000_75%)]"
        aria-hidden="true"
      >
        {PLACES_FOND.map((p, i) => (
          <span
            key={i}
            className="absolute size-3.5 animate-scintille rounded-full border-2 border-lampion opacity-0"
            style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${p.d}s` }}
          />
        ))}
      </div>

      <main className="relative flex flex-1 flex-col items-center justify-center gap-[22px] px-5 pt-14 pb-10 text-center">
        <LogoAnime />

        <h1 className={`mt-[18px] max-w-[18ch] text-[clamp(26px,4vw,44px)] font-semibold ${APPARITION} [animation-delay:1.6s]`}>
          Il reste une place à la table. <em className="text-lampion not-italic">C'est la tienne.</em>
        </h1>
        <p className={`max-w-[46ch] text-[17px] text-white/80 ${APPARITION} [animation-delay:1.75s]`}>
          Rejoins des petits groupes près de chez toi pour un verre, un quiz ou un footing. Tu réserves ta place, tu viens, tu rencontres.
        </p>

        <div className={`mt-2 flex w-full flex-wrap justify-center gap-3.5 ${APPARITION} [animation-delay:1.9s]`}>
          {user ? (
            <Bouton to="/accueil" variante="lampion" className="w-full sm:w-auto sm:min-w-[200px]">
              Voir les plans, {user.name}
            </Bouton>
          ) : (
            <>
              <Bouton to="/inscription" variante="lampion" className="w-full sm:w-auto sm:min-w-[200px]">
                Créer un compte
              </Bouton>
              <Bouton to="/connexion" variante="contour" className="w-full sm:w-auto sm:min-w-[200px]">
                Se connecter
              </Bouton>
            </>
          )}
        </div>
      </main>

      {/* Bandeau des types de plans qui défile en continu */}
      <div className={`relative overflow-hidden border-t border-white/20 py-4 ${APPARITION} [animation-delay:2.1s]`} aria-hidden="true">
        <div className="flex w-max animate-defile">
          {[...PLANS, ...PLANS].map((plan, i) => (
            <span key={i} className={`inline-flex items-center gap-[26px] pr-[26px] whitespace-nowrap text-white/75 ${MONO}`}>
              {plan}
              <i className="size-2 rounded-full border-[1.5px] border-lampion" />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

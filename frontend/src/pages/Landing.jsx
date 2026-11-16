import { Link } from 'react-router-dom'
import LogoAnime from '../components/LogoAnime.jsx'
import { useAuth } from '../context/AuthContext.js'
import './Landing.css'

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

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="landing">
      <div className="landing-fond" aria-hidden="true">
        {PLACES_FOND.map((p, i) => (
          <span key={i} className="landing-scintille" style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${p.d}s` }} />
        ))}
      </div>

      <main className="landing-centre">
        <LogoAnime />

        <h1 className="landing-titre">
          Il reste une place à la table. <em>C'est la tienne.</em>
        </h1>
        <p className="landing-texte">
          Rejoins des petits groupes près de chez toi pour un verre, un quiz ou un footing. Tu réserves ta place, tu viens, tu rencontres.
        </p>

        <div className="landing-boutons">
          {user ? (
            <Link to="/accueil" className="btn btn-lampion">
              Voir les plans, {user.name}
            </Link>
          ) : (
            <>
              <Link to="/inscription" className="btn btn-lampion">
                Créer un compte
              </Link>
              <Link to="/connexion" className="btn btn-contour">
                Se connecter
              </Link>
            </>
          )}
        </div>
      </main>

      <div className="landing-bandeau" aria-hidden="true">
        <div className="landing-defile">
          {[...PLANS, ...PLANS].map((plan, i) => (
            <span key={i} className="mono">
              {plan}
              <i />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

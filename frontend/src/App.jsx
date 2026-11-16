import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthProvider from './context/AuthProvider.jsx'
import { useAuth } from './context/AuthContext.js'
import Landing from './pages/Landing.jsx'
import Connexion from './pages/Connexion.jsx'
import Inscription from './pages/Inscription.jsx'
import Accueil from './pages/Accueil.jsx'
import Verification from './pages/Verification.jsx'
import Bienvenue from './pages/Bienvenue.jsx'
import MotDePasseOublie from './pages/MotDePasseOublie.jsx'

// Page réservée aux users connectés : sinon, retour à la landing page
// (ou à la connexion si la session vient d'expirer, pour pouvoir se reconnecter tout de suite)
function RouteConnectee({ children }) {
  const { token, expiree } = useAuth()
  if (token) return children
  return <Navigate to={expiree ? '/connexion' : '/'} replace />
}

// Page réservée aux visiteurs : si on est déjà connecté, direction l'accueil
// (ou une autre page avec "redirection", ex : /bienvenue juste après la vérification du code)
function RouteVisiteur({ children, redirection = '/accueil' }) {
  const { token } = useAuth()
  return token ? <Navigate to={redirection} replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/connexion" element={<RouteVisiteur><Connexion /></RouteVisiteur>} />
          <Route path="/inscription" element={<RouteVisiteur><Inscription /></RouteVisiteur>} />
          <Route path="/mot-de-passe-oublie" element={<RouteVisiteur><MotDePasseOublie /></RouteVisiteur>} />
          <Route path="/verification" element={<RouteVisiteur redirection="/bienvenue"><Verification /></RouteVisiteur>} />
          <Route path="/bienvenue" element={<RouteConnectee><Bienvenue /></RouteConnectee>} />
          <Route path="/accueil" element={<RouteConnectee><Accueil /></RouteConnectee>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

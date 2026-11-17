
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthProvider from './context/AuthProvider.jsx'
import { useAuth } from './context/AuthContext.js'

import Landing from './pages/Landing.jsx'
import Connexion from './pages/Connexion.jsx'
import Inscription from './pages/Inscription.jsx'
import Accueil from './pages/Accueil.jsx'
import MesReservations from './pages/MesReservations.jsx'

// Ta page de création d'événement
import CreateEvent from './pages/createEvent.jsx'

import Profil from './pages/Profil.jsx'
import Discussion from './pages/Discussion.jsx'
import Verification from './pages/Verification.jsx'
import Bienvenue from './pages/Bienvenue.jsx'
import MotDePasseOublie from './pages/MotDePasseOublie.jsx'

// Routes accessibles uniquement aux utilisateurs connectés
function RouteConnectee({ children }) {
  const { token, expiree } = useAuth()

  if (token) return children

  return <Navigate to={expiree ? '/connexion' : '/'} replace />
}

// Routes accessibles aux visiteurs
function RouteVisiteur({ children, redirection = '/accueil' }) {
  const { token } = useAuth()

  return token
    ? <Navigate to={redirection} replace />
    : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route
            path="/connexion"
            element={<RouteVisiteur><Connexion /></RouteVisiteur>}
          />

          <Route
            path="/inscription"
            element={<RouteVisiteur><Inscription /></RouteVisiteur>}
          />

          <Route
            path="/mot-de-passe-oublie"
            element={<RouteVisiteur><MotDePasseOublie /></RouteVisiteur>}
          />

          <Route
            path="/verification"
            element={
              <RouteVisiteur redirection="/bienvenue">
                <Verification />
              </RouteVisiteur>
            }
          />

          <Route
            path="/bienvenue"
            element={<RouteConnectee><Bienvenue /></RouteConnectee>}
          />

          <Route
            path="/accueil"
            element={<RouteConnectee><Accueil /></RouteConnectee>}
          />

          <Route
            path="/mes-reservations"
            element={<RouteConnectee><MesReservations /></RouteConnectee>}
          />

          <Route
            path="/creer-evenement"
            element={<RouteConnectee><CreateEvent /></RouteConnectee>}
          />

          <Route
            path="/evenements/:id/discussion"
            element={<RouteConnectee><Discussion /></RouteConnectee>}
          />

          <Route
            path="/profil"
            element={<RouteConnectee><Profil /></RouteConnectee>}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

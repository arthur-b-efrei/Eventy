import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthProvider from './context/AuthProvider.jsx'
import { useAuth } from './context/AuthContext.js'
import Landing from './pages/Landing.jsx'
import Connexion from './pages/Connexion.jsx'
import Inscription from './pages/Inscription.jsx'
import Accueil from './pages/Accueil.jsx'

// Page réservée aux users connectés : sinon, retour à la landing page
function RouteConnectee({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/" replace />
}

// Page réservée aux visiteurs : si on est déjà connecté, direction l'accueil
function RouteVisiteur({ children }) {
  const { token } = useAuth()
  return token ? <Navigate to="/accueil" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/connexion" element={<RouteVisiteur><Connexion /></RouteVisiteur>} />
          <Route path="/inscription" element={<RouteVisiteur><Inscription /></RouteVisiteur>} />
          <Route path="/accueil" element={<RouteConnectee><Accueil /></RouteConnectee>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

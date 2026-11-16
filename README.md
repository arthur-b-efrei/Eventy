# Eventy

Appli pour créer des events (soirée au bar, sortie…) et y participer pour rencontrer de nouvelles personnes.

## Structure du projet

```
Eventy/
├── frontend/          → l'appli React + Vite (JavaScript / JSX)
│   └── src/
│       ├── App.jsx        → les routes (/, /connexion, /inscription, /accueil)
│       ├── index.css      → couleurs, polices et boutons de la marque
│       ├── api/           → appels à l'API backend
│       ├── context/       → user connecté + token (AuthProvider, useAuth)
│       ├── components/    → Logo, LogoAnime, AuthLayout…
│       └── pages/         → Landing, Connexion, Inscription, Accueil
└── backend/           → l'API Node.js + Express
    ├── .env.example   → modèle du fichier .env
    └── src/
        ├── server.js  → démarre le serveur
        ├── app.js     → configuration d'Express, branche les routes
        ├── config/
        │   └── db.js  → connexion à MongoDB
        ├── routes/        → les adresses de l'API (ex : /api/auth/login)
        ├── controllers/   → ce que fait chaque route
        ├── middleware/
        │   └── auth.js    → vérifie le token JWT (routes protégées)
        └── models/    → schémas Mongoose
            ├── User.js
            ├── Event.js
            ├── Reservation.js → qui participe à quel event
            └── Log.js         → historique des actions
```

## Lancer le projet

### Backend

```bash
cd backend
npm install
cp .env.example .env   # puis remplir MONGO_URI et JWT_SECRET
npm run dev
```

L'API tourne sur http://localhost:5000 (test : http://localhost:5000/api/health).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Le front tourne sur http://localhost:5173 et appelle l'API sur http://localhost:5000/api
(modifiable avec `VITE_API_URL` dans `frontend/.env`, voir `.env.example`).

## Routes de l'API

| Méthode | Adresse | Rôle | Token ? |
|---|---|---|---|
| POST | `/api/auth/register` | Inscription (name, email, password, date_naissance) | non |
| POST | `/api/auth/login` | Connexion (email, password) → renvoie `token` + `user` | non |
| GET | `/api/auth/me` | Infos du user connecté | oui |

Pour les routes protégées, le front envoie l'en-tête `Authorization: Bearer <token>`.

## Base de données (MongoDB)

- **User** : name, email, password (crypté), date_naissance, role, date de création
- **Event** : titre, describe, nb_user, nb_max_user, id_creator, localisation, date_event
- **Reservation** : id_user, id_event, describe (message du participant), date d'inscription
- **Log** (historique) : describe (l'action), id_event, id_user, date

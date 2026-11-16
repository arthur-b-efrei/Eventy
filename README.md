# Eventy

Appli pour créer des events (soirée au bar, sortie…) et y participer pour rencontrer de nouvelles personnes.

## Structure du projet

```
Eventy/
├── frontend/          → l'appli React + Vite (TypeScript)
│   └── src/
└── backend/           → l'API Node.js + Express
    ├── .env.example   → modèle du fichier .env
    └── src/
        ├── server.js  → démarre le serveur
        ├── app.js     → configuration d'Express
        ├── config/
        │   └── db.js  → connexion à MongoDB
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

## Base de données (MongoDB)

- **User** : name, email, password (crypté), date_naissance, role, date de création
- **Event** : titre, describe, nb_user, nb_max_user, id_creator, localisation, date_event
- **Reservation** : id_user, id_event, describe (message du participant), date d'inscription
- **Log** (historique) : describe (l'action), id_event, id_user, date

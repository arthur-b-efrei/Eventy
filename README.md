# Eventy

Appli pour créer des events (soirée au bar, sortie…) et y participer pour rencontrer de nouvelles personnes.

## Structure du projet

```
Eventy/
├── frontend/          → l'appli React + Vite (JavaScript / JSX), style en Tailwind CSS v4
│   └── src/
│       ├── App.jsx        → les routes (/, /connexion, /inscription, /accueil…)
│       ├── index.css      → thème Tailwind : couleurs, polices et animations de la marque
│       ├── api/           → appels à l'API backend
│       ├── context/       → user connecté + token (AuthProvider, useAuth)
│       ├── components/    → Bouton, Logo, LogoAnime, AuthLayout, Avatar…
│       │   └── ui.js      → classes Tailwind partagées (champs, messages d'erreur…)
│       └── pages/         → Landing, Connexion, Inscription, Bienvenue, Accueil…
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
| POST | `/api/auth/register` | Inscription (name, email, password, date_naissance) → envoie un code par email | non |
| POST | `/api/auth/verify-email` | Vérifie le code (email, code) → renvoie `token` + `user` | non |
| POST | `/api/auth/resend-code` | Renvoie un code (email), 1 fois par minute max | non |
| POST | `/api/auth/login` | Connexion (email, password) → renvoie `token` + `user`, ou 403 `EMAIL_NON_VERIFIE` | non |
| POST | `/api/auth/forgot-password` | Mot de passe oublié : envoie un code (email), réponse identique que le compte existe ou non | non |
| POST | `/api/auth/reset-password` | Nouveau mot de passe (email, code, password) → renvoie `token` + `user` | non |
| GET | `/api/auth/me` | Infos du user connecté | oui |
| PATCH | `/api/users/me` | Modifie le prénom (`name`) et/ou la date de naissance — l'email et le rôle ne sont pas modifiables | oui |
| PUT | `/api/users/me/password` | Change le mot de passe (`ancien`, `nouveau`) → nouveau `token`, les autres appareils sont déconnectés | oui |
| DELETE | `/api/users/me` | Supprime le compte (`password` pour confirmer), avec sa photo, ses réservations et ses events | oui |
| PUT | `/api/users/me/avatar` | Envoie sa photo de profil (`image` en data URL JPEG/PNG/WebP, 500 Ko max) | oui |
| DELETE | `/api/users/me/avatar` | Supprime sa photo, retour à l'emoji | oui |
| GET | `/api/users/:id/avatar` | Affiche la photo d'un user (mise en cache 1 an, l'URL change à chaque nouvelle photo) | non |
| GET | `/api/events` | Liste des events. Avec `?lat=…&lng=…&rayon=…` (mètres, 10 km par défaut, 100 km max) : seulement ceux autour, du plus proche au plus loin, avec `distance` en mètres | non |
| POST | `/api/events` | Crée un event. L'adresse (`localisation`) est géocodée par le serveur : introuvable → 400 `errors.localisation` | oui |

Pour les routes protégées, le front envoie l'en-tête `Authorization: Bearer <token>`.

## Style (Tailwind CSS)

Le front utilise **Tailwind CSS v4** (plugin `@tailwindcss/vite`). Les couleurs de la marque sont des classes comme les autres :

| Couleur | Classes | Usage |
|---|---|---|
| Outremer `#3A3DFF` | `bg-outremer`, `text-outremer`… | couleur principale |
| Lampion `#FFB21E` | `bg-lampion`… | la « place libre », bouton principal |
| Grenadine, Menthe, Lilas | `bg-grenadine`, `bg-menthe`, `bg-lilas` | couleurs secondaires |
| Ardoise, Gris, Nappe | `text-ardoise`, `text-gris`, `bg-nappe` | textes et fonds |

Polices : `font-titre` (Bricolage Grotesque), `font-sans` (Manrope, par défaut), `font-mono` (DM Mono).
Pour les boutons, utiliser le composant `<Bouton variante="lampion | outremer | contour | discret">`.

## Events à proximité (« Autour de moi »)

Détails et choix techniques : [docs/geolocalisation.md](docs/geolocalisation.md).

- **Créer un event** : le champ « Adresse exacte » propose des adresses pendant la saisie (composant `ChampAdresse`, API Adresse de la **Géoplateforme IGN**, gratuite et sans clé, France uniquement). À l'envoi, le **serveur** recalcule les coordonnées (`backend/src/services/geocodage.js`) et enregistre l'adresse officielle. Adresse introuvable ou trop approximative (score < 0,5) : l'event est refusé.
- **Accueil** : bouton « Autour de moi » (position du navigateur) ou « choisir une ville » si la position est refusée, rayon de 2 à 25 km, distance affichée sur chaque carte (« à 650 m »).
- **MongoDB** : champ `Event.position` au format GeoJSON (`[longitude, latitude]`, dans cet ordre !) avec un index `2dsphere`, et recherche avec `$geoNear`.
- **RGPD** : la position de l'utilisateur sert seulement à la recherche, elle n'est jamais enregistrée.
- **Events créés avant cette fonctionnalité** : ils n'ont pas de coordonnées et n'apparaissent pas dans « Autour de moi ». Pour les géocoder une fois : `cd backend && npm run geocoder:events` (les adresses introuvables sont listées à la fin).

## Mot de passe oublié et sessions

- « Mot de passe oublié ? » sur la page de connexion : code à 6 chiffres par email (même système que la vérification, mais un code de vérification ne peut pas servir à changer le mot de passe), puis choix d'un nouveau mot de passe.
- Après un changement de mot de passe, **les tokens créés avant ne marchent plus** (champ `mdp_change_le`) : les autres appareils sont déconnectés.
- Le middleware `protect` vérifie aussi que le compte existe toujours.
- Côté front, si le serveur refuse le token (expiré, mot de passe changé…), l'appli déconnecte le user et l'envoie sur la connexion avec le message « Ta session a expiré ». Le token est aussi vérifié à l'ouverture de l'appli.

## Avatar et photo de profil

- À l'inscription, chaque user reçoit un **avatar emoji** tiré au hasard sur un rond aux couleurs de la marque, comme les avatars par défaut de Discord.
- Juste après la vérification du code, la page `/bienvenue` propose d'ajouter une photo, ou de passer et de garder l'emoji.
- La photo est recadrée en carré et réduite à 256 × 256 **dans le navigateur** (environ 20 à 40 Ko), puis rangée dans MongoDB (collection `photoprofils`). Le serveur vérifie que c'est une vraie image en lisant ses premiers octets.

## Vérification de l'email (code OTP)

À l'inscription, un code à 6 chiffres est envoyé par email. Le compte n'est utilisable qu'après la saisie du code.

- Code tiré avec `crypto.randomInt`, stocké crypté (bcrypt), valable 10 minutes, supprimé automatiquement par MongoDB (index TTL).
- 5 essais maximum par code, 1 nouveau code par minute maximum, et limites par IP (`express-rate-limit`).
- Envoi avec l'**API HTTP de Brevo** (gratuit jusqu'à 300 emails par jour). On passe par HTTPS et pas par SMTP, parce que beaucoup d'hébergeurs bloquent les ports SMTP.
- **En local sans clé Brevo**, l'email s'affiche dans le terminal du backend : le code est dedans.
- **Pour envoyer de vrais emails** : créer un compte Brevo, valider une adresse d'expéditeur, créer une clé API, puis remplir `BREVO_API_KEY` et `MAIL_FROM_EMAIL` dans `backend/.env`.

## Base de données (MongoDB)

- **User** : name, email, password (crypté), date_naissance, role, email_verifie, date de création
- **CodeVerification** : id_user, but (verification ou reinitialisation), code_hash, tentatives, expire_le
- **PhotoProfil** : id_user, type, data (l'image)
- User.avatar : emoji, couleur, photo_version
- **Event** : titre, describe, nb_user, nb_max_user, id_creator, localisation (adresse), position (coordonnées GeoJSON, index `2dsphere`), date_event, genre, image
- **Reservation** : id_user, id_event, describe (message du participant), date d'inscription
- **Log** (historique) : describe (l'action), id_event, id_user, date

## Documentation

- [Events à proximité (géolocalisation)](docs/geolocalisation.md) : comment montrer les events autour de l'utilisateur, façon Too Good To Go.

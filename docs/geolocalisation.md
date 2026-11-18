# Events à proximité (façon Too Good To Go)

> **Implémenté** (étapes 1 à 5 ci-dessous ; la carte reste en option). Résumé dans le README, section « Events à proximité ».
> URL vérifiée : `https://data.geopf.fr/geocodage/search` (avec `autocomplete=1` pour les suggestions, `type=municipality` pour les villes).

Objectif : utiliser la position actuelle de l'utilisateur pour lui montrer les events autour de lui, du plus proche au plus loin (« à 650 m »).

**Pas besoin d'une API cartographique.** Il faut 3 briques, et une seule appelle un service externe (gratuit) :

| Brique | Qui s'en charge | Prix |
|---|---|---|
| 1. Position de l'utilisateur | Le navigateur (API Geolocation) | Gratuit, sans clé |
| 2. Adresse de l'event → coordonnées (« géocodage ») | API Adresse de l'État | Gratuit, sans clé |
| 3. Recherche des events proches | MongoDB (index `2dsphere`) | Gratuit |
| *(option)* Afficher une carte | Leaflet + OpenStreetMap | Gratuit, sans clé |

---

## 1. Position de l'utilisateur : le navigateur

L'API Geolocation est intégrée à tous les navigateurs.

```js
navigator.geolocation.getCurrentPosition(
  (pos) => {
    const { latitude, longitude } = pos.coords
    // -> appeler l'API avec ces coordonnées
  },
  () => {
    // refusé ou indisponible -> plan B
  },
  { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
)
```

- Le navigateur **demande l'autorisation** à l'utilisateur, qui peut refuser.
- Ça ne fonctionne qu'en **HTTPS** (sauf sur `localhost` en développement).
- **Plan B** si refus : champ « Ta ville » (géocodé avec la brique 2) ou liste de villes.

## 2. Géocodage : adresse → latitude / longitude

Quand un user crée un event (« 12 rue Oberkampf, Paris »), on convertit l'adresse en coordonnées **une seule fois, à la création**, et on les enregistre en base.

| Service | Prix | Remarque |
|---|---|---|
| **API Adresse de l'État** (Géoplateforme IGN) | Gratuit, sans clé | Le plus simple pour la France. Fait aussi l'**autocomplétion** pendant la saisie. |
| Nominatim (OpenStreetMap) | Gratuit | Monde entier, mais 1 requête/seconde max : pas pour un vrai trafic. |
| Google Maps / Mapbox | Payant au-delà d'un quota | Clé + carte bancaire. Inutile pour nous. |

Exemple avec l'API Adresse (l'ancienne adresse `api-adresse.data.gouv.fr` est remplacée par la Géoplateforme : vérifier l'URL dans leur doc avant de coder) :

```js
const url = `https://data.geopf.fr/geocodage/search?q=${encodeURIComponent(adresse)}&limit=1`
const reponse = await fetch(url)
const donnees = await reponse.json()
const [longitude, latitude] = donnees.features[0].geometry.coordinates
```

> La réponse est au format GeoJSON : **longitude en premier**, puis latitude.

## 3. Recherche des events proches : MongoDB

MongoDB gère la géographie nativement.

**Dans le modèle `Event`** : on garde `localisation` (l'adresse en texte, pour l'affichage) et on **ajoute** `position` (les coordonnées, pour la recherche).

```js
position: {
  type: { type: String, enum: ["Point"], default: "Point" },
  coordinates: { type: [Number] }, // [longitude, latitude]
},

// Index géographique, obligatoire pour $near
eventSchema.index({ position: "2dsphere" });
```

**Dans la route** `GET /api/events?lat=48.86&lng=2.37&rayon=5000` :

```js
const events = await Event.find({
  position: {
    $near: {
      $geometry: { type: "Point", coordinates: [lng, lat] },
      $maxDistance: rayon, // en mètres
    },
  },
}); // déjà triés du plus proche au plus loin
```

Pour renvoyer aussi la distance de chaque event (« à 650 m »), utiliser l'agrégation `$geoNear` avec `distanceField: "distance"`.

## 4. (Option) La carte

- **Leaflet + fonds de carte OpenStreetMap**, avec `react-leaflet` : gratuit et sans clé, à condition d'afficher la mention « © OpenStreetMap ». Respecter leur politique d'usage des tuiles (pas de gros trafic).
- **MapLibre** pour un rendu plus moderne (il faut une source de tuiles vectorielles).

---

## Points d'attention

- **RGPD** : la position est une donnée personnelle. On l'envoie seulement dans la recherche et **on ne la stocke pas**. Demander l'accord et expliquer à quoi elle sert (« pour te montrer les plans près de toi »).
- **Ordre des coordonnées** : GeoJSON et MongoDB veulent `[longitude, latitude]`, alors que le navigateur donne `latitude, longitude`. C'est l'erreur la plus fréquente.
- **Events déjà en base** : les géocoder une fois avec un petit script.
- **Adresse introuvable** : refuser la création de l'event, ou proposer les suggestions de l'autocomplétion.

## Étapes pour l'implémenter

1. Ajouter `position` + l'index `2dsphere` au modèle `Event`.
2. À la création d'un event : géocoder `localisation` et remplir `position`.
3. Formulaire « Créer un événement » : autocomplétion de l'adresse avec l'API Adresse.
4. Route `GET /api/events` : accepter `lat`, `lng`, `rayon` et trier par distance.
5. Page Accueil : demander la position, appeler la route, afficher « à X m » sur chaque event (plan B si refus).
6. *(option)* Ajouter une carte Leaflet.
